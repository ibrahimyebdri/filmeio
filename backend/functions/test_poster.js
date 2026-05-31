const fs = require('fs');
const cheerio = require('cheerio');
const $ = cheerio.load(fs.readFileSync('series_test.html', 'utf8'));

console.log('imgBg:', $('.imgBg').attr('style'));
console.log('img:', $('img').first().attr('src'));
console.log('og:image:', $('meta[property="og:image"]').attr('content'));
