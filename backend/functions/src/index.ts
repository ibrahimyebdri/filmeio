import * as cheerio from "cheerio";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";

initializeApp();

const db = getFirestore();
const SOURCE_BASE_URL = "https://qeseh.net";
const ARCHIVE_URL = `${SOURCE_BASE_URL}/category/alarshif/`;
const ALLOWED_PROXY_HOSTS = new Set(["qeseh.net", "www.qeseh.net"]);
const ALLOWED_PLAYER_HOSTS = new Set(["arabhd.onl", "arabveturk.com"]);

type SeriesSummary = {
  title: string;
  slug: string;
  poster?: string;
  year?: string;
  rating?: string;
  genre?: string;
  description?: string;
};

type EpisodeSummary = {
  title: string;
  slug: string;
  seriesTitle?: string;
  poster?: string;
  episodeNumber?: string;
  publishedAt?: string;
};

type StreamServer = {
  name: string;
  embedUrl: string;
  host?: string;
  quality?: string;
};

type SeriesDetails = SeriesSummary & {
  status?: string;
  seasons?: string;
  episodes: EpisodeSummary[];
};

type EpisodeDetails = EpisodeSummary & {
  description?: string;
  servers: StreamServer[];
  previousEpisodeSlug?: string;
  nextEpisodeSlug?: string;
};

function setCors(res: Parameters<Parameters<typeof onRequest>[0]>[1]) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function sendJson(res: Parameters<Parameters<typeof onRequest>[0]>[1], data: unknown, status = 200) {
  setCors(res);
  res.status(status).json(data);
}

function endpoint(handler: Parameters<typeof onRequest>[0]) {
  return onRequest(
    {
      cors: true,
      region: "us-central1",
      timeoutSeconds: 60,
      memory: "512MiB"
    },
    async (req, res) => {
      setCors(res);

      if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
      }

      if (req.method !== "GET") {
        sendJson(res, { error: "Methode non autorisee" }, 405);
        return;
      }

      try {
        await handler(req, res);
      } catch (error) {
        console.error(error);
        sendJson(res, { error: "Erreur serveur Filmieo" }, 500);
      }
    }
  );
}

function absoluteUrl(value?: string) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value, SOURCE_BASE_URL).toString();
  } catch {
    return undefined;
  }
}

function slugFromUrl(value?: string) {
  const url = absoluteUrl(value);

  if (!url) {
    return "";
  }

  const pathname = new URL(url).pathname.replace(/\/$/, "");
  const parts = pathname.split("/").filter(Boolean);
  return parts.at(-1) ?? "";
}

function text($: cheerio.CheerioAPI, element: any, selector?: string) {
  const scoped = typeof element?.find === "function" ? element : $(element);
  const target = selector ? scoped.find(selector).first() : scoped;
  return target.text().replace(/\s+/g, " ").trim();
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "FilmieoBot/1.0 (+https://filmieo.local)"
    }
  });

  if (!response.ok) {
    throw new Error(`Source returned ${response.status}`);
  }

  return response.text();
}

function dedupeBySlug<T extends { slug: string }>(items: T[]) {
  const map = new Map<string, T>();

  items.forEach((item) => {
    if (item.slug && !map.has(item.slug)) {
      map.set(item.slug, item);
    }
  });

  return Array.from(map.values());
}

function extractSeriesFromHtml(html: string): SeriesSummary[] {
  const $ = cheerio.load(html);
  const items: SeriesSummary[] = [];

  $("article, .post, .item, .movie, .series, li").each((_, element) => {
    const href = $(element).find('a[href*="/yeni-show/"]').first().attr("href");
    const slug = slugFromUrl(href);

    if (!slug) {
      return;
    }

    const title =
      $(element).find("h1, h2, h3, .title, .post-title").first().text().trim() ||
      $(element).find("a").first().attr("title") ||
      text($, element, "a");
    const poster = absoluteUrl($(element).find("img").first().attr("src") ?? $(element).find("img").first().attr("data-src"));

    items.push({
      title: title || slug.replace(/-/g, " "),
      slug,
      poster,
      year: text($, element, ".year"),
      rating: text($, element, ".rating, .imdb"),
      genre: text($, element, ".genre, .category")
    });
  });

  return dedupeBySlug(items).slice(0, 60);
}

function extractEpisodesFromHtml(html: string): EpisodeSummary[] {
  const $ = cheerio.load(html);
  const items: EpisodeSummary[] = [];

  $("article, .post, .item, .episode, li").each((_, element) => {
    const href = $(element).find('a[href*="/clarus/"]').first().attr("href");
    const slug = slugFromUrl(href);

    if (!slug) {
      return;
    }

    const title =
      $(element).find("h1, h2, h3, .title, .post-title").first().text().trim() ||
      $(element).find("a").first().attr("title") ||
      text($, element, "a");
    const poster = absoluteUrl($(element).find("img").first().attr("src") ?? $(element).find("img").first().attr("data-src"));

    items.push({
      title: title || slug.replace(/-/g, " "),
      slug,
      poster,
      seriesTitle: text($, element, ".series-title, .show-title"),
      episodeNumber: text($, element, ".episode-number, .number"),
      publishedAt: text($, element, "time, .date")
    });
  });

  return dedupeBySlug(items).slice(0, 80);
}

async function scrapeArchive() {
  return extractSeriesFromHtml(await fetchHtml(ARCHIVE_URL));
}

async function scrapeHomeEpisodes() {
  return extractEpisodesFromHtml(await fetchHtml(SOURCE_BASE_URL));
}

