const cheerio = require('cheerio');
fetch('https://qeseh.net/yeralti-episode-16')
  .then(r => r.text())
  .then(html => {
    const $ = cheerio.load(html);
    $('.server-list li').each((_, el) => {
      const id = $(el).attr('data-id');
      const name = $(el).text().trim();
      console.log(name, id);
    });
  });
