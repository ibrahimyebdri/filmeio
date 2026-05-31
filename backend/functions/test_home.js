const fs = require('fs');
const cheerio = require('cheerio');
const $ = cheerio.load(fs.readFileSync('qeseh_home.html', 'utf8'));
const links = [];
$('a').each((_, a) => {
  const h = $(a).attr('href');
  if(h && h.includes('yeralti')) links.push(h);
});
console.log(links);
