import { Link } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { Screen } from "@/components/Screen";
import { StateView } from "@/components/StateView";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { type } from "@/theme/type";

export default function NotFoundScreen() {
  return (
    <Screen title="Page introuvable" subtitle="Le contenu demande n'existe pas ou n'est plus disponible.">
      <StateView icon="alert-circle-outline" title="Rien ici" message="Retourne a l'accueil pour continuer." />
      <Link asChild href="/">
        <Pressable accessibilityRole="button" style={styles.button}>
          <Text style={styles.buttonText}>Accueil</Text>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 8,
    marginTop: spacing.lg,
    minHeight: 48,
    justifyContent: "center"
  },
  buttonText: {
    ...type.headline,
    color: colors.surface
  }
});
