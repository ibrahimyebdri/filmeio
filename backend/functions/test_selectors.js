const cheerio = require('cheerio');
const fs = require('fs');
const epHtml = fs.readFileSync('episode_test.html', 'utf8');
const $ = cheerio.load(epHtml);

console.log("Servers elements:");
const servers = $('.serversList li, .watch-servers li, [data-server], [data-url], [data-embed]');
servers.each((i, el) => {
  console.log($(el).attr('data-server'), $(el).attr('data-url'), $(el).attr('data-embed'));
  console.log($(el).html());
});

const scripts = $('script');
scripts.each((i, el) => {
  const text = $(el).html() || '';
  if (text.includes('iframe') || text.includes('embed') || text.includes('player')) {
    console.log("Script with player found!");
    console.log(text.substring(0, 300));
  }
});