async function scrapeSeriesDetails(slug: string): Promise<SeriesDetails> {
  const url = `${SOURCE_BASE_URL}/yeni-show/${encodeURIComponent(slug)}/`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const title = $("h1").first().text().trim() || slug.replace(/-/g, " ");
  const poster = absoluteUrl($("img").first().attr("src") ?? $("img").first().attr("data-src"));
  const description = $(".story, .description, .content, article p").first().text().replace(/\s+/g, " ").trim();

  return {
    title,
    slug,
    poster,
    description,
    year: text($, $.root(), ".year"),
    rating: text($, $.root(), ".rating, .imdb"),
    genre: text($, $.root(), ".genre, .category"),
    status: text($, $.root(), ".status"),
    seasons: text($, $.root(), ".season, .seasons"),
    episodes: extractEpisodesFromHtml(html)
  };
}

async function scrapeEpisodeDetails(slug: string): Promise<EpisodeDetails> {
  const url = `${SOURCE_BASE_URL}/clarus/${encodeURIComponent(slug)}/`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const title = $("h1").first().text().trim() || slug.replace(/-/g, " ");
  const servers: StreamServer[] = [];

  $("iframe[src], a[href]").each((_, element) => {
    const rawUrl = $(element).attr("src") ?? $(element).attr("href");
    const embedUrl = absoluteUrl(rawUrl);

    if (!embedUrl) {
      return;
    }

    const host = new URL(embedUrl).hostname.replace(/^www\./, "");

    if (!ALLOWED_PLAYER_HOSTS.has(host)) {
      return;
    }

    servers.push({
      name: host.includes("arabhd") ? "Arab HD" : "estream",
      embedUrl,
      host,
      quality: text($, element, ".quality") || "HD"
    });
  });

  return {
    title,
    slug,
    seriesTitle: text($, $.root(), ".series-title, .show-title"),
    description: $(".story, .description, article p").first().text().replace(/\s+/g, " ").trim(),
    servers
  };
}

async function readCollection<T>(collection: string, limit = 50) {
  const snapshot = await db.collection(collection).orderBy("updatedAt", "desc").limit(limit).get();
  return snapshot.docs.map((doc) => doc.data() as T);
}

async function writeCollection<T extends { slug: string }>(collection: string, items: T[]) {
  const batch = db.batch();

  items.forEach((item) => {
    batch.set(
      db.collection(collection).doc(item.slug),
      {
        ...item,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
  });

  await batch.commit();
}

export const latestSeries = endpoint(async (_req, res) => {
  let series = await readCollection<SeriesSummary>("latestSeries");

  if (!series.length) {
    series = await scrapeArchive();
    await writeCollection("latestSeries", series);
  }

  sendJson(res, series);
});

export const latestEpisodes = endpoint(async (_req, res) => {
  let episodes = await readCollection<EpisodeSummary>("latestEpisodes");

  if (!episodes.length) {
    episodes = await scrapeHomeEpisodes();
    await writeCollection("latestEpisodes", episodes);
  }

  sendJson(res, episodes);
});

export const searchSeries = endpoint(async (req, res) => {
  const query = String(req.query.q ?? "").trim().toLowerCase();

  if (!query) {
    sendJson(res, []);
    return;
  }

  let series = await readCollection<SeriesSummary>("latestSeries", 100);

  if (!series.length) {
    series = await scrapeArchive();
    await writeCollection("latestSeries", series);
  }

  sendJson(
    res,
    series.filter((item) => item.title.toLowerCase().includes(query))
  );
});

export const getSeries = endpoint(async (req, res) => {
  const slug = String(req.query.slug ?? "").trim();

  if (!slug) {
    sendJson(res, { error: "Parametre slug requis" }, 400);
    return;
  }

  const ref = db.collection("series").doc(slug);
  const cached = await ref.get();

  if (cached.exists) {
    sendJson(res, cached.data());
    return;
  }

  const details = await scrapeSeriesDetails(slug);
  await ref.set({ ...details, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  sendJson(res, details);
});

export const getEpisode = endpoint(async (req, res) => {
  const slug = String(req.query.slug ?? "").trim();

  if (!slug) {
    sendJson(res, { error: "Parametre slug requis" }, 400);
    return;
  }

  const ref = db.collection("episodes").doc(slug);
  const cached = await ref.get();

  if (cached.exists) {
    sendJson(res, cached.data());
    return;
  }

  const details = await scrapeEpisodeDetails(slug);
  await ref.set({ ...details, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  sendJson(res, details);
});

export const proxyHtml = endpoint(async (req, res) => {
  const target = String(req.query.url ?? "");
  const parsed = new URL(target);
  const host = parsed.hostname.replace(/^www\./, "");

  if (!ALLOWED_PROXY_HOSTS.has(host)) {
    sendJson(res, { error: "Domaine non autorise" }, 403);
    return;
  }

  setCors(res);
  res.type("text/html").send(await fetchHtml(parsed.toString()));
});

export const scrapeCron = endpoint(async (_req, res) => {
  const [series, episodes] = await Promise.all([scrapeArchive(), scrapeHomeEpisodes()]);
  await Promise.all([writeCollection("latestSeries", series), writeCollection("latestEpisodes", episodes)]);

  sendJson(res, {
    ok: true,
    latestSeriesCount: series.length,
    latestEpisodesCount: episodes.length,
    message: "Cache Firestore mis a jour."
  });
});
