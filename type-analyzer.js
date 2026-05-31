const fs = require('fs');

const dataStr = fs.readFileSync('api_output.json', 'utf16le');
const data = JSON.parse(dataStr);

const [episodes, series, movies] = data;

console.log("Episodes:");
console.log("poster type:", new Set(episodes.map(e => typeof e.poster)));
console.log("seriesTitle type:", new Set(episodes.map(e => typeof e.seriesTitle)));

console.log("\nSeries:");
console.log("poster type:", new Set(series.map(s => typeof s.poster)));
console.log("genre type:", new Set(series.map(s => typeof s.genre)));
console.log("genre isArray:", new Set(series.map(s => Array.isArray(s.genre))));

console.log("\nMovies:");
console.log("poster type:", new Set(movies.map(m => typeof m.poster)));
console.log("year type:", new Set(movies.map(m => typeof m.year)));
