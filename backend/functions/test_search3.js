const html = require('fs').readFileSync('search_dump.html', 'utf8');
const cheerio = require('cheerio');
const $ = cheerio.load(html);

const items = [];
$('a').each((_, a) => {
  const href = $(a).attr('href');
  if (href) {
    items.push(href);
  }
});
console.log(items.slice(0, 50));
