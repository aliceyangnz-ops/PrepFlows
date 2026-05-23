import * as Haptics from "expo-haptics";
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
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { error: resetError } = await resetPassword(email.trim().toLowerCase());

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
      <View style={[s.root, { justifyContent: "center", alignItems: "center", padding: 32 }]}>
        <View style={s.sentMark}>
          <Feather name="mail" size={28} color="#0D1117" />
        </View>
        <Text style={s.sentTitle}>Reset link sent</Text>
        <Text style={s.sentSub}>
          Check {email} for a link to reset your password. The link expires in 1 hour.
        </Text>
        <Pressable
          style={s.primaryBtn}
          onPress={() => router.replace("/auth/login")}
        >
          <Text style={s.primaryBtnText}>Back to sign in</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={s.inner}>
          <Pressable style={s.backLink} onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={18} color="#EAB308" />
            <Text style={s.backText}>Back</Text>
          </Pressable>

          <View style={s.iconWrap}>
            <Feather name="lock" size={28} color="#EAB308" />
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
            placeholderTextColor="#484F58"
            value={email}
            onChangeText={(t) => { setEmail(t); setError(null); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="go"
            onSubmitEditing={handleReset}
          />

          <Pressable
            style={[s.primaryBtn, loading && s.primaryBtnDisabled]}
            onPress={handleReset}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0D1117" size="small" />
            ) : (
              <Text style={s.primaryBtnText}>Send reset link</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = (topInset: number) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: "#0D1117" },
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
    backText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#EAB308" },
    iconWrap: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: "rgba(234,179,8,0.12)",
      borderWidth: 1,
      borderColor: "rgba(234,179,8,0.2)",
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
      color: "#64748B",
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
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: "#94A3B8",
      marginBottom: 6,
    },
    input: {
      backgroundColor: "#161B22",
      borderWidth: 1,
      borderColor: "#21262D",
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 13,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: "#F0F6FC",
      marginBottom: 20,
    },
    primaryBtn: {
      backgroundColor: "#EAB308",
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 50,
    },
    primaryBtnDisabled: { opacity: 0.6 },
    primaryBtnText: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: "#0D1117",
    },
    sentMark: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: "#EAB308",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
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
      color: "#64748B",
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 32,
    },
  });
