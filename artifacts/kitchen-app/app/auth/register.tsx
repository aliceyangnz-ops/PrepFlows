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

function validate(
  fullName: string,
  email: string,
  password: string,
  confirm: string,
): string | null {
  if (!fullName.trim()) return "Please enter your full name.";
  if (!email.trim()) return "Please enter your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "Please enter a valid email address.";
  if (!password) return "Please enter a password.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must include an upper-case letter.";
  if (!/[0-9]/.test(password)) return "Password must include a number.";
  if (password !== confirm) return "Passwords do not match.";
  return null;
}

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    const validationError = validate(fullName.trim(), email.trim(), password, confirm);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { error: authError } = await signUp(
      email.trim().toLowerCase(),
      password,
      fullName.trim(),
    );

    if (authError) {
      setError(authError);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  const s = styles(insets.top);

  if (success) {
    return (
      <View style={[s.root, { justifyContent: "center", alignItems: "center", padding: 32 }]}>
        {/* Ambient orbs */}
        <View style={s.orbTopRight} pointerEvents="none" />
        <View style={s.orbBottomLeft} pointerEvents="none" />

        <View style={s.successMark}>
          <LinearGradient
            colors={["#22C55E", "#16A34A"]}
            style={s.successMarkGrad}
          >
            <Feather name="check" size={32} color="#fff" />
          </LinearGradient>
        </View>
        <Text style={[s.cardTitle, { textAlign: "center", marginBottom: 8 }]}>
          Check your email
        </Text>
        <Text style={[s.cardSub, { textAlign: "center", marginBottom: 32 }]}>
          We sent a confirmation link to {email}. Click it to activate your account.
        </Text>
        <Pressable
          onPress={() => router.replace("/auth/login")}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, width: "100%" }]}
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
          {/* Back link */}
          <Pressable
            style={s.backLink}
            onPress={() => router.back()}
            hitSlop={12}
          >
            <Feather name="arrow-left" size={18} color="#3B82F6" />
            <Text style={s.backText}>Sign in</Text>
          </Pressable>

          {/* Brand */}
          <View style={s.brand}>
            <View style={s.logoWrap}>
              <PrepFlowsLogo size={64} />
            </View>
            <Text style={s.appName}>PrepFlows</Text>
          </View>

          {/* Form card */}
          <View style={s.card}>
            <LinearGradient
              colors={["#3B82F6", "#06B6D4", "#818CF8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.cardAccentBar}
            />

            <View style={s.cardInner}>
              <Text style={s.cardTitle}>Create your account</Text>
              <Text style={s.cardSub}>Set up your PrepFlows workspace</Text>

              {error && (
                <View style={s.errorBox}>
                  <Feather name="alert-circle" size={14} color="#EF4444" />
                  <Text style={s.errorText}>{error}</Text>
                </View>
              )}

              <View style={s.fieldGroup}>
                <Text style={s.label}>Full name</Text>
                <TextInput
                  style={s.input}
                  placeholder="Your name"
                  placeholderTextColor="#3A4250"
                  value={fullName}
                  onChangeText={(t) => { setFullName(t); setError(null); }}
                  autoComplete="name"
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

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
                    placeholder="Min 8 chars, 1 upper, 1 number"
                    placeholderTextColor="#3A4250"
                    value={password}
                    onChangeText={(t) => { setPassword(t); setError(null); }}
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                    returnKeyType="next"
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

              <View style={s.fieldGroup}>
                <Text style={s.label}>Confirm password</Text>
                <TextInput
                  style={s.input}
                  placeholder="Repeat your password"
                  placeholderTextColor="#3A4250"
                  value={confirm}
                  onChangeText={(t) => { setConfirm(t); setError(null); }}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  returnKeyType="go"
                  onSubmitEditing={handleRegister}
                />
              </View>

              {/* Password requirements hint */}
              <View style={s.hintRow}>
                {[
                  { label: "8+ characters", met: password.length >= 8 },
                  { label: "Upper-case", met: /[A-Z]/.test(password) },
                  { label: "Number", met: /[0-9]/.test(password) },
                  { label: "Passwords match", met: confirm.length > 0 && password === confirm },
                ].map((r) => (
                  <View key={r.label} style={s.hintItem}>
                    <Feather
                      name={r.met ? "check-circle" : "circle"}
                      size={11}
                      color={r.met ? "#22C55E" : "#2A3444"}
                    />
                    <Text style={[s.hintText, r.met && s.hintTextMet]}>{r.label}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                onPress={handleRegister}
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
                    <Text style={s.primaryBtnText}>Create account</Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </View>

          <Text style={s.footer}>
            Already have an account?{" "}
            <Text
              style={s.footerLink}
              onPress={() => router.replace("/auth/login")}
            >
              Sign in
            </Text>
          </Text>
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
      paddingTop: topInset + 16,
      paddingBottom: 32,
      paddingHorizontal: 24,
    },
    backLink: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 24,
      alignSelf: "flex-start",
    },
    backText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#3B82F6" },
    brand: { alignItems: "center", marginBottom: 28 },
    logoWrap: {
      marginBottom: 12,
      shadowColor: "#3B82F6",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 18,
      elevation: 10,
    },
    appName: {
      fontSize: 26,
      fontFamily: "Inter_700Bold",
      color: "#F0F6FC",
      letterSpacing: -0.6,
    },
    card: {
      backgroundColor: "#161B22",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "#1E2A3A",
      marginBottom: 20,
      overflow: "hidden",
    },
    cardAccentBar: { height: 3, width: "100%" },
    cardInner: { padding: 24 },
    cardTitle: {
      fontSize: 20,
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
    hintRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 20,
      marginTop: -4,
    },
    hintItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    hintText: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: "#2A3444",
    },
    hintTextMet: { color: "#22C55E" },
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
    successMark: {
      width: 80,
      height: 80,
      borderRadius: 40,
      overflow: "hidden",
      marginBottom: 20,
    },
    successMarkGrad: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    footer: {
      textAlign: "center",
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: "#3A4A5C",
    },
    footerLink: {
      fontFamily: "Inter_600SemiBold",
      color: "#3B82F6",
    },
  });
