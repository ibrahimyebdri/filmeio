const cheerio = require('cheerio');

async function test() {
  const url = "https://qeseh.net/category/yeni-filmler/";
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const html = await response.text();
  const $ = cheerio.load(html);

  $(".block-post, .item, .post").each((_, element) => {
    const link = $(element).find("a").first();
    const href = link.attr("href") || "";
    console.log(href);
  });
}

test();
