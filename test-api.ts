import { api } from "./src/api/client"; 
async function test() { 
  try { 
    const [episodes, series, movies] = await Promise.all([api.latestEpisodes(), api.latestSeries(), api.latestMovies()]); 
    const badEp = episodes.find((e: any) => e.slug.includes('/'));
    const badSe = series.find((s: any) => s.slug.includes('/'));
    const badMo = movies.find((m: any) => m.slug.includes('/'));
    console.log("Bad Ep:", badEp?.slug);
    console.log("Bad Se:", badSe?.slug);
    console.log("Bad Mo:", badMo?.slug);
  } catch(e) { 
    console.error(e); 
  } 
} 
test();
