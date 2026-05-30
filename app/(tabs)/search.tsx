import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { searchSeries } from "@/api/qeseh";
import { PosterCard } from "@/components/PosterCard";
import { Screen } from "@/components/Screen";
import { SearchField } from "@/components/SearchField";
import { StateView } from "@/components/StateView";
import { spacing } from "@/theme/spacing";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const trimmedQuery = useMemo(
    () => query.trim(),
    [query]
  );

  async function submitSearch() {
    if (!trimmedQuery) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);

      const data =
        await searchSeries(
          trimmedQuery
        );

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

      setResults(
        uniqueResults
      );
    } catch (error) {
      console.log(error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen
      title="Recherche"
      subtitle="Trouver rapidement une série"
    >
      <View style={styles.stack}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          onSubmit={
            submitSearch
          }
        />

        {loading ? (
          <StateView
            loading
            title="Recherche..."
          />
        ) : null}

        {!loading &&
        trimmedQuery &&
        results.length ===
          0 ? (
          <StateView
            icon="search-outline"
            title="Aucun résultat"
          />
        ) : null}

        {!loading &&
        results.length >
          0 ? (
          <View
            style={
              styles.grid
            }
          >
            {results.map(
              (
                series,
                index
              ) => (
                <PosterCard
                  key={`${series.slug}-${index}`}
                  series={{
                    slug:
                      series.slug,
                    title:
                      series.title,
                    poster:
                      series.poster,
                    year:
                      "",
                    genre:
                      "Turkish Drama",
                  }}
                />
              )
            )}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles =
  StyleSheet.create({
    stack: {
      gap: spacing.lg,
    },

    grid: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: spacing.lg,
    },
  });