const html = require('fs').readFileSync('episode_test.html', 'utf8');
const cheerio = require('cheerio');
const $ = cheerio.load(html);

console.log("Looking for watch links:");
$('a').each((i, el) => {
  const href = $(el).attr('href');
  if (href && (href.includes('watch') || href.includes('player') || href.includes('video'))) {
    console.log("Watch Link:", href, $(el).text().trim());
  }
});
