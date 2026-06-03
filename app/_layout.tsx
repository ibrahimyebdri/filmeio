import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { HistoryProvider } from "@/context/HistoryContext";

import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

// Prevent auto-hide so the splash screen stays while fonts load
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      if (fontError) {
        console.error("Error loading fonts:", fontError);
      }
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HistoryProvider>
        <FavoritesProvider>
          <StatusBar style="dark" />

        <Stack
          screenOptions={{
            contentStyle: {
              backgroundColor:
                colors.background,
            },

            headerBackTitle:
              "Retour",

            headerShadowVisible:
              false,

            headerStyle: {
              backgroundColor:
                colors.background,
            },

            headerTintColor:
              colors.text,
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="series/[slug]"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="episode/[slug]"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="+not-found"
          />
        </Stack>
        </FavoritesProvider>
      </HistoryProvider>
    </GestureHandlerRootView>
  );
}