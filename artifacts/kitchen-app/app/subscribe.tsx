import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Basic live dashboard for small teams",
    price: null,
    priceLabel: "Free",
    color: "#22C55E",
    features: [
      "Live today dashboard",
      "Up to 3 staff members",
      "Single daily function",
      "Basic dietary alerts",
    ],
    cta: "Get started free",
    ctaIcon: "arrow-right" as const,
    enterprise: false,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Full operational system for active kitchens",
    price: 49,
    priceLabel: "$49",
    color: "#F97316",
    badge: "MOST POPULAR",
    features: [
      "Unlimited functions per day",
      "Full prep list management",
      "Run sheets & service milestones",
      "Casual staff QR briefs",
      "Apple Watch & Samsung Watch alerts",
      "Up to 30 staff members",
      "Sick call & roster management",
    ],
    cta: "Start free month",
    ctaIcon: "zap" as const,
    enterprise: false,
  },
  {
    id: "team",
    name: "Team",
    tagline: "Multi-event coordination + staff management",
    price: 199,
    priceLabel: "$199",
    color: "#8B5CF6",
    features: [
      "Everything in Pro",
      "Multiple simultaneous events",
      "Custom staff sections & roles",
      "Broadcast messages to all staff",
      "Bulk QR brief generation",
      "Unlimited staff members",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Start free month",
    ctaIcon: "zap" as const,
    enterprise: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For hotel groups and large hospitality operations",
    price: null,
    priceLabel: "Custom",
    color: "#14B8A6",
    features: [
      "Everything in Team",
      "Multi-venue management",
      "Custom onboarding session",
      "Dedicated account manager",
      "SLA & uptime guarantees",
      "Staff training & rollout support",
      "Custom integrations on request",
    ],
    cta: "Book Enterprise Demo",
    ctaIcon: "calendar" as const,
    enterprise: true,
  },
];

