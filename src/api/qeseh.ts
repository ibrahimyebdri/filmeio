// src/api/qeseh.ts
// This module now acts as a wrapper around Firebase Functions
// No longer scrapes qeseh.net directly

import { api } from "./client";
import type { SeriesDetails, EpisodeDetails } from "./types";

export type QesehEpisode = {
  id: string;
  slug: string;
  title: string;
  episodeNumber: number;
  watchUrl: string;
  thumbnail: string;
};

export type QesehSeries = {
  slug: string;
  arabicTitle: string;
  poster: string;
  banner: string;
  description: string;
  categories: string[];
  episodes: QesehEpisode[];
};

export type QesehServer = {
  name: string;
  iframeUrl: string;
};

export type QesehEpisodeDetails = {
  id: string;
  slug: string;
  title: string;
  episodeNumber: number;
  seriesId: string;
  seriesTitle: string;
  seriesPoster: string;
  seriesDescription: string;
  watchUrl: string;
  thumbnail: string;
  servers: QesehServer[];
};

// Firebase-based helper functions

function mapFirebaseSeriesDetails(details: SeriesDetails): QesehSeries {
  return {
    slug: details.slug,
    arabicTitle: details.title,
    poster: details.poster || "",
    banner: details.poster || "",
    description: details.description || "",
    categories: details.genre ? [details.genre] : [],
    episodes: (details.episodes || []).map((ep, idx) => ({
      id: ep.slug,
      slug: ep.slug,
      title: ep.title,
      episodeNumber: idx + 1,
      watchUrl: "",
      thumbnail: ep.poster || "",
    })),
  };
}

function mapFirebaseEpisodeDetails(details: EpisodeDetails): QesehEpisodeDetails {
  return {
    id: details.slug,
    slug: details.slug,
    title: details.title,
    episodeNumber: details.episodeNumber ? parseInt(details.episodeNumber) : 1,
    seriesId: "",
    seriesTitle: details.seriesTitle || "",
    seriesPoster: details.poster || "",
    seriesDescription: details.description || "",
    watchUrl: "",
    thumbnail: details.poster || "",
    servers: (details.servers || []).map((server) => ({
      name: server.name,
      iframeUrl: server.iframeUrl,
    })),
  };
}

export async function getSeriesDetails(
  slug: string
): Promise<QesehSeries> {
  const cleanSlug = slug
    .replace(/^watch-/i, "")
    .replace(/^serie-/i, "")
    .trim();

  const details = await api.getSeries(cleanSlug);
  return mapFirebaseSeriesDetails(details);
}

export async function getEpisodeDetails(
  slug: string
): Promise<QesehEpisodeDetails> {
  const details = await api.getEpisode(slug);
  return mapFirebaseEpisodeDetails(details);
}

export async function searchSeries(
  query: string
) {
  const search = query.trim();

  if (!search) {
    return [];
  }

  const results = await api.searchSeries(search);
  return results;
}

export default {
  getSeriesDetails,
  getEpisodeDetails,
  searchSeries,
};