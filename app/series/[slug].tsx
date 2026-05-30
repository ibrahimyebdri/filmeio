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
import qeseh from "@/api/qeseh";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { type } from "@/theme/type";

export default function SeriesDetailsScreen() {
  const { slug } =
    useLocalSearchParams<{ slug: string }>();

  const { data, loading } = useAsync(
    async () => {
      return await qeseh.getSeriesDetails(
        slug || ""
      );
    },
    [slug]
  );

  if (loading) {
    return (
      <Screen>
        <StateView
          loading
          title="Chargement..."
        />
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
      title={data.arabicTitle}
      subtitle={`${data.episodes.length} épisodes`}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {data.poster ? (
            <Image
              source={{
                uri: data.poster,
              }}
              style={styles.poster}
            />
          ) : null}

          {!!data.description && (
            <Text
              style={styles.description}
            >
              {data.description}
            </Text>
          )}

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.value}>
                {data.episodes.length}
              </Text>

              <Text style={styles.label}>
                Episodes
              </Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.value}>
                1
              </Text>

              <Text style={styles.label}>
                Saison
              </Text>
            </View>
          </View>

          <Text
            style={styles.sectionTitle}
          >
            Episodes
          </Text>

          {data.episodes.map(
            (episode) => (
              <Link
                key={episode.slug}
                asChild
                href={{
                  pathname:
                    "/episode/[slug]",
                  params: {
                    slug:
                      episode.slug,
                  },
                }}
              >
                <Pressable
                  style={
                    styles.episodeCard
                  }
                >
                  <View
                    style={
                      styles.episodeLeft
                    }
                  >
                    <Text
                      style={
                        styles.episodeNumber
                      }
                    >
                      EP{" "}
                      {
                        episode.episodeNumber
                      }
                    </Text>

                    <Text
                      style={
                        styles.episodeTitle
                      }
                    >
                      {episode.title}
                    </Text>
                  </View>

                  {episode.thumbnail ? (
                    <Image
                      source={{
                        uri: episode.thumbnail,
                      }}
                      style={
                        styles.thumbnail
                      }
                    />
                  ) : null}
                </Pressable>
              </Link>
            )
          )}
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
    height: 260,
    borderRadius: 14,
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
    backgroundColor:
      colors.surface,
    borderRadius: 12,
    borderWidth:
      StyleSheet.hairlineWidth,
    borderColor:
      colors.hairline,
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
    backgroundColor:
      colors.surface,
    borderRadius: 12,
    borderWidth:
      StyleSheet.hairlineWidth,
    borderColor:
      colors.hairline,
    padding: spacing.md,
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  episodeLeft: {
    flex: 1,
    gap: spacing.xs,
  },

  episodeNumber: {
    ...type.caption,
    color: colors.accent,
  },

  episodeTitle: {
    ...type.body,
    color: colors.text,
  },

  thumbnail: {
    width: 90,
    height: 55,
    borderRadius: 8,
    marginLeft: spacing.sm,
  },
});