export default function SubscribeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function handlePlanPress(planId: string) {
    const plan = PLANS.find((p) => p.id === planId)!;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (plan.enterprise) {
      Alert.alert(
        "Book an Enterprise Demo",
        "Our team will walk you through a custom setup for your hotel group or hospitality operation.\n\nWe'll contact you to arrange a time.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Book demo",
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Linking.openURL("mailto:hello@kitchencommand.app?subject=Enterprise Demo Request");
            },
          },
        ]
      );
      return;
    }

    if (plan.id === "starter") {
      Alert.alert(
        "Starter Plan",
        "You're already on the Starter plan — it's always free. Upgrade to Pro or Team for the full system.",
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      `Start ${plan.name} — First Month Free`,
      `Your first month is completely free from today's date.\n\nAfter that, it's ${plan.priceLabel}/month — cancel any time before month 2 and you won't be charged.\n\nPayment setup coming soon. We'll be in touch to complete your account.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Get started free",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(
              "You're in!",
              `Your free month starts today. We'll contact you before month 2 to set up billing. Welcome to KitchenCommand ${plan.name}!`,
              [{ text: "Let's go", onPress: () => router.back() }]
            );
          },
        },
      ]
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Toolbar */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: topPad + 12, paddingBottom: 12 }}>
        <Pressable
          style={({ pressed }) => ({ width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={{ paddingHorizontal: 24, paddingTop: 4, paddingBottom: 28 }}>
          <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.primary, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 8 }}>
            KitchenCommand Plans
          </Text>
          <Text style={{ fontSize: 30, fontFamily: "Inter_700Bold", color: colors.foreground, lineHeight: 36, marginBottom: 10 }}>
            Simple pricing.{"\n"}No surprises.
          </Text>
          <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 21, marginBottom: 16 }}>
            No setup fees. No long-term contracts. Cancel any time.
          </Text>

          {/* Limited-time free month banner */}
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 12, backgroundColor: colors.accent + "15", borderWidth: 1.5, borderColor: colors.accent + "50" }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: 5 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.accent, marginBottom: 3 }}>
                Limited time — First month free
              </Text>
              <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 18 }}>
                Sign up now and your free month starts from your registration date. No credit card charged until month 2.
              </Text>
            </View>
          </View>
        </View>

        {/* Plan cards */}
        {PLANS.map((plan) => {
          const isEnterprise = plan.enterprise;
          return (
            <View
              key={plan.id}
              style={{ marginHorizontal: 20, marginBottom: 14, borderRadius: 16, borderWidth: 2, borderColor: plan.color + "60", backgroundColor: colors.card, overflow: "hidden" }}
            >
              {/* Card header */}
              <View style={{ padding: 20, backgroundColor: plan.color + "10", borderBottomWidth: 1, borderBottomColor: plan.color + "25" }}>
                {plan.badge && (
                  <View style={{ alignSelf: "flex-start", backgroundColor: plan.color, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6, marginBottom: 12 }}>
                    <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.8 }}>{plan.badge}</Text>
                  </View>
                )}

                <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 4 }}>{plan.name}</Text>
                    <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 19 }}>{plan.tagline}</Text>
                  </View>

                  {/* Price */}
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontSize: isEnterprise ? 22 : 38, fontFamily: "Inter_700Bold", color: plan.color, lineHeight: isEnterprise ? 28 : 44 }}>
                      {plan.priceLabel}
                    </Text>
                    {plan.price && (
                      <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>/ month</Text>
                    )}
                    {!plan.price && !isEnterprise && (
                      <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>forever</Text>
                    )}
                  </View>
                </View>

                {plan.price && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, backgroundColor: colors.accent + "15", alignSelf: "flex-start" }}>
                    <Ionicons name="gift-outline" size={13} color={colors.accent} />
                    <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.accent }}>
                      First month free from signup date
                    </Text>
                  </View>
                )}
              </View>

              {/* Features */}
              <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 }}>
                {plan.features.map((f, i) => (
                  <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, paddingBottom: 10 }}>
                    <Ionicons name="checkmark-circle" size={17} color={plan.color} style={{ marginTop: 1 }} />
                    <Text style={{ flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 20 }}>{f}</Text>
                  </View>
                ))}
              </View>

              {/* CTA button */}
              <Pressable
                style={({ pressed }) => ({
                  marginHorizontal: 16, marginBottom: 16, paddingVertical: 15, borderRadius: 12,
                  backgroundColor: isEnterprise ? "transparent" : plan.color,
                  borderWidth: isEnterprise ? 2 : 0,
                  borderColor: isEnterprise ? plan.color : "transparent",
                  flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
                  opacity: pressed ? 0.85 : 1,
                })}
                onPress={() => handlePlanPress(plan.id)}
              >
                <Feather name={plan.ctaIcon} size={16} color={isEnterprise ? plan.color : "#fff"} />
                <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: isEnterprise ? plan.color : "#fff" }}>
                  {plan.cta}
                </Text>
              </Pressable>
            </View>
          );
        })}

        <Text style={{ marginHorizontal: 24, marginTop: 4, marginBottom: 4, fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center", lineHeight: 18 }}>
          Not sure which plan? Start with Starter — upgrade any time.
        </Text>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 20, marginVertical: 24 }} />

        {/* FAQ */}
        <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground, marginHorizontal: 20, marginBottom: 16 }}>
          Common questions
        </Text>
        {[
          {
            q: "How does the free month work?",
            a: "Your free month starts from the date you register — not from when you first use it. No credit card is charged until the start of month 2.",
          },
          {
            q: "Is this a limited-time offer?",
            a: "Yes. The first-month-free offer is available for a limited time only. Lock it in now and your free month is guaranteed from your signup date.",
          },
          {
            q: "Can I cancel before month 2?",
            a: "Absolutely. Cancel any time before your free month ends and you won't be charged anything.",
          },
          {
            q: "What is Enterprise for?",
            a: "Enterprise is designed for hotel groups, stadium catering, and large hospitality operations running multiple venues. Pricing is custom based on your setup.",
          },
          {
            q: "Does the app work on Apple Watch?",
            a: "Yes — staff tap 'This is me', enable reminders, and alerts go directly to any paired Apple Watch or Samsung Watch. 60, 30, 15-minute warnings and fire-time alerts for each course.",
          },
        ].map(({ q, a }, i) => (
          <View key={i} style={{ marginHorizontal: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 4 }}>{q}</Text>
            <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 20 }}>{a}</Text>
          </View>
        ))}

        <View style={{ height: Platform.OS === "web" ? 40 : insets.bottom + 40 }} />
      </ScrollView>
    </View>
  );
}
