import { Link } from "expo-router";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  DimensionValue,
} from "react-native";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { type } from "@/theme/type";

type PosterCardProps = {
  title: string;
  poster?: string;
  subtitle?: string;
  href?: any;
  onPress?: () => void;
  width?: DimensionValue;
  aspectRatio?: number;
  marginRight?: number;
};

export function PosterCard({
  title,
  poster,
  subtitle,
  href,
  onPress,
  width = 120,
  aspectRatio = 0.72,
  marginRight = spacing.md,
}: PosterCardProps) {
  const content = (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={StyleSheet.flatten([styles.card, { width, marginRight }])}
    >
      <View style={[styles.poster, { aspectRatio }]}>
        {poster ? (
          <Image
            source={{
              uri: poster,
            }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Text
            numberOfLines={2}
            style={styles.placeholder}
          >
            {title}
          </Text>
        )}
      </View>

      <Text
        numberOfLines={2}
        style={styles.title}
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          numberOfLines={1}
          style={styles.meta}
        >
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );

  if (href) {
    return (
      <Link asChild href={href}>
        {content}
      </Link>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
  },

  poster: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor:
      colors.surfaceAlt,
    borderWidth:
      StyleSheet.hairlineWidth,
    borderColor:
      colors.hairline,
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  placeholder: {
    ...type.headline,
    color: colors.muted,
    textAlign: "center",
    padding: spacing.md,
  },

  title: {
    ...type.headline,
    color: colors.text,
    marginTop: spacing.sm,
  },

  meta: {
    ...type.caption,
    color: colors.muted,
    marginTop: spacing.xs,
  },
});