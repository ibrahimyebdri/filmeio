// src/api/qeseh.ts

import { Platform } from "react-native";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

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

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Referer: "https://qeseh.net/",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

export function getEpisodeSlug(url: string) {
  const match = url.match(/\/clarus\/([^/]+)/i);

  return match?.[1] || "";
}

export function resolveServerIframe(
  name: string,
  serverId: string
) {
  const cleanId = serverId.trim();

  switch (name) {
    case "Arab HD":
      return `https://arabhd.onl/embed-${cleanId}.html`;

    case "estream":
      return `https://arabveturk.com/embed-${cleanId}.html`;

    default:
      return "";
  }
}

export async function getSeriesDetails(
  slug: string
): Promise<QesehSeries> {

  const cleanSlug = slug
    .replace(/^watch-/i, "")
    .replace(/^serie-/i, "")
    .trim();

  const urls = [
    `https://qeseh.net/yeni-show/${cleanSlug}/`,
    `https://qeseh.net/serie/${cleanSlug}/`,
  ];

  let html = "";

  for (const url of urls) {
    try {
      html = await fetchHtml(url);

      if (
        html &&
        html.length > 1000
      ) {
        break;
      }
    } catch {}
  }

  if (!html) {
    return {
      slug: cleanSlug,
      arabicTitle: cleanSlug,
      poster: "",
      banner: "",
      description: "",
      categories: [],
      episodes: [],
    };
  }

  const titleMatch =
    html.match(
      /<h1[^>]*>([\s\S]*?)<\/h1>/i
    );

  const arabicTitle =
    titleMatch
      ? titleMatch[1]
          .replace(/<[^>]+>/g, "")
          .replace(/-\s+قصة\s+عشق/g, "")
          .trim()
      : cleanSlug;

  const imageMatch =
    html.match(
      /https?:\/\/[^"']+\.(jpg|jpeg|png|webp)/i
    );

  const poster =
    imageMatch?.[0] || "";

  const descriptionMatch =
    html.match(
      /class=["']story["'][^>]*>([\s\S]*?)<\/div>/i
    );

  const description =
    descriptionMatch
      ? descriptionMatch[1]
          .replace(/<[^>]+>/g, "")
          .trim()
      : "";

  const categories: string[] = [];

  const categoryRegex =
    /rel=["']tag["'][^>]*>([^<]+)</gi;

  let categoryMatch;

  while (
    (categoryMatch =
      categoryRegex.exec(html)) !==
    null
  ) {
    categories.push(
      categoryMatch[1].trim()
    );
  }

  const episodes: QesehEpisode[] = [];

  const clarusRegex =
    /\/clarus\/([^\/"'?#]+)/gi;

  const found =
    new Set<string>();

  let clarusMatch;

  while (
    (clarusMatch =
      clarusRegex.exec(html)) !==
    null
  ) {
    const episodeSlug =
      clarusMatch[1];

    if (
      found.has(
        episodeSlug
      )
    ) {
      continue;
    }

    found.add(
      episodeSlug
    );

    const numberMatch =
      episodeSlug.match(
        /-(\d+)$/
      );

    const realNumber =
      numberMatch
        ? parseInt(
            numberMatch[1],
            10
          )
        : episodes.length + 1;

    episodes.push({
      id: episodeSlug,
      slug: episodeSlug,
      title: `Episode ${realNumber}`,
      episodeNumber:
        realNumber,
      watchUrl: `https://qeseh.net/clarus/${episodeSlug}/`,
      thumbnail: poster,
    });
  }

  episodes.sort(
    (a, b) =>
      a.episodeNumber -
      b.episodeNumber
  );

  console.log(
    "SERIE =",
    cleanSlug
  );


  return {
    slug: cleanSlug,
    arabicTitle,
    poster,
    banner: poster,
    description,
    categories,
    episodes,
  };
}
export async function getEpisodeDetails(
  slug: string
): Promise<QesehEpisodeDetails> {
  const html = await fetchHtml(
    `https://qeseh.net/clarus/${slug}/`
  );

  const titleMatch = html.match(
    /<title>([^<]+)<\/title>/i
  );

  const fullTitle = titleMatch
    ? titleMatch[1]
        .replace(/-\s+قصة\s+عشق/g, "")
        .trim()
    : slug;

  const episodeNumberMatch =
    fullTitle.match(/الحلقة\s+(\d+)/i);

  const episodeNumber = episodeNumberMatch
    ? parseInt(episodeNumberMatch[1], 10)
    : 1;

  const seriesLinkMatch =
    html.match(
      /class=["']singleSeries["'][\s\S]*?<a\s+href=["']([^"']+)["'][^>]*title=["']([^"']+)["']/i
    ) ||
    html.match(
      /class=["']singleSeries["'][\s\S]*?<a\s+href=["']([^"']+)["'][^>]*>([^<]+)/i
    );

  let seriesTitle = "";
  let seriesId = "";

  if (seriesLinkMatch) {
    seriesTitle = seriesLinkMatch[2]
      .replace(/-\s+قصة\s+عشق/g, "")
      .trim();

    const slugMatch =
      seriesLinkMatch[1].match(
        /\/yeni-show\/([^/]+)/i
      );

    seriesId = slugMatch?.[1] || "";
  }

  const posterMatch = html.match(
    /background-image:\s*url\(['"]?([^'"()]+)['"]?\)/i
  );

  const seriesPoster =
    posterMatch?.[1] || "";

  const descriptionMatch =
    html.match(
      /class=["']story["'][^>]*>([\s\S]*?)<\/div>/i
    );

  const seriesDescription =
    descriptionMatch
      ? descriptionMatch[1]
          .replace(/<[^>]+>/g, "")
          .trim()
      : "";

  const playerLinkMatch =
    html.match(
      /class=["']fullscreen-clickable["']\s+href=["']([^"']+)["']/i
    ) ||
    html.match(
      /href=["']([^"']+)["']\s+class=["']fullscreen-clickable["']/i
    );

  const playerUrl =
    playerLinkMatch?.[1] || "";

  const servers: QesehServer[] = [];

  if (playerUrl) {
    try {
      const playerHtml =
        await fetchHtml(playerUrl);

      const postMatch =
        playerUrl.match(
          /[?&]post=([^&]+)/i
        );

      let postData =
        postMatch?.[1] || "";

      if (!postData) {
        const scriptMatch =
          playerHtml.match(
            /post=([a-zA-Z0-9+/=]+)/i
          );

        postData =
          scriptMatch?.[1] || "";
      }

      if (postData) {
        try {
          const decoded =
            atob(postData);

          const json =
            JSON.parse(decoded);

          if (
            json &&
            json.servers &&
            Array.isArray(json.servers)
          ) {
            json.servers.forEach(
              (server: any) => {
                if (
                  server.name !==
                    "Arab HD" &&
                  server.name !==
                    "estream"
                ) {
                  return;
                }

                const iframeUrl =
                  resolveServerIframe(
                    server.name,
                    server.id
                  );

                if (iframeUrl) {
                  servers.push({
                    name: server.name,
                    iframeUrl,
                  });
                }
              }
            );
          }
        } catch {}
      }

      if (servers.length === 0) {
        const listMatch =
          playerHtml.match(
            /<ul\s+class=["']serversList["']>([\s\S]*?)<\/ul>/i
          );

        if (listMatch) {
          const listHtml =
            listMatch[1];

          const serverRegex =
            /<li\s+[^>]*?data-name=["']([^"']+)["'][^>]*?data-server=["']([^"']+)["']/gi;

          let serverMatch;

          while (
            (serverMatch =
              serverRegex.exec(
                listHtml
              )) !== null
          ) {
            const name =
              serverMatch[1];

            const serverId =
              serverMatch[2];

            if (
              name !== "Arab HD" &&
              name !== "estream"
            ) {
              continue;
            }

            const iframeUrl =
              resolveServerIframe(
                name,
                serverId
              );

            if (iframeUrl) {
              servers.push({
                name,
                iframeUrl,
              });
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  return {
    id: `${seriesId}_${episodeNumber}`,
    slug,
    title: `الحلقة ${episodeNumber}`,
    episodeNumber,
    seriesId,
    seriesTitle,
    seriesPoster,
    seriesDescription,
    watchUrl: `https://qeseh.net/clarus/${slug}/`,
    thumbnail: seriesPoster,
    servers,
  };
}

export async function searchSeries(
  query: string
) {
  const search = query.trim();

  if (!search) {
    return [];
  }

  const html = await fetchHtml(
    `https://qeseh.net/search/${encodeURIComponent(
      search
    )}/`
  );

  const results: any[] = [];

  const regex =
    /<a\s+href="(https:\/\/qeseh\.net\/yeni-show\/([^\/"]+)\/)"[^>]*title="([^"]+)"[\s\S]*?background-image:url\(([^)]+)\)/gi;

  let match;

  while (
    (match = regex.exec(html)) !== null
  ) {
    results.push({
      slug: match[2],
      title: match[3]
        .replace(
          /\s*-\s*قصة عشق/gi,
          ""
        )
        .trim(),
      poster: match[4],
    });
  }

  return Array.from(
    new Map(
      results.map(
        (item) => [
          item.slug,
          item,
        ]
      )
    ).values()
  );
}

export default {
  getSeriesDetails,
  getEpisodeDetails,
  searchSeries,
};