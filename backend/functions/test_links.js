const html = require('fs').readFileSync('qeseh_home.html', 'utf8');
const $ = require('cheerio').load(html);
$('a').each((_, el) => {
  const text = $(el).text();
  if (text.includes('فيلم') || text.includes('افلام') || text.includes('أفلام')) {
    console.log($(el).attr('href'), text);
  }
});
