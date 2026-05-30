import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { api } from "@/api/client";
import { mockSeries } from "@/api/mock";
import { SeriesSummary } from "@/api/types";
import { PosterCard } from "@/components/PosterCard";
import { Screen } from "@/components/Screen";
import { SearchField } from "@/components/SearchField";
import { StateView } from "@/components/StateView";
import { spacing } from "@/theme/spacing";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SeriesSummary[]>([]);
  const trimmedQuery = useMemo(() => query.trim(), [query]);

  async function submitSearch() {
    if (!trimmedQuery) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      setResults(await api.searchSeries(trimmedQuery));
    } catch {
      const lowered = trimmedQuery.toLowerCase();
      setResults(mockSeries.filter((series) => series.title.toLowerCase().includes(lowered)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Recherche" subtitle="Trouve rapidement une serie par titre.">
      <View style={styles.stack}>
        <SearchField onChangeText={setQuery} onSubmit={submitSearch} value={query} />

        {loading ? <StateView loading title="Recherche en cours" /> : null}

        {!loading && trimmedQuery && results.length === 0 ? (
          <StateView
            icon="search-outline"
            message="Essaie un autre titre ou verifie que le backend est lance."
            title="Aucun resultat"
          />
        ) : null}

        {!loading && !trimmedQuery ? (
          <StateView icon="sparkles-outline" message="Saisis un titre, puis valide la recherche." title="Pret a chercher" />
        ) : null}

        {!loading && results.length > 0 ? (
          <View style={styles.grid}>
            {results.map((series) => (
              <PosterCard key={series.slug} series={series} />
            ))}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg
  }
});
