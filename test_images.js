const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('episode_test.html', 'utf8');
const $ = cheerio.load(html);
const imgBg = $(".imgBg").first().attr("style") || "";
const posterUrl = imgBg.match(/url\((['"]?)(.*?)\1\)/)?.[2] || $("img").first().attr("src") || $("img").first().attr("data-src");
console.log('Poster URL:', posterUrl);
console.log('og:image:', $('meta[property="og:image"]').attr("content"));
console.log('Images:', $('img').map((i, el) => $(el).attr('src') || $(el).attr('data-src')).get().slice(0, 5));
