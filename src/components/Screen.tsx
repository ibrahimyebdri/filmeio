import { PropsWithChildren } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { type } from "@/theme/type";

type ScreenProps =
  PropsWithChildren<{
    title?: string;
    subtitle?: string;
    scroll?: boolean;
    rightAction?: React.ReactNode;
  }>;

export function Screen({
  children,
  title,
  subtitle,
  scroll = true,
  rightAction,
}: ScreenProps) {
  const content = (
    <View style={styles.content}>
      {(title || subtitle || rightAction) && (
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {title ? (
              <Text style={styles.title}>
                {title}
              </Text>
            ) : null}

            {subtitle ? (
              <Text
                style={styles.subtitle}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
          
          {rightAction && (
            <View style={styles.rightAction}>
              {rightAction}
            </View>
          )}
        </View>
      )}

      {children}
    </View>
  );

  return (
    <SafeAreaView
      style={styles.safe}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  scrollContent: {
    paddingBottom:
      spacing.xxl,
  },

  content: {
    flex: 1,
    paddingHorizontal:
      spacing.lg,
    paddingTop:
      spacing.lg,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom:
      spacing.md,
  },

  titleContainer: {
    flex: 1,
    gap: spacing.xs,
  },

  rightAction: {
    marginLeft: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    ...type.largeTitle,
    color: colors.text,
  },

  subtitle: {
    ...type.body,
    color: colors.muted,
  },
});