const html = require('fs').readFileSync('search_dump.html', 'utf8');
const cheerio = require('cheerio');
const $ = cheerio.load(html);

// Find all elements that have an image and a link inside
const items = [];
$('a').each((_, a) => {
  const href = $(a).attr('href');
  if (href && (href.includes('/yeni-show/') || href.includes('/serie/'))) {
    items.push(href);
  }
});
console.log(items);
