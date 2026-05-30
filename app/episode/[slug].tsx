import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Screen } from "@/components/Screen";
import { StateView } from "@/components/StateView";
import { useAsync } from "@/hooks/useAsync";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { type } from "@/theme/type";

export default function EpisodeDetailsScreen() {
  const { slug } =
    useLocalSearchParams<{ slug: string }>();

  const { data, loading } = useAsync(async () => {
    const response = await fetch(
      `https://qeseh.net/wp-json/wp/v2/posts/${slug}`
    );

    const episode = await response.json();

    return {
      id: episode.id,

      title:
        episode.title?.rendered ||
        "Episode",

      description:
        episode.content?.rendered
          ?.replace(/<[^>]+>/g, "")
          ?.trim() || "",

      url: episode.link,
    };
  }, [slug]);

  if (loading) {
    return (
      <Screen>
        <StateView
          loading
          title="Chargement de l'épisode"
        />
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen>
        <StateView
          icon="alert-circle-outline"
          title="Episode introuvable"
        />
      </Screen>
    );
  }

  return (
    <Screen
      title={data.title}
      subtitle="Filmieo"
    >
      <View style={styles.stack}>
        <Text style={styles.description}>
          {data.description}
        </Text>

        <View style={styles.player}>
          <Ionicons
            color={colors.accent}
            name="play-circle-outline"
            size={70}
          />

          <Text style={styles.playerTitle}>
            Regarder l'épisode
          </Text>

          <Text style={styles.playerText}>
            Ouvrir l'épisode sur Qeseh.
          </Text>

          <Pressable
            style={styles.watchButton}
            onPress={() =>
              Linking.openURL(data.url)
            }
          >
            <Text style={styles.watchText}>
              Regarder maintenant
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },

  description: {
    ...type.body,
    color: colors.text,
  },

  player: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    minHeight: 260,

    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,

    padding: spacing.xl,
  },

  playerTitle: {
    ...type.title,
    color: colors.text,
    textAlign: "center",
  },

  playerText: {
    ...type.body,
    color: colors.muted,
    textAlign: "center",
  },

  watchButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },

  watchText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});