const cheerio = require('cheerio');

const SOURCE_BASE_URL = "https://qeseh.net";

async function fetchHtml(url) {
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

function text($, element, selector) {
  const scoped = typeof element?.find === "function" ? element : $(element);
  const target = selector ? scoped.find(selector).first() : scoped;
  return target.text().replace(/\s+/g, " ").trim();
}

function absoluteUrl(value) {
  if (!value) return undefined;
  try {
    return new URL(value, SOURCE_BASE_URL).toString();
  } catch {
    return undefined;
  }
}

async function scrapeEpisodeDetails(slug) {
  const url = `${SOURCE_BASE_URL}/clarus/${encodeURIComponent(slug)}/`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const title = $("h1").first().text().trim() || slug.replace(/-/g, " ");
  const servers = [];

  const watchLink = $('a[href*="watch?post="]').first().attr("href");
  if (watchLink) {
    try {
      const urlObj = new URL(watchLink);
      const postBase64 = urlObj.searchParams.get("post");
      if (postBase64) {
        const payload = JSON.parse(Buffer.from(postBase64, "base64").toString("utf8"));
        if (payload && Array.isArray(payload.servers)) {
          payload.servers.forEach((s) => {
            const host = s.name === "estream" ? "arabveturk.com" : "arabhd.onl";
            const iframeUrl = s.id.startsWith("http") ? s.id : `https://${host}/embed-${s.id}.html`;
            servers.push({
              name: s.name,
              iframeUrl,
              host,
              quality: "HD"
            });
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
      if (!iframeUrl) return;
      const host = new URL(iframeUrl).hostname.replace(/^www\./, "");
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

scrapeEpisodeDetails('tasacak-bu-deniz-episode-30')
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error("FAILED:", err.message));
