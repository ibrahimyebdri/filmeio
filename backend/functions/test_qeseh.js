const cheerio = require('cheerio');
const fs = require('fs');

const SOURCE_BASE_URL = "https://qeseh.net";
const ARCHIVE_URL = `${SOURCE_BASE_URL}/category/alarshif/`;
const ALLOWED_PLAYER_HOSTS = new Set(["arabhd.onl", "arabveturk.com"]);

function absoluteUrl(value) {
  if (!value) return undefined;
  try { return new URL(value, SOURCE_BASE_URL).toString(); } catch { return undefined; }
}

function slugFromUrl(value) {
  const url = absoluteUrl(value);
  if (!url) return "";
  const pathname = new URL(url).pathname.replace(/\/$/, "");
  const parts = pathname.split("/").filter(Boolean);
  return parts.at(-1) || "";
}

function text($, element, selector) {
  const scoped = typeof element?.find === "function" ? element : $(element);
  const target = selector ? scoped.find(selector).first() : scoped;
  return target.text().replace(/\s+/g, " ").trim();
}

async function fetchHtml(url) {
  const response = await fetch(url, { headers: { "User-Agent": "FilmieoBot/1.0 (+https://filmieo.local)" } });
  return response.text();
}

async function getEpisode() {
  const html = await fetchHtml(`${SOURCE_BASE_URL}/clarus/tasacak-bu-deniz-episode-30/`);
  const $ = cheerio.load(html);
  const title = $("h1").first().text().trim();
  const servers = [];
  const watchLink = $('a[href*="watch?post="]').first().attr("href");
  if (watchLink) {
    const urlObj = new URL(watchLink);
    const postBase64 = urlObj.searchParams.get("post");
    if (postBase64) {
      const payload = JSON.parse(Buffer.from(postBase64, "base64").toString("utf8"));
      if (payload && Array.isArray(payload.servers)) {
        payload.servers.forEach((s) => {
          const host = s.name === "estream" ? "arabveturk.com" : "arabhd.onl";
          const embedUrl = s.id.startsWith("http") ? s.id : `https://${host}/embed/${s.id}`;
          servers.push({ name: s.name, embedUrl, host, quality: "HD" });
        });
      }
    }
  }
  let seriesTitle = text($, $.root(), ".series-title, .show-title");
  if (!seriesTitle && title) seriesTitle = title.replace(/\s*الحلقة\s*\d+.*/, "").trim();

  console.log("=== getEpisode() JSON ===");
  console.log(JSON.stringify({ title, seriesTitle, servers: servers.slice(0, 2) }, null, 2));
}

async function latestEpisodes() {
  const html = await fetchHtml(SOURCE_BASE_URL);
  const $ = cheerio.load(html);
  const items = [];
  $("article, .post, .item, .episode, li, .block-post").each((_, element) => {
    const href = $(element).find('a[href*="/clarus/"]').first().attr("href");
    const slug = slugFromUrl(href);
    if (!slug) return;
    const title = $(element).find("h1, h2, h3, .title, .post-title").first().text().trim() || text($, element, "a");
    const imgBg = $(element).find(".imgBg").first().attr("style") || "";
    const posterUrl = imgBg.match(/url\((['"]?)(.*?)\1\)/)?.[2] || $(element).find("img").first().attr("src");
    let seriesTitle = text($, element, ".series-title, .show-title");
    if (!seriesTitle && title) seriesTitle = title.replace(/\s*الحلقة\s*\d+.*/, "").trim();
    let episodeNumber = text($, element, ".episode-number, .number, .episodeNum span:nth-child(2)");
    items.push({ title, slug, poster: absoluteUrl(posterUrl), seriesTitle, episodeNumber });
  });
  console.log("=== latestEpisodes() JSON ===");
  console.log(JSON.stringify(items.slice(0, 1), null, 2));
}

async function getSeries() {
  const html = await fetchHtml(`${SOURCE_BASE_URL}/yeni-show/yeralti/`);
  const $ = cheerio.load(html);
  const title = $("h1").first().text().trim();
  const imgBg = $(".imgBg").first().attr("style") || "";
  const posterUrl = imgBg.match(/url\((['"]?)(.*?)\1\)/)?.[2] || $("img").first().attr("src");
  console.log("=== getSeries() JSON ===");
  console.log(JSON.stringify({ title, poster: absoluteUrl(posterUrl) }, null, 2));
}

async function searchSeries() {
  const html = await fetchHtml(ARCHIVE_URL);
  const $ = cheerio.load(html);
  const items = [];
  $("article, .post, .item, .movie, .series, li, .block-post").each((_, element) => {
    const href = $(element).find('a[href*="/yeni-show/"]').first().attr("href");
    const slug = slugFromUrl(href);
    if (!slug) return;
    const title = $(element).find(".title").first().text().trim();
    const imgBg = $(element).find(".imgBg").first().attr("style") || "";
    const posterUrl = imgBg.match(/url\((['"]?)(.*?)\1\)/)?.[2] || $(element).find("img").first().attr("src");
    items.push({ title, slug, poster: absoluteUrl(posterUrl) });
  });
  console.log("=== searchSeries() JSON ===");
  const res = items.filter(i => i.title && i.title.includes('العبقري'));
  console.log(JSON.stringify(res.slice(0, 1), null, 2));
}

async function runAll() {
  await latestEpisodes();
  await getEpisode();
  await getSeries();
  await searchSeries();
}
runAll();
