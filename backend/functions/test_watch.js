const html = require('fs').readFileSync('watch_dump.html', 'utf8');
const cheerio = require('cheerio');
const $ = cheerio.load(html);
console.log($('iframe').attr('src'));
