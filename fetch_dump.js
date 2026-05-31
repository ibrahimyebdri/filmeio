const fs = require('fs');
const baseUrl = "https://us-central1-filmieo-proxy.cloudfunctions.net";

async function safeFetch(url) {
  try {
    const res = await fetch(url, { headers: { "Accept": "application/json" }});
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      return { error: "Not JSON", status: res.status, preview: text.slice(0, 500) };
    }
  } catch (e) {
    return { error: e.message };
  }
}

async function fetchIt() {
  const eps = await safeFetch(`${baseUrl}/latestEpisodes`);
  fs.writeFileSync('latestEpisodes.json', JSON.stringify(eps, null, 2));

  const series = await safeFetch(`${baseUrl}/latestSeries`);
  fs.writeFileSync('latestSeries.json', JSON.stringify(series, null, 2));

  if (Array.isArray(eps) && eps.length > 0) {
    const ep = await safeFetch(`${baseUrl}/getEpisode?slug=${eps[0].slug}`);
    fs.writeFileSync('getEpisode.json', JSON.stringify(ep, null, 2));
  }

  if (Array.isArray(series) && series.length > 0) {
    const ser = await safeFetch(`${baseUrl}/getSeries?slug=${series[0].slug}`);
    fs.writeFileSync('getSeries.json', JSON.stringify(ser, null, 2));
  }

  const search = await safeFetch(`${baseUrl}/searchSeries?q=batman`);
  fs.writeFileSync('searchSeries.json', JSON.stringify(search, null, 2));
}
fetchIt().catch(console.error);
