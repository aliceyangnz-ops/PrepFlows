import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const PLANS = [
  {
    id: "small",
    name: "Small Kitchen",
    subtitle: "Up to 20 staff · 1 venue",
    price: 99,
    color: "#F97316",
    icon: "🍳",
    features: [
      "Unlimited functions per day",
      "Full prep list management",
      "Countdown timers & run sheets",
      "Apple Watch & Samsung Watch alerts",
      "Auto-generate prep from menu",
      "Casual staff QR briefs",
      "Up to 20 staff members",
      "1 venue / location",
    ],
    notIncluded: [
      "Multi-venue management",
      "Priority phone support",
    ],
  },
  {
    id: "enterprise",
    name: "Large Venue",
    subtitle: "Unlimited staff · Multi-venue",
    price: 299,
    color: "#8B5CF6",
    icon: "🏛",
    badge: "BEST VALUE",
    features: [
      "Everything in Small Kitchen",
      "Unlimited staff members",
      "Multi-venue management",
      "Custom staff sections & roles",
      "Broadcast messages to all staff",
      "Bulk QR brief generation",
      "Priority phone support",
      "Custom onboarding session",
      "Early access to new features",
    ],
    notIncluded: [],
  },
];

export default function SubscribeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function handleSubscribe(planId: string) {
    const plan = PLANS.find((p) => p.id === planId)!;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      `Start with ${plan.name}`,
      `Your first month is completely free — no credit card charged until month 2.\n\nAfter that, it's $${plan.price}/month, cancel any time.\n\nPayment processing coming soon — we'll contact you to complete setup.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Get started free",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(
              "You're in! 🎉",
              "Your free month has started. We'll be in touch to set up your payment details before month 2. Enjoy KitchenCommand!",
              [{ text: "Let's go", onPress: () => router.back() }]
            );
          },
        },
      ]
    );
  }

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    toolbar: {
      flexDirection: "row", alignItems: "center", paddingHorizontal: 20,
      paddingTop: topPad + 12, paddingBottom: 12,
    },
    backBtn: {
      width: 36, height: 36, borderRadius: 10, borderWidth: 1,
      borderColor: colors.border, backgroundColor: colors.card,
      alignItems: "center", justifyContent: "center",
    },
    hero: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
    heroEyebrow: {
      fontSize: 11, fontFamily: "Inter_700Bold", color: colors.primary,
      letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 8,
    },
    heroTitle: {
      fontSize: 28, fontFamily: "Inter_700Bold", color: colors.foreground,
      lineHeight: 34, marginBottom: 10,
    },
    heroSub: {
      fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground,
      lineHeight: 21,
    },
    freeBadge: {
      flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16,
      paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
      backgroundColor: colors.accent + "15", borderWidth: 1, borderColor: colors.accent + "40",
      alignSelf: "flex-start",
    },
    freeBadgeText: { fontSize: 13, fontFamily: "Inter_700Bold", color: colors.accent },
    planCard: {
      marginHorizontal: 20, marginBottom: 14, borderRadius: 16,
      borderWidth: 2, overflow: "hidden",
    },
    planHeader: {
      paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
    },
    planBadge: {
      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
      alignSelf: "flex-start", marginBottom: 10,
    },
    planBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },
    planIcon: { fontSize: 28, marginBottom: 8 },
    planName: { fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 2 },
    planSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    planPriceRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 14 },
    planCurrency: { fontSize: 18, fontFamily: "Inter_700Bold" },
    planAmount: { fontSize: 44, fontFamily: "Inter_700Bold", lineHeight: 48 },
    planPeriod: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    planFreeNote: {
      fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.accent,
      marginTop: 6,
    },
    featureList: {
      paddingHorizontal: 20, paddingBottom: 16, gap: 8,
      borderTopWidth: 1,
    },
    featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingTop: 10 },
    featureIcon: { marginTop: 1 },
    featureText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 19 },
    notIncludedText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 19 },
    ctaBtn: {
      marginHorizontal: 20, paddingVertical: 16, borderRadius: 14,
      alignItems: "center", justifyContent: "center", gap: 8,
      flexDirection: "row",
    },
    ctaBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
    compareNote: {
      marginHorizontal: 24, marginTop: 6, marginBottom: 8,
      fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground,
      textAlign: "center", lineHeight: 18,
    },
    divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 20, marginVertical: 20 },
    faqItem: { marginHorizontal: 20, marginBottom: 14 },
    faqQ: { fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 4 },
    faqA: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 19 },
    bottomPad: { height: Platform.OS === "web" ? 40 : insets.bottom + 40 },
  });

  return (
    <View style={s.root}>
      <View style={s.toolbar}>
        <Pressable style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroEyebrow}>KitchenCommand Plans</Text>
          <Text style={s.heroTitle}>Reduce chaos.{"\n"}Run better service.</Text>
          <Text style={s.heroSub}>
            Simple per-month pricing — no setup fees, no long-term contracts.
            Cancel any time.
          </Text>
          <View style={s.freeBadge}>
            <Ionicons name="gift-outline" size={16} color={colors.accent} />
            <Text style={s.freeBadgeText}>First month completely free — no card required</Text>
          </View>
        </View>

        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <Pressable
              key={plan.id}
              style={[s.planCard, { borderColor: isSelected ? plan.color : plan.color + "40", backgroundColor: colors.card }]}
              onPress={() => { setSelectedPlan(plan.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <View style={[s.planHeader, { backgroundColor: plan.color + "10" }]}>
                {plan.badge && (
                  <View style={[s.planBadge, { backgroundColor: plan.color }]}>
                    <Text style={s.planBadgeText}>{plan.badge}</Text>
                  </View>
                )}
                <Text style={s.planIcon}>{plan.icon}</Text>
                <Text style={s.planName}>{plan.name}</Text>
                <Text style={s.planSub}>{plan.subtitle}</Text>
                <View style={s.planPriceRow}>
                  <Text style={[s.planCurrency, { color: plan.color }]}>$</Text>
                  <Text style={[s.planAmount, { color: plan.color }]}>{plan.price}</Text>
                  <Text style={s.planPeriod}>/month</Text>
                </View>
                <Text style={s.planFreeNote}>✓ First month free, then ${plan.price}/mo from month 2</Text>
              </View>

              <View style={[s.featureList, { borderTopColor: plan.color + "30" }]}>
                {plan.features.map((f, i) => (
                  <View key={i} style={s.featureRow}>
                    <Ionicons name="checkmark-circle" size={17} color={plan.color} style={s.featureIcon} />
                    <Text style={s.featureText}>{f}</Text>
                  </View>
                ))}
                {plan.notIncluded.map((f, i) => (
                  <View key={`no-${i}`} style={s.featureRow}>
                    <Ionicons name="remove-circle-outline" size={17} color={colors.border} style={s.featureIcon} />
                    <Text style={s.notIncludedText}>{f}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                style={({ pressed }) => [s.ctaBtn, { backgroundColor: plan.color, marginBottom: 16, opacity: pressed ? 0.85 : 1 }]}
                onPress={() => handleSubscribe(plan.id)}
              >
                <Ionicons name="rocket-outline" size={18} color="#fff" />
                <Text style={s.ctaBtnText}>Start free — {plan.name}</Text>
              </Pressable>
            </Pressable>
          );
        })}

        <Text style={s.compareNote}>
          Not sure which plan? Start with Small Kitchen — you can upgrade any time.
        </Text>

        <View style={s.divider} />

        {/* FAQ */}
        <View style={[s.faqItem, { marginBottom: 6 }]}>
          <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 14 }}>Common questions</Text>
        </View>

        {[
          {
            q: "Do I really get a full month free?",
            a: "Yes — your first 30 days are completely free with full access to every feature. No credit card is charged until the start of month 2.",
          },
          {
            q: "What counts as a 'large venue'?",
            a: "The Large Venue plan is designed for operations with more than 20 staff, or businesses running multiple venues at the same time (like Sky City or stadium catering).",
          },
          {
            q: "Can I cancel any time?",
            a: "Absolutely. Cancel before the end of your billing period and you won't be charged again. Your data stays readable until the period ends.",
          },
          {
            q: "Does the app work on Apple Watch and Samsung Watch?",
            a: "Yes — when staff tap 'This is me' and enable reminders, notifications go automatically to any paired smartwatch. 60 min, 30 min, 15 min, and fire-time alerts for each course.",
          },
          {
            q: "What happens to my data if I cancel?",
            a: "All data is stored on your device. If you cancel, the app continues to work but new functions added after the trial period will be read-only. Your existing data is never deleted.",
          },
        ].map(({ q, a }, i) => (
          <View key={i} style={s.faqItem}>
            <Text style={s.faqQ}>{q}</Text>
            <Text style={s.faqA}>{a}</Text>
          </View>
        ))}

        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}
