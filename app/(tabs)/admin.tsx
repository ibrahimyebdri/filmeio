import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { api } from "@/api/client";
import { CronResult } from "@/api/types";
import { Screen } from "@/components/Screen";
import { StateView } from "@/components/StateView";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { type } from "@/theme/type";

export default function AdminScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CronResult>();
  const [error, setError] = useState<string>();

  async function runCron() {
    setLoading(true);
    setError(undefined);
    setResult(undefined);

    try {
      setResult(await api.scrapeCron());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Impossible de lancer la synchronisation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Admin" subtitle="Synchronisation du cache Firestore depuis la source configuree.">
      <View style={styles.stack}>
        <Pressable accessibilityRole="button" disabled={loading} onPress={runCron} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{loading ? "Synchronisation..." : "Lancer scrapeCron"}</Text>
        </Pressable>

        {loading ? <StateView loading title="Mise a jour en cours" /> : null}

        {error ? (
          <StateView icon="alert-circle-outline" message={error} title="Synchronisation impossible" />
        ) : null}

        {result ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>{result.ok ? "Synchronisation terminee" : "Synchronisation incomplete"}</Text>
            <Text style={styles.panelText}>{result.message ?? "Cache Firestore mis a jour."}</Text>
            <Text style={styles.panelMeta}>
              Series: {result.latestSeriesCount ?? 0} · Episodes: {result.latestEpisodesCount ?? 0}
            </Text>
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
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.text,
    borderRadius: 8,
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: spacing.lg
  },
  primaryButtonText: {
    ...type.headline,
    color: colors.surface
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.hairline,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    padding: spacing.lg
  },
  panelTitle: {
    ...type.headline,
    color: colors.text
  },
  panelText: {
    ...type.body,
    color: colors.muted
  },
  panelMeta: {
    ...type.caption,
    color: colors.success
  }
});
