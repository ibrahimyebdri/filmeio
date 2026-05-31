const fs = require('fs');
const cheerio = require('cheerio');
const $ = cheerio.load(fs.readFileSync('episode_test.html', 'utf8'));

const watchLink = $('a[href*="watch?post="]').first().attr("href");
console.log('watchLink:', watchLink);
if (watchLink) {
  try {
    const urlObj = new URL(watchLink);
    const postBase64 = urlObj.searchParams.get("post");
    console.log('postBase64:', postBase64);
    if (postBase64) {
      const payload = JSON.parse(Buffer.from(postBase64, "base64").toString("utf8"));
      console.log('Payload:', payload.servers);
    }
  } catch (e) {
    console.log('Error:', e);
  }
}
