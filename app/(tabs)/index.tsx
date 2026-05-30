import { ScrollView, StyleSheet, View } from "react-native";
import { EpisodeRow } from "@/components/EpisodeRow";
import { PosterCard } from "@/components/PosterCard";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { StateView } from "@/components/StateView";
import { useAsync } from "@/hooks/useAsync";
import { spacing } from "@/theme/spacing";

type SeriesItem = {
  slug: string;
  title: string;
  poster?: string;
  year?: string;
  genre?: string;
};

type EpisodeItem = {
  slug: string;
  title: string;
  description?: string;
};

type HomeData = {
  series: SeriesItem[];
  episodes: EpisodeItem[];
};

async function loadHome(): Promise<HomeData> {
  try {
    const tvResponse = await fetch(
      "https://qeseh.net/wp-json/wp/v2/tvshow?per_page=50"
    );

    const tvshows = await tvResponse.json();

    const series = tvshows.map((item: any) => {
      const imageMatch =
        item.description?.match(
          /src="([^"]+\.(jpg|jpeg|png|webp))/i
        );

      return {
        slug: item.slug,
        title: item.name,
        poster: imageMatch?.[1] || "",
        genre: "Turkish Drama",
        year: "",
      };
    });

    const postsResponse = await fetch(
      "https://qeseh.net/wp-json/wp/v2/posts?per_page=20"
    );

    const posts = await postsResponse.json();

    const episodes = posts.map((post: any) => ({
      slug: post.slug,
      title: post.title?.rendered || "",
      description:
        post.excerpt?.rendered
          ?.replace(/<[^>]+>/g, "")
          ?.trim() || "",
    }));

    return {
      series,
      episodes,
    };
  } catch (error) {
    console.log(error);

    return {
      series: [],
      episodes: [],
    };
  }
}

export default function HomeScreen() {
  const { data, loading, reload } =
    useAsync(loadHome, []);

  return (
    <Screen
      title="Filmeio"
      subtitle="Series Turques"
    >
      {loading ? (
        <StateView
          loading
          title="Chargement..."
        />
      ) : (
        <View style={styles.stack}>
          <SectionHeader
            title="Dernieres series"
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
          >
            {(data?.series ?? []).map(
              (series) => (
                <PosterCard
                  key={series.slug}
                  series={series as any}
                />
              )
            )}
          </ScrollView>

          <SectionHeader
            title="Episodes recents"
            action="Mis a jour"
          />

          <View style={styles.list}>
            {(data?.episodes ?? []).map(
              (episode) => (
                <EpisodeRow
                  key={episode.slug}
                  episode={episode as any}
                />
              )
            )}
          </View>

          {!data?.series.length &&
          !data?.episodes.length ? (
            <StateView
              title="Catalogue vide"
              message="Aucune donnee disponible."
              icon="cloud-offline-outline"
              actionLabel="Recharger"
              onAction={reload}
            />
          ) : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },

  list: {
    gap: spacing.sm,
  },
});