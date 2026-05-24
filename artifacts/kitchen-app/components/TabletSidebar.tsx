import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAccessLevel, useKitchen } from "@/context/KitchenContext";
import { useColors } from "@/hooks/useColors";
import { SIDEBAR_WIDTH } from "@/hooks/useIsTablet";
import { PrepFlowsLogo } from "@/components/PrepFlowsLogo";

interface NavItem {
  name: string;
  route: string;
  pathMatch: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Today",     route: "/",          pathMatch: "index"     },
  { name: "Functions", route: "/functions", pathMatch: "functions" },
  { name: "Prep",      route: "/prep",      pathMatch: "prep"      },
  { name: "Roster",    route: "/roster",    pathMatch: "roster"    },
];

function NavIcon({ name, color, size = 20 }: { name: string; color: string; size?: number }) {
  if (name === "Today")     return <Feather name="calendar" size={size} color={color} />;
  if (name === "Functions") return <MaterialCommunityIcons name="silverware-fork-knife" size={size} color={color} />;
  if (name === "Prep")      return <Feather name="check-square" size={size} color={color} />;
  if (name === "Roster")    return <Ionicons name="people-outline" size={size + 1} color={color} />;
  return null;
}

export function TabletSidebar() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { staff, currentStaffId } = useKitchen();

  const currentMember = currentStaffId ? staff.find((s) => s.id === currentStaffId) ?? null : null;
  const accessLevel = currentMember ? getAccessLevel(currentMember) : null;
  const initials = currentMember
    ? currentMember.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  function isActive(item: NavItem): boolean {
    if (item.pathMatch === "index") return pathname === "/" || pathname === "" || !NAV_ITEMS.some((n) => n.pathMatch !== "index" && pathname.includes(n.pathMatch));
    return pathname.includes(item.pathMatch);
  }

  return (
    <View
      style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: SIDEBAR_WIDTH,
        backgroundColor: colors.card,
        borderRightWidth: 1, borderRightColor: colors.border,
        paddingTop: insets.top,
        paddingBottom: Math.max(insets.bottom, 16),
        zIndex: 100,
      }}
    >
      {/* ── App brand ─────────────────────────────── */}
      <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <PrepFlowsLogo size={36} />
          <View>
            <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground, lineHeight: 18, letterSpacing: -0.3 }}>PrepFlows</Text>
            <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, lineHeight: 16 }}>Kitchen Operations</Text>
          </View>
        </View>
      </View>

      {/* ── Navigation items ──────────────────────── */}
      <View style={{ flex: 1, paddingHorizontal: 8, paddingTop: 4 }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Pressable
              key={item.route}
              style={({ pressed }) => [{
                flexDirection: "row", alignItems: "center", gap: 12,
                paddingHorizontal: 12, paddingVertical: 14,
                borderRadius: 10, marginBottom: 2,
                backgroundColor: active
                  ? colors.primary + "1A"
                  : pressed ? colors.secondary : "transparent",
              }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(item.route as Parameters<typeof router.push>[0]);
              }}
            >
              <NavIcon name={item.name} color={active ? colors.primary : colors.mutedForeground} />
              <Text style={{
                flex: 1,
                fontSize: 14,
                fontFamily: active ? "Inter_700Bold" : "Inter_500Medium",
                color: active ? colors.primary : colors.mutedForeground,
              }}>
                {item.name}
              </Text>
              {active && (
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* ── Current user ──────────────────────────── */}
      <View style={{ paddingHorizontal: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
        {currentMember ? (
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1, flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 10, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/roster"); }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary + "28", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.primary }}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground }} numberOfLines={1}>{currentMember.name}</Text>
              <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }} numberOfLines={1}>{currentMember.role}</Text>
            </View>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, backgroundColor: colors.secondary }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/roster"); }}
          >
            <Ionicons name="person-circle-outline" size={18} color={colors.mutedForeground} />
            <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>Sign in via Roster</Text>
          </Pressable>
        )}
        {accessLevel === "manager" && (
          <View style={{ marginTop: 6, paddingVertical: 5, backgroundColor: colors.primary + "18", borderRadius: 7, alignItems: "center" }}>
            <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.primary, letterSpacing: 0.6, textTransform: "uppercase" }}>Manager Access</Text>
          </View>
        )}
      </View>
    </View>
  );
}
