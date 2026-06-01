import { useLocalSearchParams, useRouter } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StateView } from "@/components/StateView";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/api/client";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { type } from "@/theme/type";
import { Ionicons } from "@expo/vector-icons";
import { useFavorites } from "@/context/FavoritesContext";
import { useHistory } from "@/context/HistoryContext";
import { useEffect, useRef, useState } from "react";

let WebView: any = null;

if (Platform.OS !== "web") {
  WebView = require("react-native-webview").WebView;
}

const { width } = Dimensions.get("window");
// Ratio 16:9 for video player
const VIDEO_HEIGHT = width * (9 / 16);

export default function EpisodeDetailsScreen() {
  const { slug, poster } = useLocalSearchParams<{ slug: string; poster?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data, loading } = useAsync(
    async () => {
      return await api.getEpisode(slug || "");
    },
    [slug]
  );

  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { addToHistory, updateProgress, getHistoryItem } = useHistory();
  const webviewRef = useRef<any>(null);
  
  // Server Selection
  const [selectedServerName, setSelectedServerName] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      addToHistory({
        episodeSlug: data.slug,
        seriesSlug: data.seriesTitle || "",
        title: data.title,
        seriesTitle: data.seriesTitle || "",
        poster: data.poster || poster || "",
        progress: 0,
      });

      // Select default server
      if (!selectedServerName && data.servers.length > 0) {
        const defaultServer = data.servers.find(s => s.name === "estream") 
                           || data.servers.find(s => s.name === "Arab HD") 
                           || data.servers[0];
        if (defaultServer) {
          setSelectedServerName(defaultServer.name);
        }
      }
    }
  }, [data]);

  if (loading) {
    return (
      <View style={[styles.main, { paddingTop: insets.top }]}>
        <StateView loading title="Chargement de l'épisode" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.main, { paddingTop: insets.top }]}>
        <StateView icon="alert-circle-outline" title="Episode introuvable" />
      </View>
    );
  }

  const server = data.servers.find(s => s.name === selectedServerName) || data.servers[0];

  if (!server) {
    return (
      <View style={[styles.main, { paddingTop: insets.top }]}>
        <StateView icon="videocam-off-outline" title="Vidéo introuvable" message="Aucun serveur disponible." />
      </View>
    );
  }

  const favorite = isFavorite(data.slug);

  return (
    <View style={styles.main}>
      {/* BOUTONS FLOTTANTS GLOBAUX AU DESSUS DE LA VIDEO */}
      <View style={[styles.floatingTopBar, { top: insets.top + spacing.md }]}>
        <Pressable
          style={styles.iconButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>

        <Pressable
          style={styles.iconButton}
          onPress={() => {
            if (favorite) {
              removeFavorite(data.slug);
            } else {
              addFavorite({
                id: data.slug,
                title: `${data.seriesTitle} - ${data.title}`,
                poster: data.poster || poster || "",
                type: 'episode'
              });
            }
          }}
        >
          <Ionicons
            name={favorite ? "heart" : "heart-outline"}
            size={26}
            color={favorite ? colors.accent : "#000"}
          />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* PLAYER SECTION (EDGE-TO-EDGE) */}
        <View style={[styles.playerContainer, { marginTop: Platform.OS === 'web' ? spacing.xl * 3 : insets.top + spacing.xl * 3 }]}>
          {Platform.OS === "web" ? (
            <iframe
              src={server.iframeUrl}
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="autoplay; fullscreen; picture-in-picture"
              referrerPolicy="no-referrer"
            />
          ) : (
            <WebView
              key={server.iframeUrl} // Force reload on server change
              source={{ uri: server.iframeUrl }}
              style={styles.webview}
              javaScriptEnabled
              domStorageEnabled
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback
              startInLoadingState
              sharedCookiesEnabled={true}
              thirdPartyCookiesEnabled={true}
              mixedContentMode="always"
              ref={webviewRef}
              injectedJavaScript={`
                (function() {
                  var lastPos = 0;
                  setInterval(function() {
                    try {
                      var players = document.getElementsByTagName('video');
                      if (players.length > 0) {
                        var pos = players[0].currentTime;
                        if (pos > 0 && Math.abs(pos - lastPos) > 5) {
                          lastPos = pos;
                          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'progress', progress: pos }));
                        }
                      }
                    } catch(e) {}
                  }, 5000);
                  
                  var savedPos = ${getHistoryItem(data.slug)?.progress || 0};
                  if (savedPos > 0) {
                    setTimeout(function() {
                      try {
                         var players = document.getElementsByTagName('video');
                         if (players.length > 0) {
                           players[0].currentTime = savedPos;
                         }
                      } catch(e) {}
                    }, 3000);
                  }
                })();
                true;
              `}
              onMessage={(event: any) => {
                try {
                  const msg = JSON.parse(event.nativeEvent.data);
                  if (msg.type === 'progress' && msg.progress > 0) {
                    updateProgress(data.slug, msg.progress);
                  }
                } catch (e) {}
              }}
            />
          )}
        </View>

        {/* DETAILS SECTION */}
        <View style={styles.detailsContainer}>
          <View style={styles.titleRow}>
            <View style={styles.titleContent}>
              <Text style={styles.seriesTitle}>{data.seriesTitle || "Film"}</Text>
              <Text style={styles.episodeTitle}>{data.title}</Text>
            </View>
          </View>

          {/* SERVERS SELECTION */}
          {data.servers.length > 1 && (
            <View style={styles.serversSection}>
              <Text style={styles.sectionSubtitle}>Sources disponibles :</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serversList}>
                {data.servers.map((srv, idx) => {
                  const isActive = srv.name === server.name;
                  return (
                    <Pressable
                      key={idx}
                      style={[styles.serverPill, isActive && styles.serverPillActive]}
                      onPress={() => setSelectedServerName(srv.name)}
                    >
                      <Ionicons 
                        name={isActive ? "play-circle" : "cloud-outline"} 
                        size={16} 
                        color={isActive ? colors.surface : colors.muted} 
                      />
                      <Text style={[styles.serverText, isActive && styles.serverTextActive]}>
                        {srv.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* DESCRIPTION */}
          <View style={styles.descriptionCard}>
            <Text style={styles.description}>
              {(data as any).seriesDescription || data.description || "Aucune description disponible pour cette vidéo."}
            </Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: colors.background,
  },
  floatingTopBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
playerContainer: {
  width: "100%",
  maxWidth: 1000, // ou 900, 1100 selon ton goût
  height: VIDEO_HEIGHT,
   maxHeight: 500, // ou 900, 1100 selon ton goût
  backgroundColor: "#000",
  alignSelf: "center",
},
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  detailsContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  titleContent: {
    flex: 1,
    paddingRight: spacing.md,
  },
  seriesTitle: {
    ...type.caption,
    color: colors.accent,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  episodeTitle: {
    ...type.headline,
    fontSize: 24,
    color: colors.text,
    lineHeight: 30,
  },

  serversSection: {
    marginBottom: spacing.xl,
  },
  sectionSubtitle: {
    ...type.caption,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  serversList: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  serverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  serverPillActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  serverText: {
    ...type.caption,
    color: colors.text,
    fontWeight: '600',
  },
  serverTextActive: {
    color: colors.surface,
  },
  descriptionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  description: {
    ...type.body,
    color: colors.text,
    lineHeight: 24,
  },
});