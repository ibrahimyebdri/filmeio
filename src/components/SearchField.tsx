import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { type } from "@/theme/type";

type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit?: () => void;
};

export function SearchField({ value, onChangeText, onSubmit }: SearchFieldProps) {
  return (
    <View style={styles.container}>
      <Ionicons color={colors.muted} name="search" size={18} />
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder="Rechercher une serie"
        placeholderTextColor={colors.muted}
        returnKeyType="search"
        style={styles.input}
        value={value}
      />
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
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md
  },
  input: {
    ...type.body,
    color: colors.text,
    flex: 1,
    minHeight: 48,
    paddingVertical: 0
  }
});
