const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('failed_episode.html', 'utf8');
const $ = cheerio.load(html);

const title = $("h1").first().text().trim();
console.log("Title:", title);

const servers = [];
const watchLink = $('a[href*="watch?post="]').first().attr("href");
console.log("WatchLink:", watchLink);

if (watchLink) {
  try {
    const urlObj = new URL(watchLink);
    const postBase64 = urlObj.searchParams.get("post");
    console.log("Base64:", postBase64);
    if (postBase64) {
      const payload = JSON.parse(Buffer.from(postBase64, "base64").toString("utf8"));
      console.log("Payload:", payload);
    }
  } catch (e) {
    console.error("Error parsing watch payload:", e);
  }
}

let seriesTitle = $(".series-title, .show-title").first().text().replace(/\s+/g, " ").trim();
if (!seriesTitle && title) {
  seriesTitle = title.replace(/\s*الحلقة\s*\d+.*/, "").trim();
}
console.log("SeriesTitle:", seriesTitle);

const description = $(".story, .description, article p").first().text().replace(/\s+/g, " ").trim();
console.log("Description:", description);
