import { Link } from "expo-router";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { EpisodeSummary } from "@/api/types";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { type } from "@/theme/type";

type EpisodeRowProps = {
  episode: EpisodeSummary;
};

export function EpisodeRow({
  episode,
}: EpisodeRowProps) {
  return (
    <Link
      asChild
      href={{
        pathname: "/episode/[slug]",
        params: {
          slug: episode.slug,
        },
      }}
    >
      <Pressable style={styles.card}>
        {episode.poster ? (
          <Image
            source={{
              uri: episode.poster,
            }}
            style={styles.poster}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Text style={styles.placeholderText}>
              EP
            </Text>
          </View>
        )}

        <View style={styles.content}>
          <Text
            numberOfLines={2}
            style={styles.title}
          >
            {episode.title}
          </Text>

          {!!episode.seriesTitle && (
            <Text
              numberOfLines={1}
              style={styles.series}
            >
              {episode.seriesTitle}
            </Text>
          )}

          {!!episode.episodeNumber && (
            <Text style={styles.meta}>
              Épisode {episode.episodeNumber}
            </Text>
          )}

          {!!episode.publishedAt && (
            <Text
              numberOfLines={1}
              style={styles.meta}
            >
              {episode.publishedAt}
            </Text>
          )}
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth:
      StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    minHeight: 120,
  },

  poster: {
    width: 110,
    height: 120,
  },

  posterPlaceholder: {
    width: 110,
    height: 120,
    backgroundColor:
      colors.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.muted,
  },

  content: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "center",
  },

  title: {
    ...type.headline,
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
  },

  series: {
    ...type.body,
    color: colors.accent,
    marginTop: 6,
  },

  meta: {
    ...type.caption,
    color: colors.muted,
    marginTop: 4,
  },
});