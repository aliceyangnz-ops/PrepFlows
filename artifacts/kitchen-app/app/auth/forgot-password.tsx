import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { error: resetError } = await resetPassword(
      email.trim().toLowerCase(),
    );

    setLoading(false);
    if (resetError) {
      setError(resetError);
    } else {
      setSent(true);
    }
  }

  const s = styles(insets.top);

  if (sent) {
    return (
      <View
        style={[
          s.root,
          { justifyContent: "center", alignItems: "center", padding: 32 },
        ]}
      >
        <View style={s.orbTopRight} pointerEvents="none" />
        <View style={s.sentMark}>
          <LinearGradient
            colors={["#3B82F6", "#06B6D4", "#818CF8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.sentMarkGrad}
          >
            <Feather name="mail" size={28} color="#fff" />
          </LinearGradient>
        </View>
        <Text style={s.sentTitle}>Reset link sent</Text>
        <Text style={s.sentSub}>
          Check {email} for a link to reset your password. The link expires in 1
          hour.
        </Text>
        <Pressable
          onPress={() => router.replace("/auth/login")}
          style={({ pressed }) => [
            { opacity: pressed ? 0.7 : 1, width: "100%" },
          ]}
        >
          <LinearGradient
            colors={["#3B82F6", "#06B6D4", "#818CF8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.primaryBtn}
          >
            <Text style={s.primaryBtnText}>Back to sign in</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.orbTopRight} pointerEvents="none" />
      <View style={s.orbBottomLeft} pointerEvents="none" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={s.inner}>
          <Pressable
            style={s.backLink}
            onPress={() => router.back()}
            hitSlop={12}
          >
            <Feather name="arrow-left" size={18} color="#3B82F6" />
            <Text style={s.backText}>Back</Text>
          </Pressable>

          <View style={s.iconWrap}>
            <Feather name="lock" size={28} color="#3B82F6" />
          </View>

          <Text style={s.title}>Forgot your password?</Text>
          <Text style={s.sub}>
            Enter your email address and we'll send you a link to reset it.
          </Text>

          {error && (
            <View style={s.errorBox}>
              <Feather name="alert-circle" size={14} color="#EF4444" />
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <Text style={s.label}>Email</Text>
          <TextInput
            style={s.input}
            placeholder="you@example.com"
            placeholderTextColor="#3A4250"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="go"
            onSubmitEditing={handleReset}
          />

          <Pressable
            onPress={handleReset}
            disabled={loading}
            style={({ pressed }) => [{ opacity: pressed || loading ? 0.7 : 1 }]}
          >
            <LinearGradient
              colors={["#3B82F6", "#06B6D4", "#818CF8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.primaryBtn}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={s.primaryBtnText}>Send reset link</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = (topInset: number) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: "#0D1117" },
    orbTopRight: {
      position: "absolute",
      top: -80,
      right: -80,
      width: 240,
      height: 240,
      borderRadius: 120,
      backgroundColor: "#1E3A5F",
      opacity: 0.35,
    },
    orbBottomLeft: {
      position: "absolute",
      bottom: -100,
      left: -100,
      width: 280,
      height: 280,
      borderRadius: 140,
      backgroundColor: "#1B2F4A",
      opacity: 0.3,
    },
    inner: {
      flex: 1,
      paddingTop: topInset + 16,
      paddingHorizontal: 24,
    },
    backLink: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 40,
      alignSelf: "flex-start",
    },
    backText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: "#3B82F6",
    },
    iconWrap: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: "rgba(59,130,246,0.12)",
      borderWidth: 1,
      borderColor: "rgba(59,130,246,0.25)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontFamily: "Inter_700Bold",
      color: "#F0F6FC",
      marginBottom: 8,
    },
    sub: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: "#4A5568",
      lineHeight: 22,
      marginBottom: 28,
    },
    errorBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      backgroundColor: "rgba(239,68,68,0.08)",
      borderWidth: 1,
      borderColor: "rgba(239,68,68,0.25)",
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      flex: 1,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: "#EF4444",
    },
    label: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: "#5A7A9A",
      marginBottom: 6,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    input: {
      backgroundColor: "#161B22",
      borderWidth: 1,
      borderColor: "#1E2A3A",
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 13,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: "#F0F6FC",
      marginBottom: 20,
    },
    primaryBtn: {
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 50,
    },
    primaryBtnText: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: "#fff",
      letterSpacing: 0.3,
    },
    sentMark: {
      width: 80,
      height: 80,
      borderRadius: 40,
      overflow: "hidden",
      marginBottom: 20,
    },
    sentMarkGrad: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    sentTitle: {
      fontSize: 24,
      fontFamily: "Inter_700Bold",
      color: "#F0F6FC",
      marginBottom: 10,
    },
    sentSub: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: "#4A5568",
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 32,
    },
  });
