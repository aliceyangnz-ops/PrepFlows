import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { PrepFlowsLogo } from "@/components/PrepFlowsLogo";

function validate(email: string, password: string): string | null {
  if (!email.trim()) return "Please enter your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "Please enter a valid email address.";
  if (!password) return "Please enter your password.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  return null;
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    const validationError = validate(email.trim(), password);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { error: authError } = await signIn(email.trim().toLowerCase(), password);

    if (authError) {
      setError(
        authError.includes("Invalid login")
          ? "Email or password is incorrect. Please try again."
          : authError,
      );
      setLoading(false);
    }
  }

  const s = styles(insets.top);

  return (
    <View style={s.root}>
      {/* Ambient background orbs */}
      <View style={s.orbTopRight} pointerEvents="none" />
      <View style={s.orbBottomLeft} pointerEvents="none" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand header */}
          <View style={s.brand}>
            <View style={s.logoWrap}>
              <PrepFlowsLogo size={76} />
            </View>
            <Text style={s.appName}>PrepFlows</Text>
            <Text style={s.appTagline}>Hospitality Operations Platform</Text>
          </View>

          {/* Form card */}
          <View style={s.card}>
            {/* Gradient top accent bar */}
            <LinearGradient
              colors={["#3B82F6", "#06B6D4", "#818CF8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.cardAccentBar}
            />

            <View style={s.cardInner}>
              <Text style={s.cardTitle}>Welcome back</Text>
              <Text style={s.cardSub}>Sign in to your workspace</Text>

              {error && (
                <View style={s.errorBox}>
                  <Feather name="alert-circle" size={14} color="#EF4444" />
                  <Text style={s.errorText}>{error}</Text>
                </View>
              )}

              <View style={s.fieldGroup}>
                <Text style={s.label}>Email</Text>
                <TextInput
                  style={s.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#3A4250"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(null); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  returnKeyType="next"
                />
              </View>

              <View style={s.fieldGroup}>
                <Text style={s.label}>Password</Text>
                <View style={s.passwordWrap}>
                  <TextInput
                    style={s.passwordInput}
                    placeholder="••••••••"
                    placeholderTextColor="#3A4250"
                    value={password}
                    onChangeText={(t) => { setPassword(t); setError(null); }}
                    secureTextEntry={!showPassword}
                    autoComplete="current-password"
                    returnKeyType="go"
                    onSubmitEditing={handleSignIn}
                  />
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    style={s.eyeBtn}
                    hitSlop={8}
                  >
                    <Feather
                      name={showPassword ? "eye-off" : "eye"}
                      size={18}
                      color="#4A5568"
                    />
                  </Pressable>
                </View>
              </View>

              <Pressable
                onPress={() => router.push("/auth/forgot-password")}
                style={s.forgotLink}
              >
                <Text style={s.forgotText}>Forgot password?</Text>
              </Pressable>

              {/* Gradient primary button */}
              <Pressable
                onPress={handleSignIn}
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
                    <Text style={s.primaryBtnText}>Sign in</Text>
                  )}
                </LinearGradient>
              </Pressable>

              <View style={s.divider}>
                <View style={s.dividerLine} />
                <Text style={s.dividerText}>or</Text>
                <View style={s.dividerLine} />
              </View>

              <Pressable
                style={s.secondaryBtn}
                onPress={() => router.push("/auth/register")}
              >
                <Text style={s.secondaryBtnText}>Create an account</Text>
              </Pressable>
            </View>
          </View>

          <Text style={s.footer}>PrepFlows · Hospitality Operations</Text>
        </ScrollView>
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
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor: "#1E3A5F",
      opacity: 0.35,
    },
    orbBottomLeft: {
      position: "absolute",
      bottom: -100,
      left: -100,
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor: "#1B2F4A",
      opacity: 0.3,
    },
    scroll: {
      flexGrow: 1,
      paddingTop: topInset + 32,
      paddingBottom: 32,
      paddingHorizontal: 24,
      justifyContent: "center",
    },
    brand: { alignItems: "center", marginBottom: 32 },
    logoWrap: {
      marginBottom: 14,
      shadowColor: "#3B82F6",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 12,
    },
    appName: {
      fontSize: 30,
      fontFamily: "Inter_700Bold",
      color: "#F0F6FC",
      letterSpacing: -0.8,
    },
    appTagline: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: "#3A4A5C",
      marginTop: 5,
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },
    card: {
      backgroundColor: "#161B22",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "#1E2A3A",
      marginBottom: 24,
      overflow: "hidden",
    },
    cardAccentBar: {
      height: 3,
      width: "100%",
    },
    cardInner: { padding: 24 },
    cardTitle: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: "#F0F6FC",
      marginBottom: 4,
    },
    cardSub: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: "#4A5568",
      marginBottom: 22,
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
      lineHeight: 18,
    },
    fieldGroup: { marginBottom: 14 },
    label: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: "#5A7A9A",
      marginBottom: 6,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    input: {
      backgroundColor: "#0D1117",
      borderWidth: 1,
      borderColor: "#1E2A3A",
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 13,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: "#F0F6FC",
    },
    passwordWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#0D1117",
      borderWidth: 1,
      borderColor: "#1E2A3A",
      borderRadius: 10,
    },
    passwordInput: {
      flex: 1,
      paddingHorizontal: 14,
      paddingVertical: 13,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: "#F0F6FC",
    },
    eyeBtn: { paddingHorizontal: 14 },
    forgotLink: { alignSelf: "flex-end", marginBottom: 20, marginTop: 2 },
    forgotText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: "#3B82F6",
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
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 20,
      gap: 12,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: "#1E2A3A" },
    dividerText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: "#3A4250",
    },
    secondaryBtn: {
      borderWidth: 1,
      borderColor: "#1E2A3A",
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },
    secondaryBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: "#60A5FA",
    },
    footer: {
      textAlign: "center",
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: "#1E2A3A",
    },
  });
