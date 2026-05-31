const endpoints = ['latestEpisodes', 'latestSeries', 'latestMovies'];
async function test() {
  for (const ep of endpoints) {
    const url = 'https://us-central1-filmieo-proxy.cloudfunctions.net/' + ep;
    const res = await fetch(url);
    const text = await res.text();
    console.log(`Endpoint ${ep}: HTTP ${res.status}`);
    try {
      const json = JSON.parse(text);
      if (Array.isArray(json)) {
         console.log(` -> Array with ${json.length} items`);
         if (json.length > 0) console.log(JSON.stringify(json[0]).substring(0, 150));
      } else {
         console.log(` -> JSON Object: `, JSON.stringify(json).substring(0, 150));
      }
    } catch (e) {
      console.log(` -> Not JSON: `, text.substring(0, 150));
    }
  }
}
test();
