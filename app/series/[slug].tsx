import { useLocalSearchParams } from "expo-router";
import { Link } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
} from "react-native";

import { Screen } from "@/components/Screen";
import { StateView } from "@/components/StateView";
import { useAsync } from "@/hooks/useAsync";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { type } from "@/theme/type";

export default function SeriesDetailsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const { data, loading } = useAsync(async () => {
    const tvResponse = await fetch(
      "https://qeseh.net/wp-json/wp/v2/tvshow?per_page=100"
    );

    const tvshows = await tvResponse.json();

    const currentSeries = tvshows.find(
      (item: any) => item.slug === slug
    );

    if (!currentSeries) return null;

    const episodesResponse = await fetch(
      `https://qeseh.net/wp-json/wp/v2/posts?tvshow=${currentSeries.id}&per_page=100`
    );

    const episodes = await episodesResponse.json();

    const imageMatch =
      currentSeries.description?.match(
        /src="([^"]+\.(jpg|jpeg|png|webp))/i
      );

    return {
      id: currentSeries.id,
      title: currentSeries.name,
      slug: currentSeries.slug,
      poster: imageMatch?.[1] || "",
      description:
        currentSeries.description
          ?.replace(/<[^>]+>/g, "")
          ?.trim() || "",
      episodes,
    };
  }, [slug]);

  if (loading) {
    return (
      <Screen>
        <StateView loading title="Chargement..." />
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen>
        <StateView
          icon="alert-circle-outline"
          title="Série introuvable"
        />
      </Screen>
    );
  }

  return (
    <Screen
      title={data.title}
      subtitle={`${data.episodes.length} épisodes`}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {data.poster ? (
            <Image
              source={{ uri: data.poster }}
              style={styles.poster}
            />
          ) : null}

          <Text style={styles.description}>
            {data.description}
          </Text>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.value}>
                {data.episodes.length}
              </Text>

              <Text style={styles.label}>
                Épisodes
              </Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.value}>1</Text>

              <Text style={styles.label}>
                Saison
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            Épisodes
          </Text>

          {data.episodes.map((episode: any) => (
            <Link
              key={episode.id}
              asChild
              href={{
                pathname: "/episode/[slug]",
                params: {
                  slug: String(episode.id),
                },
              }}
            >
              <Pressable style={styles.episodeCard}>
                <Text style={styles.episodeTitle}>
                  {episode.title.rendered}
                </Text>

                <Text style={styles.episodeDate}>
                  {new Date(
                    episode.date
                  ).toLocaleDateString()}
                </Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },

  poster: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },

  description: {
    ...type.body,
    color: colors.text,
  },

  stats: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    borderRadius: 12,
    padding: spacing.md,
  },

  value: {
    ...type.headline,
    color: colors.text,
  },

  label: {
    ...type.caption,
    color: colors.muted,
    marginTop: spacing.xs,
  },

  sectionTitle: {
    ...type.headline,
    color: colors.text,
  },

  episodeCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },

  episodeTitle: {
    ...type.body,
    color: colors.text,
  },

  episodeDate: {
    ...type.caption,
    color: colors.muted,
    marginTop: spacing.xs,
  },
});