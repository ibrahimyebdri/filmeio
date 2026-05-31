import React from 'react';
import { View, StyleSheet, FlatList, Dimensions, Platform } from 'react-native';
import { Screen } from '@/components/Screen';
import { StateView } from '@/components/StateView';
import { PosterCard } from '@/components/PosterCard';
import { useFavorites } from '@/context/FavoritesContext';
import { spacing } from '@/theme/spacing';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const numColumns = Platform.OS === 'web' ? 4 : 3;
const cardWidth = (width - spacing.md * (numColumns + 1)) / numColumns;

export default function FavoritesScreen() {
  const { favorites, loading } = useFavorites();
  const router = useRouter();

  if (loading) {
    return (
      <Screen title="Favoris" scroll={false}>
        <StateView
          loading
          title="Chargement..."
        />
      </Screen>
    );
  }

  if (favorites.length === 0) {
    return (
      <Screen title="Favoris" scroll={false}>
        <StateView
          icon="heart-outline"
          title="Aucun favori"
          message="Vos séries et épisodes préférés apparaîtront ici. Cliquez sur le cœur pour les ajouter."
        />
      </Screen>
    );
  }

  return (
    <Screen 
      title="Favoris" 
      subtitle={`${favorites.length} élément${favorites.length > 1 ? 's' : ''}`}
      scroll={false}
    >
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <PosterCard
            title={item.title}
            poster={item.poster}
            width={cardWidth}
            onPress={() => {
              if (item.type === 'series') {
                router.push(`/series/${item.id}`);
              } else {
                router.push({ pathname: `/episode/[slug]`, params: { slug: item.id, poster: item.poster } });
              }
            }}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.md,
    gap: spacing.md,
  },
  row: {
    gap: spacing.md,
  },
});
