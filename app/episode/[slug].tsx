import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import { WebView } from "react-native-webview";

import { Screen } from "@/components/Screen";
import { StateView } from "@/components/StateView";
import { useAsync } from "@/hooks/useAsync";
import qeseh from "@/api/qeseh";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { type } from "@/theme/type";

export default function EpisodeDetailsScreen() {
  const { slug } =
    useLocalSearchParams<{ slug: string }>();

  const { data, loading } = useAsync(
    async () => {
      return await qeseh.getEpisodeDetails(
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

  const server =
    data.servers.find(
      (s) => s.name === "estream"
    ) ||
    data.servers.find(
      (s) => s.name === "Arab HD"
    );

  if (!server) {
    return (
      <Screen title={data.title}>
        <StateView
          icon="videocam-off-outline"
          title="Vidéo introuvable"
          message="Aucun serveur disponible."
        />
      </Screen>
    );
  }

  return (
    <Screen
      title={data.title}
      subtitle={data.seriesTitle}
      scroll={false}
    >
      <View style={styles.container}>
        <View style={styles.playerContainer}>
          <WebView
            source={{
              uri: server.iframeUrl,
            }}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={
              false
            }
            allowsInlineMediaPlayback
            startInLoadingState
          />
        </View>

        <View style={styles.info}>
          <Text style={styles.serverName}>
            Serveur : {server.name}
          </Text>

          <Text style={styles.description}>
            {
              data.seriesDescription
            }
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  playerContainer: {
    height: 280,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },

  webview: {
    flex: 1,
    backgroundColor: "#000",
  },

  info: {
    paddingTop: spacing.md,
    gap: spacing.sm,
  },

  serverName: {
    ...type.headline,
    color: colors.text,
  },

  description: {
    ...type.body,
    color: colors.muted,
  },
});