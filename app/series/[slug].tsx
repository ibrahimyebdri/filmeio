import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter, Link } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  Platform,
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

export default function SeriesDetailsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [aspectRatio, setAspectRatio] = useState(0.7);

  const { data, loading } = useAsync(
    async () => {
      return await api.getSeries(slug || "");
    },
    [slug]
  );

  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  useEffect(() => {
    if (data?.poster) {
      Image.getSize(
        data.poster,
        (w, h) => {
          if (w && h) setAspectRatio(w / h);
        },
        () => {} // silent error, keep fallback
      );
    }
  }, [data?.poster]);

  if (loading) {
    return (
      <View style={[styles.main, { paddingTop: insets.top }]}>
        <StateView loading title="Chargement..." />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.main, { paddingTop: insets.top }]}>
        <StateView icon="alert-circle-outline" title="Série introuvable" />
      </View>
    );
  }

  const favorite = isFavorite(data.slug);
  const displayTitle = (data as any).arabicTitle || data.title;
  const isMovie = data.episodes.length === 0;

  return (
    <View style={styles.main}>
      {/* BOUTONS FLOTTANTS GLOBAUX */}
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
                title: displayTitle,
                poster: data.poster || "",
                type: 'series'
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

      <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
        {/* HEADER SIMPLE ET PROPRE */}
        <View style={[styles.headerContainer, { paddingTop: insets.top + spacing.xl * 3 }]}>
          <View style={[styles.posterContainer, { aspectRatio }]}>
            {data.poster ? (
              <Image
                source={{ uri: data.poster }}
                style={styles.poster}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.poster, { backgroundColor: colors.surfaceAlt }]} />
            )}
          </View>

          {/* Titre et Meta */}
          <View style={styles.headerContent}>
            <Text style={styles.heroTitle} numberOfLines={2}>
              {displayTitle}
            </Text>
            
            <View style={styles.metaRow}>
              {!!data.year && <Text style={styles.metaText}>{data.year}</Text>}
              {!!data.rating && (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>⭐ {data.rating}</Text>
                </>
              )}
              {!!data.genre && (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>{data.genre}</Text>
                </>
              )}
            </View>

            {/* Bouton Play Primaire */}
            {data.episodes.length > 0 && (
              <Link
                asChild
                href={{
                  pathname: "/episode/[slug]",
                  params: {
                    slug: data.episodes[data.episodes.length - 1].slug,
                    poster: data.poster || "",
                  },
                }}
              >
                <Pressable style={styles.playButton}>
                  <Ionicons name="play" size={24} color="#FFF" />
                  <Text style={styles.playButtonText}>Lecture</Text>
                </Pressable>
              </Link>
            )}
          </View>
        </View>

        {/* CONTENU */}
        <View style={styles.contentContainer}>
          {!!data.description && (
            <Text style={styles.description}>{data.description}</Text>
          )}

          {!isMovie && (
            <View style={styles.episodesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Épisodes</Text>
                <Text style={styles.episodeCount}>{data.episodes.length}</Text>
              </View>

              {/* LISTE COMPACTE EN GRILLE */}
              <View style={styles.episodesGrid}>
                {data.episodes.map((episode) => (
                  <Link
                    key={episode.slug}
                    asChild
                    href={{
                      pathname: "/episode/[slug]",
                      params: {
                        slug: episode.slug,
                        poster: data.poster || "",
                      },
                    }}
                  >
                    <Pressable style={styles.episodePill}>
                      <Ionicons name="play-circle" size={20} color={colors.accent} />
                      <Text style={styles.episodePillText} numberOfLines={1}>
                        Épisode {episode.episodeNumber}
                      </Text>
                    </Pressable>
                  </Link>
                ))}
              </View>
            </View>
          )}
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
  headerContainer: {
    width: "100%",
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
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
  posterContainer: {
    width: "100%",
    maxWidth: 500,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginBottom: spacing.xl,
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  headerContent: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  heroTitle: {
    ...type.headline,
    fontSize: 28,
    lineHeight: 34,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  metaText: {
    ...type.caption,
    color: colors.muted,
    fontWeight: '500',
  },
  metaDot: {
    ...type.caption,
    color: colors.muted,
    marginHorizontal: spacing.sm,
  },
  playButton: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: spacing.sm,
    width: '100%',
    maxWidth: 300,
  },
  playButtonText: {
    ...type.headline,
    color: '#FFF',
    fontSize: 16,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  description: {
    ...type.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  episodesSection: {
    marginTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...type.headline,
    fontSize: 20,
    color: colors.text,
  },
  episodeCount: {
    ...type.caption,
    color: colors.muted,
    fontSize: 14,
  },
  episodesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  episodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    width: '48%', // Allows 2 columns on mobile
  },
  episodePillText: {
    ...type.caption,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
});