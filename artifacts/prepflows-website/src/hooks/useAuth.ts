import { useState, useEffect, useCallback } from "react";

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
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
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
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
      return undefined;
    }
  }, [fetchMe]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, subscription: null, loading: false, error: null });
  }, []);

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
    return data.url as string;
  }, []);

  const openBillingPortal = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error("Not authenticated");
    const res = await fetch(`${API}/stripe/portal`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Portal failed");
    return data.url as string;
  }, []);

  const getToken = useCallback(() => localStorage.getItem(TOKEN_KEY), []);

  return { ...state, login, signup, logout, checkout, openBillingPortal, getToken };
}
