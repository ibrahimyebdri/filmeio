import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { EpisodeSummary } from "@/api/types";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { type } from "@/theme/type";

type EpisodeRowProps = {
  episode: EpisodeSummary;
};

export function EpisodeRow({ episode }: EpisodeRowProps) {
  return (
    <Link asChild href={{ pathname: "/episode/[slug]", params: { slug: episode.slug } }}>
      <Pressable accessibilityRole="button" style={styles.row}>
        <View style={styles.badge}>
          <Ionicons color={colors.accent} name="play" size={16} />
        </View>
        <View style={styles.copy}>
          <Text numberOfLines={1} style={styles.title}>
            {episode.title}
          </Text>
          <Text numberOfLines={1} style={styles.meta}>
            {[episode.seriesTitle, episode.publishedAt].filter(Boolean).join(" · ")}
          </Text>
        </View>
        <Ionicons color={colors.muted} name="chevron-forward" size={18} />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.hairline,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 72,
    padding: spacing.md
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  copy: {
    flex: 1,
    minWidth: 0
  },
  title: {
    ...type.headline,
    color: colors.text
  },
  meta: {
    ...type.caption,
    color: colors.muted,
    marginTop: spacing.xs
  }
});
