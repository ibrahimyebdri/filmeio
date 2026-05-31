export type SeriesSummary = {
  title: string;
  slug: string;
  poster?: string;
  year?: string;
  rating?: string;
  genre?: string;
  description?: string;
};

export type EpisodeSummary = {
  title: string;
  slug: string;
  seriesTitle?: string;
  poster?: string;
  episodeNumber?: string;
  publishedAt?: string;
};

export type StreamServer = {
  name: string;
  iframeUrl: string;
  host?: string;
  quality?: string;
};

export type SeriesDetails = SeriesSummary & {
  status?: string;
  seasons?: string;
  episodes: EpisodeSummary[];
};

export type EpisodeDetails = EpisodeSummary & {
  description?: string;
  servers: StreamServer[];
  previousEpisodeSlug?: string;
  nextEpisodeSlug?: string;
};

export type CronResult = {
  ok: boolean;
  latestSeriesCount?: number;
  latestEpisodesCount?: number;
  message?: string;
};
