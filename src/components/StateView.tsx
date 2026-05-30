import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { type } from "@/theme/type";

type StateViewProps = {
  title: string;
  message?: string;
  actionLabel?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  onAction?: () => void;
};

export function StateView({ title, message, actionLabel, icon, loading, onAction }: StateViewProps) {
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator color={colors.accent} />
      ) : icon ? (
        <Ionicons color={colors.muted} name={icon} size={24} />
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={styles.button}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.hairline,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 180,
    padding: spacing.xl
  },
  title: {
    ...type.headline,
    color: colors.text,
    textAlign: "center"
  },
  message: {
    ...type.body,
    color: colors.muted,
    textAlign: "center"
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    marginTop: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    justifyContent: "center"
  },
  buttonText: {
    ...type.headline,
    color: colors.surface
  }
});
