import { Link } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { type } from "@/theme/type";

type PosterCardProps = {
  series: {
    slug: string;
    title: string;
    poster?: string;
    year?: string;
    genre?: string;
  };
};

export function PosterCard({ series }: PosterCardProps) {
  return (
    <Link
      asChild
      href={{
        pathname: "/series/[slug]",
        params: { slug: series.slug }
      }}
    >
      <Pressable accessibilityRole="button" style={styles.card}>
        <View style={styles.poster}>
          {series.poster ? (
            <Image
              source={{ uri: series.poster }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Text numberOfLines={2} style={styles.placeholder}>
              {series.title}
            </Text>
          )}
        </View>

        <Text numberOfLines={2} style={styles.title}>
          {series.title}
        </Text>

        <Text numberOfLines={1} style={styles.meta}>
          {[series.year, series.genre]
            .filter(Boolean)
            .join(" · ") || "Série"}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    marginRight: spacing.md
  },

  poster: {
    aspectRatio: 0.72,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.surfaceAlt,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    justifyContent: "center",
    alignItems: "center"
  },

  image: {
    width: "100%",
    height: "100%"
  },

  placeholder: {
    ...type.headline,
    color: colors.muted,
    textAlign: "center",
    padding: spacing.md
  },

  title: {
    ...type.headline,
    color: colors.text,
    marginTop: spacing.sm
  },

  meta: {
    ...type.caption,
    color: colors.muted,
    marginTop: spacing.xs
  }
});