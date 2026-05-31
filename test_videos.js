const fs = require('fs');
const html = fs.readFileSync('episode_test.html', 'utf8');
const cheerio = require('cheerio');
const $ = cheerio.load(html);

console.log('IFRAMES:');
$('iframe').each((_, el) => console.log($(el).attr('src')));

console.log('A LINKS:');
$('a').each((_, el) => {
  const href = $(el).attr('href');
  if (href && (href.includes('embed') || href.includes('player') || href.includes('video') || href.includes('watch'))) {
    console.log(href);
  }
});
