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

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthGate() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "auth";
    const inBriefGroup = segments[0] === "brief";

    if (!session && !inAuthGroup && !inBriefGroup) {
      router.replace("/auth/login");
    } else if (session && inAuthGroup) {
      router.replace("/");
    }
  }, [session, loading, segments[0]]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0D1117",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#EAB308" />
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
            <KeyboardProvider>
              <AuthProvider>
                <TeamProvider>
                  <KitchenProvider>
                    <AuthGate />
                  </KitchenProvider>
                </TeamProvider>
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
