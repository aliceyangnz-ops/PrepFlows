import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../middleware/auth.js";
import { stripeStorage } from "../stripeStorage.js";
import type { Request, Response } from "express";

const router = Router();

/** Strip any non-ASCII characters that can sneak in from copy-paste. */
function sanitizeAscii(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[^\x00-\x7F]/g, "").trim();
}

function getSupabaseAdmin() {
  const rawUrl =
    process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const supabaseUrl = sanitizeAscii(rawUrl);
  const serviceKey = sanitizeAscii(rawKey);
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase not configured");
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

router.post("/auth/signup", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (data.user) {
      await stripeStorage.upsertProfile(data.user.id);
    }

    res.json({
      token: data.session?.access_token ?? null,
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
      confirmationRequired: !data.session,
    });
  } catch (err: any) {
    res.status(503).json({ error: err.message });
  }
});

router.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(401).json({ error: error.message });
      return;
    }

    if (data.user) {
      await stripeStorage.upsertProfile(data.user.id);
    }

    res.json({
      token: data.session.access_token,
      user: { id: data.user.id, email: data.user.email },
    });
  } catch (err: any) {
    res.status(503).json({ error: err.message });
  }
});

router.get("/auth/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const profile = await stripeStorage.getProfile(req.user!.id);
    let subscription = null;
    if (profile?.stripeCustomerId) {
      subscription = await stripeStorage.getActiveSubscriptionByCustomerId(
        profile.stripeCustomerId,
      );
    }
    res.json({
      user: req.user,
      subscription: subscription ?? null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
