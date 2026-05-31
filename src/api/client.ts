import { CronResult, EpisodeDetails, EpisodeSummary, SeriesDetails, SeriesSummary } from "./types";

const DEFAULT_API_BASE_URL = "https://us-central1-filmieo-proxy.cloudfunctions.net";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
const TIMEOUT_MS = 15000;

type Query = Record<string, string | number | undefined>;

class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function buildUrl(path: string, query?: Query) {
  const url = new URL(path, API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function request<T>(path: string, query?: Query): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(buildUrl(path, query), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new ApiError(`Erreur API ${response.status}`, response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError("Impossible de joindre l'API Filmieo.");
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  latestSeries: () => request<SeriesSummary[]>("latestSeries"),
  latestMovies: () => request<SeriesSummary[]>("latestMovies"),
  latestEpisodes: () => request<EpisodeSummary[]>("latestEpisodes"),
  searchSeries: (query: string) => request<SeriesSummary[]>("searchSeries", { q: query }),
  getSeries: (slug: string) => request<SeriesDetails>("getSeries", { slug }),
  getEpisode: (slug: string) => request<EpisodeDetails>("getEpisode", { slug }),
  scrapeCron: () => request<CronResult>("scrapeCron")
};
