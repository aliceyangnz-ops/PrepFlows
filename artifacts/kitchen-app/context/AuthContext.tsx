import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

const GUEST_KEY = "@prepflows_guest_mode";

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  enterGuestMode: () => Promise<void>;
  exitGuestMode: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    async function init() {
      const guest = await AsyncStorage.getItem(GUEST_KEY);
      if (guest === "true") {
        setIsGuest(true);
        setLoading(false);
        return;
      }

      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    }

    init();

    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      if (!supabase) return { error: "Supabase not configured" };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return { error: null };
    },
    [],
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
    ): Promise<{ error: string | null }> => {
      if (!supabase) return { error: "Supabase not configured" };
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) return { error: error.message };
      return { error: null };
    },
    [],
  );

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(
    async (email: string): Promise<{ error: string | null }> => {
      if (!supabase) return { error: "Supabase not configured" };
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: undefined,
      });
      if (error) return { error: error.message };
      return { error: null };
    },
    [],
  );

  const enterGuestMode = useCallback(async () => {
    await AsyncStorage.setItem(GUEST_KEY, "true");
    setIsGuest(true);
  }, []);

  const exitGuestMode = useCallback(async () => {
    await AsyncStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, isGuest, signIn, signUp, signOut, resetPassword, enterGuestMode, exitGuestMode }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
