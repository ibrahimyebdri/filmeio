import * as cheerio from "cheerio";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";

initializeApp();

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });
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
  iframeUrl: string;
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
      memory: "512MiB",
      invoker: "public",
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

function dedupeBySeriesTitle(items: EpisodeSummary[]) {
  const map = new Map<string, EpisodeSummary>();

  items.forEach((item) => {
    const key = item.seriesTitle || item.slug.replace(/-episode-\d+$/, '');
    if (key && !map.has(key)) {
      map.set(key, item);
    }
  });

  return Array.from(map.values());
}

function extractSeriesFromHtml(html: string): SeriesSummary[] {
  const $ = cheerio.load(html);
  const items: SeriesSummary[] = [];

  $("article, .post, .item, .movie, .series, li, .block-post").each((_, element) => {
    const href = $(element).find('a[href*="/yeni-show/"]').first().attr("href");
    const slug = slugFromUrl(href);

    if (!slug) {
      return;
    }

    const title =
      $(element).find("h1, h2, h3, .title, .post-title").first().text().trim() ||
      $(element).find("a").first().attr("title") ||
      text($, element, "a");
      
    const imgBg = $(element).find(".imgBg").first().attr("style") || "";
    const posterUrl = imgBg.match(/url\((['"]?)(.*?)\1\)/)?.[2] || $(element).find("img").first().attr("src") || $(element).find("img").first().attr("data-src");
    const poster = absoluteUrl(posterUrl);

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

  $("article, .post, .item, .episode, li, .block-post").each((_, element) => {
    const href = $(element).find('a[href*="/clarus/"]').first().attr("href");
    const slug = slugFromUrl(href);

    if (!slug) {
      return;
    }

    const title =
      $(element).find("h1, h2, h3, .title, .post-title").first().text().trim() ||
      $(element).find("a").first().attr("title") ||
      text($, element, "a");
      
    const imgBg = $(element).find(".imgBg").first().attr("style") || "";
    const posterUrl = imgBg.match(/url\((['"]?)(.*?)\1\)/)?.[2] || $(element).find("img").first().attr("src") || $(element).find("img").first().attr("data-src");
    const poster = absoluteUrl(posterUrl);
    
    let seriesTitle = text($, element, ".series-title, .show-title");
    if (!seriesTitle && title) {
        seriesTitle = title.replace(/\s*الحلقة\s*\d+.*/, "").trim();
    }
    
    let episodeNumber = text($, element, ".episode-number, .number, .episodeNum span:nth-child(2)");

    items.push({
      title: title || slug.replace(/-/g, " "),
      slug,
      poster,
      seriesTitle,
      episodeNumber,
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

async function scrapeMovies() {
  const url = `${SOURCE_BASE_URL}/category/yeni-filmler/`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const items: SeriesSummary[] = [];

  $(".block-post, .item, .post").each((_, element) => {
    const link = $(element).find("a").first();
    const href = link.attr("href") || "";
    
    // Extrait le slug d'une URL de type https://qeseh.net/movies/mon-film/
    const match = href.match(/qeseh\.net\/movies\/([^/]+)/);
    if (!match) return;
    const slug = match[1];

    const title = link.attr("title") || $(element).find("h2, .title, .name").first().text().trim() || "";
    const cleanTitle = title.replace(/\s*-\s*قصة عشق/gi, "").trim();
    
    const imgBg = $(element).find(".imgBg").first().attr("style") || "";
    const posterUrl = imgBg.match(/url\((['"]?)(.*?)\1\)/)?.[2] || $(element).find("img").first().attr("src") || $(element).find("img").first().attr("data-src");
    const poster = absoluteUrl(posterUrl);

    if (slug && cleanTitle) {
      items.push({
        title: cleanTitle,
        slug,
        poster,
        year: text($, element, ".year"),
        rating: text($, element, ".rating, .imdb"),
        genre: text($, element, ".genre, .category")
      });
    }
  });

  return dedupeBySlug(items).slice(0, 40);
}

async function fetchHtmlSafe(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "FilmieoBot/1.0 (+https://filmieo.local)"
    }
  });
  if (!response.ok) return null;
  return response.text();
}

async function scrapeSeriesDetails(slug: string): Promise<SeriesDetails> {
  let html = await fetchHtmlSafe(`${SOURCE_BASE_URL}/yeni-show/${encodeURIComponent(slug)}/`);
  
  if (!html) {
    html = await fetchHtmlSafe(`${SOURCE_BASE_URL}/movies/${encodeURIComponent(slug)}/`);
  }
  
  if (!html) {
    throw new Error(`Failed to fetch series details for ${slug}`);
  }

  const $ = cheerio.load(html);
  const title = $("h1").first().text().trim() || slug.replace(/-/g, " ");
  
  const poster = $('meta[property="og:image"]').attr("content") || $("img").first().attr("data-src") || "";
  
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

async function scrapeSearch(query: string): Promise<SeriesSummary[]> {
  const url = `${SOURCE_BASE_URL}/?s=${encodeURIComponent(query)}`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const items: SeriesSummary[] = [];

  $(".block-post, .item, .post").each((_, element) => {
    const link = $(element).find("a").first();
    const href = link.attr("href") || "";
    
    const title = link.attr("title") || $(element).find("h2, .title, .name").first().text().trim() || "";
    const cleanTitle = title.replace(/\s*-\s*قصة عشق/gi, "").trim();
    const slug = slugFromUrl(href);
    
    if (!slug) return;

    const imgBg = $(element).find(".imgBg").first().attr("style") || "";
    const posterUrl = imgBg.match(/url\((['"]?)(.*?)\1\)/)?.[2] || $(element).find("img").first().attr("src") || $(element).find("img").first().attr("data-src");
    const poster = absoluteUrl(posterUrl) || "";

    items.push({ slug, title: cleanTitle, poster });
  });

  return dedupeBySlug(items);
}

async function scrapeEpisodeDetails(slug: string): Promise<EpisodeDetails> {
  let html = await fetchHtmlSafe(`${SOURCE_BASE_URL}/clarus/${encodeURIComponent(slug)}/`);
  
  if (!html) {
    html = await fetchHtmlSafe(`${SOURCE_BASE_URL}/${encodeURIComponent(slug)}/`);
  }

  if (!html) {
    html = await fetchHtmlSafe(`${SOURCE_BASE_URL}/movies/${encodeURIComponent(slug)}/`);
  }

  if (!html) {
    throw new Error(`Failed to fetch episode details for ${slug}`);
  }
  const $ = cheerio.load(html);
  const title = $("h1").first().text().trim() || slug.replace(/-/g, " ");
  const servers: StreamServer[] = [];

  const watchLink = $('a[href*="watch?post="]').first().attr("href");
  if (watchLink) {
    try {
      const urlObj = new URL(watchLink);
      const postBase64 = urlObj.searchParams.get("post");
      if (postBase64) {
        const payload = JSON.parse(Buffer.from(postBase64, "base64").toString("utf8"));
        if (payload && Array.isArray(payload.servers)) {
          payload.servers.forEach((s: any) => {
            const host = s.name === "estream" ? "arabveturk.com" : "arabhd.onl";
            const iframeUrl = s.id.startsWith("http") ? s.id : `https://${host}/embed-${s.id}.html`;
            servers.push({
              name: s.name,
              iframeUrl,
              host,
              quality: "HD"
            });
            ALLOWED_PLAYER_HOSTS.add(host);
          });
        }
      }
    } catch (e) {
      console.error("Error parsing watch payload:", e);
    }
  } else {
    $("iframe[src], a[href]").each((_, element) => {
      const rawUrl = $(element).attr("src") ?? $(element).attr("href");
      const iframeUrl = absoluteUrl(rawUrl);

      if (!iframeUrl) {
        return;
      }

      const host = new URL(iframeUrl).hostname.replace(/^www\./, "");

      if (!ALLOWED_PLAYER_HOSTS.has(host)) {
        return;
      }

      servers.push({
        name: host.includes("arabhd") ? "Arab HD" : "estream",
        iframeUrl,
        host,
        quality: text($, element, ".quality") || "HD"
      });
    });
  }

  let seriesTitle = text($, $.root(), ".series-title, .show-title");
  if (!seriesTitle && title) {
    seriesTitle = title.replace(/\s*الحلقة\s*\d+.*/, "").trim();
  }

  return {
    title,
    slug,
    seriesTitle,
    description: $(".story, .description, article p").first().text().replace(/\s+/g, " ").trim(),
    servers
  };
}

async function readCollection<T>(collection: string, limit = 50) {
  const snapshot = await db.collection(collection).orderBy("updatedAt", "desc").limit(limit).get();
  return snapshot.docs.map((doc) => doc.data() as T);
}

async function writeCollection<T extends { slug: string }>(
  collection: string,
  items: T[]
) {
  const batch = db.batch();

  items.forEach((item) => {
    const cleaned = JSON.parse(
      JSON.stringify(item)
    );

    batch.set(
      db.collection(collection).doc(item.slug),
      {
        ...cleaned,
        updatedAt: FieldValue.serverTimestamp(),
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

  sendJson(res, dedupeBySeriesTitle(episodes));
});

export const searchSeries = endpoint(async (req, res) => {
  const query = String(req.query.q ?? "").trim().toLowerCase();

  if (!query) {
    sendJson(res, []);
    return;
  }

  const results = await scrapeSearch(query);
  sendJson(res, results);
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
    const data = cached.data();
    if (data && data.poster && !data.poster.includes("logo.png")) {
      sendJson(res, data);
      return;
    }
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
    const data = cached.data();
    if (data && Array.isArray(data.servers) && data.servers.length > 0 && data.servers[0]?.iframeUrl?.includes(".html")) {
      sendJson(res, data);
      return;
    }
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

export const latestMovies = endpoint(async (req, res) => {
  const result = await readCollection("latestMovies");
  
  if (result.length > 0) {
    sendJson(res, result);
    return;
  }
  
  const movies = await scrapeMovies();
  sendJson(res, movies);
});

export const scrapeCron = endpoint(async (_req, res) => {
  const [series, episodes, movies] = await Promise.all([scrapeArchive(), scrapeHomeEpisodes(), scrapeMovies()]);
  await Promise.all([
    writeCollection("latestSeries", series),
    writeCollection("latestEpisodes", episodes),
    writeCollection("latestMovies", movies)
  ]);

  sendJson(res, {
    ok: true,
    latestSeriesCount: series.length,
    latestEpisodesCount: episodes.length,
    latestMoviesCount: movies.length,
    message: "Cache Firestore mis a jour."
  });
});
