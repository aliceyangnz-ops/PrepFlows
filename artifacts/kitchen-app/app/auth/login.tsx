import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
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
            <Image
              source={require("../../assets/images/icon.png")}
              style={s.logoMark}
              resizeMode="cover"
              accessibilityLabel="PrepFlows"
            />
            <Text style={s.appName}>PrepFlows</Text>
            <Text style={s.appTagline}>Hospitality Operations Platform</Text>
          </View>

          {/* Form card */}
          <View style={s.card}>
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
                placeholderTextColor="#484F58"
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
                  placeholderTextColor="#484F58"
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
                    color="#64748B"
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

            <Pressable
              style={[s.primaryBtn, loading && s.primaryBtnDisabled]}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0D1117" size="small" />
              ) : (
                <Text style={s.primaryBtnText}>Sign in</Text>
              )}
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

          <Text style={s.footer}>
            PrepFlows · Hospitality Operations
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = (topInset: number) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: "#0D1117" },
    scroll: {
      flexGrow: 1,
      paddingTop: topInset + 32,
      paddingBottom: 32,
      paddingHorizontal: 24,
      justifyContent: "center",
    },
    brand: { alignItems: "center", marginBottom: 32 },
    logoMark: {
      width: 80,
      height: 80,
      borderRadius: 18,
      marginBottom: 14,
      overflow: "hidden",
    },
    appName: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: "#F0F6FC",
      letterSpacing: -0.5,
    },
    appTagline: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: "#484F58",
      marginTop: 4,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    card: {
      backgroundColor: "#161B22",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#21262D",
      padding: 24,
      marginBottom: 24,
    },
    cardTitle: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: "#F0F6FC",
      marginBottom: 4,
    },
    cardSub: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: "#64748B",
      marginBottom: 20,
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
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: "#94A3B8",
      marginBottom: 6,
    },
    input: {
      backgroundColor: "#0D1117",
      borderWidth: 1,
      borderColor: "#21262D",
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
      borderColor: "#21262D",
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
      color: "#EAB308",
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
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 20,
      gap: 12,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: "#21262D" },
    dividerText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: "#484F58",
    },
    secondaryBtn: {
      borderWidth: 1,
      borderColor: "#21262D",
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },
    secondaryBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: "#F0F6FC",
    },
    footer: {
      textAlign: "center",
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: "#30363D",
    },
  });
