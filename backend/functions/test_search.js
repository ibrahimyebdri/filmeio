const cheerio = require('cheerio');
fetch('https://qeseh.net/?s=yeralti').then(r=>r.text()).then(html => {
  const $ = cheerio.load(html);
  const items = [];
  console.log($('.block-post, .item, .post').length);
  $('.block-post, .item, .post').each((_, element) => {
    const link = $(element).find('a').first();
    const href = link.attr('href') || '';
    items.push(href);
  });
  console.log(items);
})
