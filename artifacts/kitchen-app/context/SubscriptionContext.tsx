import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";
import { useAuth } from "./AuthContext";

export type PlanId = "starter" | "pro" | "team" | "enterprise";

export interface SubscriptionContextValue {
  planId: PlanId;
  isActive: boolean;
  isTrial: boolean;
  loading: boolean;
  checkoutUrl: (priceId: string) => Promise<string | null>;
  manageUrl: () => Promise<string | null>;
  refresh: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(
  null,
);

function getApiBase(): string {
  if (Platform.OS === "web") return "";
  const domain = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  return domain;
}

async function apiFetch(
  path: string,
  token: string | null,
  opts?: RequestInit,
) {
  const base = getApiBase();
  const res = await fetch(`${base}/api${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

function derivePlanFromSubscription(subscription: any): {
  planId: PlanId;
  isActive: boolean;
  isTrial: boolean;
} {
  if (!subscription)
    return { planId: "starter", isActive: false, isTrial: false };

  const status: string = subscription.status ?? "";
  const isActive = ["active", "trialing"].includes(status);
  const isTrial = status === "trialing";

  const items: any[] = subscription.items?.data ?? [];
  const priceMetadata = items[0]?.price?.metadata ?? {};
  const productMetadata = items[0]?.price?.product?.metadata ?? {};
  const planId = (priceMetadata.plan_id ??
    productMetadata.plan_id ??
    "pro") as PlanId;

  return { planId: isActive ? planId : "starter", isActive, isTrial };
}

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useAuth();
  const [planId, setPlanId] = useState<PlanId>("starter");
  const [isActive, setIsActive] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!session?.access_token) {
      setPlanId("starter");
      setIsActive(false);
      setIsTrial(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    apiFetch("/stripe/subscription", session.access_token)
      .then((data) => {
        if (cancelled) return;
        const derived = derivePlanFromSubscription(data.subscription);
        setPlanId(derived.planId);
        setIsActive(derived.isActive);
        setIsTrial(derived.isTrial);
      })
      .catch(() => {
        if (!cancelled) {
          setPlanId("starter");
          setIsActive(false);
          setIsTrial(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.access_token, tick]);

  const checkoutUrl = useCallback(
    async (priceId: string): Promise<string | null> => {
      if (!session?.access_token) return null;
      try {
        const data = await apiFetch("/stripe/checkout", session.access_token, {
          method: "POST",
          body: JSON.stringify({ priceId }),
        });
        return data.url ?? null;
      } catch {
        return null;
      }
    },
    [session?.access_token],
  );

  const manageUrl = useCallback(async (): Promise<string | null> => {
    if (!session?.access_token) return null;
    try {
      const data = await apiFetch("/stripe/portal", session.access_token, {
        method: "POST",
      });
      return data.url ?? null;
    } catch {
      return null;
    }
  }, [session?.access_token]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return (
    <SubscriptionContext.Provider
      value={{
        planId,
        isActive,
        isTrial,
        loading,
        checkoutUrl,
        manageUrl,
        refresh,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx)
    throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
}
