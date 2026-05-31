import { EpisodeDetails, EpisodeSummary, SeriesDetails, SeriesSummary } from "./types";

export const mockSeries: SeriesSummary[] = [
  {
    title: "Ask ve Gunes",
    slug: "ask-ve-gunes",
    year: "2024",
    rating: "8.4",
    genre: "Drama",
    description: "Une serie turque autour de secrets familiaux, de romance et de choix difficiles."
  },
  {
    title: "Yargi",
    slug: "yargi",
    year: "2023",
    rating: "8.8",
    genre: "Crime",
    description: "Une enquete dense ou justice, famille et verite se croisent."
  },
  {
    title: "Bahar",
    slug: "bahar",
    year: "2025",
    rating: "8.1",
    genre: "Medical",
    description: "Une femme reprend sa vie en main dans un univers hospitalier exigeant."
  }
];

export const mockEpisodes: EpisodeSummary[] = [
  {
    title: "Episode 34",
    slug: "ask-ve-gunes-episode-34",
    seriesTitle: "Ask ve Gunes",
    episodeNumber: "34",
    publishedAt: "Aujourd'hui"
  },
  {
    title: "Episode 12",
    slug: "yargi-episode-12",
    seriesTitle: "Yargi",
    episodeNumber: "12",
    publishedAt: "Hier"
  },
  {
    title: "Episode 8",
    slug: "bahar-episode-8",
    seriesTitle: "Bahar",
    episodeNumber: "8",
    publishedAt: "Cette semaine"
  }
];

export const mockSeriesDetails = (slug: string): SeriesDetails => {
  const series = mockSeries.find((item) => item.slug === slug) ?? mockSeries[0];

  return {
    ...series,
    status: "En cours",
    seasons: "1 saison",
    episodes: mockEpisodes.map((episode) => ({
      ...episode,
      seriesTitle: series.title
    }))
  };
};

export const mockEpisodeDetails = (slug: string): EpisodeDetails => {
  const episode = mockEpisodes.find((item) => item.slug === slug) ?? mockEpisodes[0];

  return {
    ...episode,
    description: "Choisis un serveur autorise pour lancer le lecteur integre.",
    servers: [
      {
        name: "Arab HD",
        host: "arabhd.onl",
        quality: "HD",
        iframeUrl: "https://arabhd.onl/embed-demo.html"
      },
      {
        name: "estream",
        host: "arabveturk.com",
        quality: "HD",
        iframeUrl: "https://arabveturk.com/embed-demo.html"
      }
    ]
  };
};
