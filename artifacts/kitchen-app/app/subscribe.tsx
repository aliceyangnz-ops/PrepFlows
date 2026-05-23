import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";

// Static plan definitions — prices come from Stripe via the API
const PLAN_META = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Basic live dashboard for small teams",
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
    free: true,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Full operational system for active kitchens",
    color: "#EAB308",
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
    free: false,
  },
  {
    id: "team",
    name: "Team",
    tagline: "Multi-event coordination + staff management",
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
    free: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For hotel groups and large hospitality operations",
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
    free: false,
  },
];

type StripePriceRow = {
  id: string;
  unit_amount: number;
  currency: string;
  recurring?: { interval?: string };
};

type StripeProduct = {
  id: string;
  name: string;
  description: string;
  metadata: { plan_id?: string };
  prices: StripePriceRow[];
};

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function getApiBase(): string {
  if (Platform.OS === "web") return "";
  return (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "");
}

export default function SubscribeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuth();
  const subscription = useSubscription();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [stripeProducts, setStripeProducts] = useState<StripeProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [managingBilling, setManagingBilling] = useState(false);

  useEffect(() => {
    setProductsLoading(true);
    fetch(`${getApiBase()}/api/stripe/products`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setStripeProducts(data.data ?? []))
      .catch(() => setStripeProducts([]))
      .finally(() => setProductsLoading(false));
  }, []);

  function getMonthlyPrice(planId: string): StripePriceRow | null {
    const product = stripeProducts.find((p) => p.metadata?.plan_id === planId);
    if (!product) return null;
    return (
      product.prices.find((p) => p.recurring?.interval === "month") ??
      product.prices[0] ??
      null
    );
  }

  async function openCheckout(planId: string) {
    if (Platform.OS !== "web") {
      Alert.alert(
        "Manage billing on the web",
        "To subscribe or change your plan, visit prepflows.app in a browser.",
        [{ text: "OK" }],
      );
      return;
    }

    if (!session) {
      Alert.alert("Sign in required", "Please sign in to subscribe.", [{ text: "OK" }]);
      return;
    }

    const price = getMonthlyPrice(planId);
    if (!price) {
      Alert.alert("Pricing unavailable", "Could not load pricing. Please try again shortly.", [{ text: "OK" }]);
      return;
    }

    setCheckingOut(planId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const url = await subscription.checkoutUrl(price.id);
      if (url) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Could not start checkout. Please try again.", [{ text: "OK" }]);
      }
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.", [{ text: "OK" }]);
    } finally {
      setCheckingOut(null);
    }
  }

  async function openPortal() {
    if (Platform.OS !== "web") {
      Alert.alert(
        "Manage billing on the web",
        "To manage your subscription, visit prepflows.app in a browser.",
        [{ text: "OK" }],
      );
      return;
    }

    setManagingBilling(true);
    try {
      const url = await subscription.manageUrl();
      if (url) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Could not open billing portal. Please try again.", [{ text: "OK" }]);
      }
    } finally {
      setManagingBilling(false);
    }
  }

  function handlePlanPress(planId: string) {
    const plan = PLAN_META.find((p) => p.id === planId)!;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (plan.enterprise) {
      Alert.alert(
        "Book an Enterprise Demo",
        "Our team will walk you through a custom setup for your hotel group or hospitality operation.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Book demo",
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Linking.openURL("mailto:hello@prepflows.app?subject=Enterprise Demo Request");
            },
          },
        ],
      );
      return;
    }

    if (plan.free) {
      Alert.alert(
        "Starter Plan",
        "You're already on the Starter plan — it's always free. Upgrade to Pro or Team for the full system.",
        [{ text: "OK" }],
      );
      return;
    }

    openCheckout(planId);
  }

  const currentPlanId = subscription.planId;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: topPad + 12, paddingBottom: 12 }}>
        <Pressable
          style={({ pressed }) => ({
            width: 36, height: 36, borderRadius: 10, borderWidth: 1,
            borderColor: colors.border, backgroundColor: colors.card,
            alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1,
          })}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={{ paddingHorizontal: 24, paddingTop: 4, paddingBottom: 28 }}>
          <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.primary, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 8 }}>
            PrepFlows Plans
          </Text>
          <Text style={{ fontSize: 30, fontFamily: "Inter_700Bold", color: colors.foreground, lineHeight: 36, marginBottom: 10 }}>
            Simple pricing.{"\n"}No surprises.
          </Text>
          <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 21, marginBottom: 16 }}>
            No setup fees. No long-term contracts. Cancel any time.
          </Text>

          {/* Active subscription badge */}
          {subscription.isActive && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderRadius: 12, backgroundColor: "#22C55E15", borderWidth: 1.5, borderColor: "#22C55E50", marginBottom: 12 }}>
              <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: "#22C55E" }}>
                  {subscription.isTrial ? "Free trial active" : "Subscription active"} — {currentPlanId.charAt(0).toUpperCase() + currentPlanId.slice(1)} plan
                </Text>
              </View>
              <Pressable
                onPress={openPortal}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                {managingBilling
                  ? <ActivityIndicator size="small" color="#22C55E" />
                  : <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#22C55E" }}>Manage</Text>
                }
              </Pressable>
            </View>
          )}

          {/* Trial promo (only when not yet subscribed) */}
          {!subscription.isActive && (
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
          )}
        </View>

        {/* Plan cards */}
        {PLAN_META.map((plan) => {
          const isEnterprise = plan.enterprise;
          const isPro = plan.id === "pro";
          const isCurrent = currentPlanId === plan.id && subscription.isActive;
          const ctaTextColor = isEnterprise ? plan.color : isPro ? "#0D1117" : "#fff";
          const monthlyPrice = getMonthlyPrice(plan.id);
          const isLoadingCheckout = checkingOut === plan.id;

          let priceLabel = plan.free ? "Free" : isEnterprise ? "Custom" : null;
          if (!priceLabel && monthlyPrice) {
            priceLabel = formatPrice(monthlyPrice.unit_amount, monthlyPrice.currency);
          } else if (!priceLabel && productsLoading) {
            priceLabel = "…";
          } else if (!priceLabel) {
            priceLabel = plan.id === "pro" ? "$49" : "$199";
          }

          return (
            <View
              key={plan.id}
              style={{
                marginHorizontal: 20, marginBottom: 14, borderRadius: 16,
                borderWidth: isCurrent ? 2.5 : 2,
                borderColor: isCurrent ? plan.color : plan.color + "60",
                backgroundColor: colors.card, overflow: "hidden",
              }}
            >
              <View style={{ padding: 20, backgroundColor: plan.color + "10", borderBottomWidth: 1, borderBottomColor: plan.color + "25" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: plan.badge ? 8 : 0 }}>
                  {plan.badge && (
                    <View style={{ backgroundColor: plan.color, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6 }}>
                      <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: isPro ? "#0D1117" : "#fff", letterSpacing: 0.8 }}>{plan.badge}</Text>
                    </View>
                  )}
                  {isCurrent && (
                    <View style={{ backgroundColor: "#22C55E", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6 }}>
                      <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.8 }}>
                        {subscription.isTrial ? "TRIAL" : "CURRENT PLAN"}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 4 }}>{plan.name}</Text>
                    <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 19 }}>{plan.tagline}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    {productsLoading && !plan.free && !isEnterprise
                      ? <ActivityIndicator size="small" color={plan.color} />
                      : (
                        <Text style={{ fontSize: isEnterprise ? 22 : 38, fontFamily: "Inter_700Bold", color: plan.color, lineHeight: isEnterprise ? 28 : 44 }}>
                          {priceLabel}
                        </Text>
                      )
                    }
                    {!plan.free && !isEnterprise && monthlyPrice && (
                      <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>/ month</Text>
                    )}
                    {plan.free && (
                      <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>forever</Text>
                    )}
                  </View>
                </View>
                {!plan.free && !isEnterprise && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, backgroundColor: colors.accent + "15", alignSelf: "flex-start" }}>
                    <Ionicons name="gift-outline" size={13} color={colors.accent} />
                    <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.accent }}>
                      First month free from signup date
                    </Text>
                  </View>
                )}
              </View>

              <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 }}>
                {plan.features.map((f, i) => (
                  <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, paddingBottom: 10 }}>
                    <Ionicons name="checkmark-circle" size={17} color={plan.color} style={{ marginTop: 1 }} />
                    <Text style={{ flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 20 }}>{f}</Text>
                  </View>
                ))}
              </View>

              {!isCurrent && (
                <Pressable
                  style={({ pressed }) => ({
                    marginHorizontal: 16, marginBottom: 16, paddingVertical: 15, borderRadius: 12,
                    backgroundColor: isEnterprise ? "transparent" : plan.color,
                    borderWidth: isEnterprise ? 2 : 0,
                    borderColor: isEnterprise ? plan.color : "transparent",
                    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
                    opacity: pressed || isLoadingCheckout ? 0.75 : 1,
                  })}
                  onPress={() => handlePlanPress(plan.id)}
                  disabled={isLoadingCheckout}
                >
                  {isLoadingCheckout
                    ? <ActivityIndicator size="small" color={ctaTextColor} />
                    : <Feather name={plan.ctaIcon} size={16} color={ctaTextColor} />
                  }
                  <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: ctaTextColor }}>
                    {plan.cta}
                  </Text>
                </Pressable>
              )}
            </View>
          );
        })}

        <Text style={{ marginHorizontal: 24, marginTop: 4, marginBottom: 4, fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center", lineHeight: 18 }}>
          Not sure which plan? Start with Starter — upgrade any time.
        </Text>

        <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 20, marginVertical: 24 }} />

        {/* FAQ */}
        <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground, marginHorizontal: 20, marginBottom: 16 }}>
          Common questions
        </Text>
        {[
          { q: "How does the free month work?", a: "Your free month starts from the date you register — not from when you first use it. No credit card is charged until the start of month 2." },
          { q: "Is this a limited-time offer?", a: "Yes. The first-month-free offer is available for a limited time only. Lock it in now and your free month is guaranteed from your signup date." },
          { q: "Can I cancel before month 2?", a: "Absolutely. Cancel any time before your free month ends and you won't be charged anything." },
          { q: "What is Enterprise for?", a: "Enterprise is designed for hotel groups, stadium catering, and large hospitality operations running multiple venues. Pricing is custom based on your setup." },
          { q: "Does the app work on Apple Watch?", a: "Yes — staff tap 'This is me', enable reminders, and alerts go directly to any paired Apple Watch or Samsung Watch. 60, 30, 15-minute warnings and fire-time alerts for each course." },
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
