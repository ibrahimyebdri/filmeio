const html = require('fs').readFileSync('episode_test.html', 'utf8');
const urls = html.match(/https?:\/\/[^\s"'<>]+/g);
if (urls) {
  const players = urls.filter(u => u.includes('embed') || u.includes('player') || u.includes('arabhd') || u.includes('ok.ru') || u.includes('vidmoly'));
  console.log("Unique player URLs:");
  console.log([...new Set(players)]);
}
