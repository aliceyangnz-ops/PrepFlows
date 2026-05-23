import { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = BASE.replace(/\/[^/]*$/, "/api");

export interface AuthUser {
  id: string;
  email: string;
}

export interface Subscription {
  id: string;
  status: string;
  current_period_end: number;
  items?: { data: Array<{ price?: { product?: string; unit_amount?: number; recurring?: { interval: string } } }> };
}

interface AuthState {
  user: AuthUser | null;
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
}

const TOKEN_KEY = "pf_auth_token";

// Cache the Stripe.js promise — loaded once, reused
let stripePromise: ReturnType<typeof loadStripe> | null = null;

async function getStripe() {
  if (stripePromise) return stripePromise;
  // Try VITE env var first (set at build time), then fetch from API at runtime
  const envKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
  if (envKey) {
    stripePromise = loadStripe(envKey);
    return stripePromise;
  }
  try {
    const res = await fetch(`${API}/stripe/config`);
    if (res.ok) {
      const data = await res.json() as { publishableKey: string };
      stripePromise = loadStripe(data.publishableKey);
      return stripePromise;
    }
  } catch { /* fall through */ }
  return null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    subscription: null,
    loading: true,
    error: null,
  });

  const fetchMe = useCallback(async (token: string) => {
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        localStorage.removeItem(TOKEN_KEY);
        setState({ user: null, subscription: null, loading: false, error: null });
        return;
      }
      const data = await res.json();
      setState({ user: data.user, subscription: data.subscription, loading: false, error: null });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setState({ user: null, subscription: null, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetchMe(token);
    } else {
      setState((s) => ({ ...s, loading: false }));
    }
  }, [fetchMe]);

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      localStorage.setItem(TOKEN_KEY, data.token);
      setState({ user: data.user, subscription: null, loading: false, error: null });
      await fetchMe(data.token);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setState((s) => ({ ...s, loading: false, error: msg }));
    }
  }, [fetchMe]);

  const signup = useCallback(async (email: string, password: string): Promise<{ confirmationRequired: boolean } | undefined> => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Signup failed");
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setState({ user: data.user, subscription: null, loading: false, error: null });
        await fetchMe(data.token);
        return undefined;
      } else {
        setState((s) => ({ ...s, loading: false, error: null }));
        return { confirmationRequired: true };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      setState((s) => ({ ...s, loading: false, error: msg }));
      return undefined;
    }
  }, [fetchMe]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, subscription: null, loading: false, error: null });
  }, []);

  /**
   * Start a Stripe Checkout session for the given priceId.
   * The server creates the session; we redirect to the returned URL.
   */
  const checkout = useCallback(async (priceId: string) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API}/stripe/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Checkout failed");

    // The server returns a hosted Checkout URL — redirect to it
    const url = data.url as string;
    if (url) {
      window.location.href = url;
    }
    return url;
  }, []);

  /**
   * Open the Stripe Customer Portal so the user can manage their subscription.
   */
  const openBillingPortal = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error("Not authenticated");
    const res = await fetch(`${API}/stripe/portal`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Portal failed");
    const url = data.url as string;
    if (url) {
      window.location.href = url;
    }
    return url;
  }, []);

  const getToken = useCallback(() => localStorage.getItem(TOKEN_KEY), []);

  return { ...state, login, signup, logout, checkout, openBillingPortal, getToken, getStripe };
}

// Export for use outside the hook (e.g. pricing page)
export { getStripe };
