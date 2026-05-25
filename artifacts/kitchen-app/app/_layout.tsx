import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { KitchenProvider } from "@/context/KitchenContext";
import { TeamProvider } from "@/context/TeamContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthGate() {
  const { session, loading, isGuest } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colors = useColors();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "auth";
    const inBriefGroup = segments[0] === "brief";
    const isLoggedIn = !!session || isGuest;

    if (!isLoggedIn && !inAuthGroup && !inBriefGroup) {
      router.replace("/auth/login");
    } else if (isLoggedIn && inAuthGroup) {
      router.replace("/");
    }
  }, [session, isGuest, loading, segments[0]]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="brief/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="brief/today" options={{ headerShown: false }} />
      <Stack.Screen
        name="function/[id]"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="import-events"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen name="manage" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="subscribe" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen
        name="staff/[id]"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="prep-print/[id]"
        options={{ headerShown: false, presentation: "card" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
            <KeyboardProvider>
              <AuthProvider>
                <SubscriptionProvider>
                  <TeamProvider>
                    <KitchenProvider>
                      <AuthGate />
                    </KitchenProvider>
                  </TeamProvider>
                </SubscriptionProvider>
              </AuthProvider>
            </KeyboardProvider>
            </ThemeProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
