import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { api } from "@/api/client";
import { PosterCard } from "@/components/PosterCard";
import { Screen } from "@/components/Screen";
import { SearchField } from "@/components/SearchField";
import { StateView } from "@/components/StateView";
import { SectionHeader } from "@/components/SectionHeader";
import { useAsync } from "@/hooks/useAsync";
import { spacing } from "@/theme/spacing";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch trending series
  const { data: trendingSeries } = useAsync(
    () => api.latestSeries(),
    []
  );

  const trimmedQuery = useMemo(
    () => query.trim(),
    [query]
  );

  async function submitSearch() {
    if (!trimmedQuery) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);

      const data = await api.searchSeries(trimmedQuery);

      const uniqueResults =
        Array.from(
          new Map(
            data.map(
              (item: any) => [
                item.slug,
                item,
              ]
            )
          ).values()
        );

      setResults(uniqueResults);
    } catch (error) {
      console.log(error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const showTrending = !trimmedQuery || (!loading && hasSearched && results.length === 0);

  return (
    <Screen
      title="Recherche"
      subtitle="Trouver rapidement une série"
    >
      <View style={styles.stack}>
        <SearchField
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            if (!text.trim()) {
              setHasSearched(false);
              setResults([]);
            }
          }}
          onSubmit={submitSearch}
        />

        {loading ? (
          <StateView
            loading
            title="Recherche..."
          />
        ) : null}

        {!loading && hasSearched && results.length === 0 ? (
          <StateView
            icon="search-outline"
            title="Aucun résultat"
          />
        ) : null}

        {!loading && results.length > 0 ? (
          <View style={styles.grid}>
            {results.map((series, index) => (
              <PosterCard
                key={`search-${series.slug}-${index}`}
                title={series.title}
                poster={series.poster}
                width="48%"
                marginRight={0}
                href={{
                  pathname: "/series/[slug]",
                  params: { slug: series.slug }
                }}
              />
            ))}
          </View>
        ) : null}

        {showTrending && trendingSeries && trendingSeries.length > 0 ? (
          <View style={styles.trendingSection}>
            <SectionHeader title="Séries du moment" />
            <View style={styles.grid}>
              {trendingSeries.map((series, index) => (
                <PosterCard
                  key={`trending-${series.slug}-${index}`}
                  title={series.title}
                  poster={series.poster}
                  width="48%"
                  marginRight={0}
                  href={{
                    pathname: "/series/[slug]",
                    params: { slug: series.slug }
                  }}
                />
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.lg,
  },
  trendingSection: {
    marginTop: spacing.md,
  },
});