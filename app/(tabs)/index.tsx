import { StyleSheet, View, ScrollView, Text } from "react-native";
import { Link, useRouter } from "expo-router";

import { PosterCard } from "@/components/PosterCard";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { StateView } from "@/components/StateView";
import { Skeleton } from "@/components/Skeleton";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/api/client";
import { useHistory } from "@/context/HistoryContext";
import { useFavorites } from "@/context/FavoritesContext";
import { spacing } from "@/theme/spacing";
import { colors } from "@/theme/colors";
import { type } from "@/theme/type";

type HomeData = {
  episodes: any[];
  series: any[];
  movies: any[];
};

async function loadHome(): Promise<HomeData> {
  try {
    const [episodes, series, movies] = await Promise.all([
      api.latestEpisodes(),
      api.latestSeries(),
      api.latestMovies(),
    ]);

    return { episodes, series, movies };
  } catch (error) {
    console.log(error);
    return { episodes: [], series: [], movies: [] };
  }
}

function CarouselSkeleton() {
  return (
    <View style={{ flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm }}>
      <Skeleton width={150} height={208} borderRadius={12} />
      <Skeleton width={150} height={208} borderRadius={12} />
      <Skeleton width={150} height={208} borderRadius={12} />
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { data, loading, reload } = useAsync(loadHome, []);
  const { history } = useHistory();
  const { favorites } = useFavorites();

  const hasData = data && (data.episodes.length > 0 || data.series.length > 0 || data.movies.length > 0);

  return (
    <Screen title="Filmeio" subtitle="Séries & Films Turcs">
      <View style={styles.stack}>
        
        {/* 1. NOUVEAUX EPISODES */}
        {data?.episodes && data.episodes.length > 0 && (
          <View>
            <SectionHeader title="Nouveaux Épisodes" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
              {data.episodes.map((episode) => (
                <PosterCard
                  key={`ep-${episode.slug}`}
                  title={episode.title}
                  subtitle={episode.seriesTitle}
                  poster={episode.poster || episode.thumbnail}
                  width={240}
                  aspectRatio={1.77}
                  href={{ pathname: "/episode/[slug]", params: { slug: episode.slug, poster: episode.poster || episode.thumbnail } }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* 2. CONTINUER A REGARDER (Compact) */}
        {history.length > 0 && (
          <View>
            <SectionHeader title="Continuer à regarder" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
              {history.map((item) => (
                <PosterCard
                  key={`history-${item.episodeSlug}`}
                  title={item.title}
                  subtitle={item.seriesTitle}
                  poster={item.poster}
                  width={180}
                  aspectRatio={1.77}
                  href={{ pathname: "/episode/[slug]", params: { slug: item.episodeSlug, poster: item.poster } }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* 3. FAVORIS RAPIDES (Compact) */}
        {favorites.length > 0 && (
          <View>
            <SectionHeader title="Mes Favoris" action="Voir tout" onAction={() => router.push("/favorites")} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
              {favorites.slice(0, 10).map((item) => (
                <PosterCard
                  key={`fav-${item.id}`}
                  title={item.title}
                  poster={item.poster}
                  width={100}
                  subtitle={item.type === 'series' ? 'Série' : 'Épisode'}
                  href={item.type === 'series' ? { pathname: "/series/[slug]", params: { slug: item.id } } : { pathname: "/episode/[slug]", params: { slug: item.id } }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* LOADING SKELETONS */}
        {loading && !data && (
          <>
            <View>
              <SectionHeader title="Nouveaux épisodes" />
              <CarouselSkeleton />
            </View>
            <View>
              <SectionHeader title="Séries du moment" />
              <CarouselSkeleton />
            </View>
          </>
        )}

        {/* 4. SERIES DU MOMENT */}
        {data?.series && data.series.length > 0 && (
          <View>
            <SectionHeader title="Séries du moment" action="Nouveautés" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
              {data.series.map((serie) => (
                <PosterCard
                  key={`serie-${serie.slug}`}
                  title={serie.title}
                  subtitle={serie.genre || "Série"}
                  poster={serie.poster}
                  href={{ pathname: "/series/[slug]", params: { slug: serie.slug } }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* 5. FILMS POPULAIRES */}
        {data?.movies && data.movies.length > 0 && (
          <View>
            <SectionHeader title="Films populaires" action="Voir tout" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
              {data.movies.map((movie) => (
                <PosterCard
                  key={`movie-${movie.slug}`}
                  title={movie.title}
                  subtitle={movie.year || "Film"}
                  poster={movie.poster}
                  href={{ pathname: "/episode/[slug]", params: { slug: movie.slug, poster: movie.poster } }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {!loading && !hasData ? (
          <StateView
            title="Catalogue vide"
            message="Aucune donnée disponible."
            icon="cloud-offline-outline"
            actionLabel="Recharger"
            onAction={reload}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  carousel: {
    paddingVertical: spacing.sm,
  },
});