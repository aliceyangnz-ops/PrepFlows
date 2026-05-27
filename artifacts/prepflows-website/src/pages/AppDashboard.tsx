import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Logo } from "@/components/Logo";

const BLUE = "#4D7CFF";
const GREEN = "#22C55E";
const RED = "#EF4444";
const YELLOW = "#EAB308";

type StaffRole = "manager" | "team_leader" | "staff";

const ROLE_OPTIONS: {
  value: StaffRole;
  label: string;
  desc: string;
  icon: string;
}[] = [
  {
    value: "manager",
    label: "Head Office / Manager",
    desc: "Full access — edit, approve, manage",
    icon: "🛡️",
  },
  {
    value: "team_leader",
    label: "Team Leader",
    desc: "View only — browse functions & prep",
    icon: "👥",
  },
  {
    value: "staff",
    label: "Staff",
    desc: "View only — check schedule & brief",
    icon: "👤",
  },
];

function PlanBadge({ subscription }: { subscription: any }) {
  if (!subscription) {
    return (
      <span
        className="text-xs font-bold px-2.5 py-1 rounded-full"
        style={{ background: "#21262D", color: "#8B949E" }}
      >
        Free
      </span>
    );
  }
  const isActive =
    subscription.status === "active" || subscription.status === "trialing";
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full"
      style={{
        background: isActive ? `${GREEN}20` : `${RED}20`,
        color: isActive ? GREEN : RED,
      }}
    >
      {subscription.status === "trialing"
        ? "Trial"
        : subscription.status === "active"
          ? "Active"
          : subscription.status}
    </span>
  );
}

function AccessBadge({ role }: { role: StaffRole }) {
  const map = {
    manager: { label: "Full Access", color: GREEN },
    team_leader: { label: "View Only", color: BLUE },
    staff: { label: "View Only", color: "#8B949E" },
  };
  const { label, color } = map[role];
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: `${color}20`, color }}
    >
      {label}
    </span>
  );
}

function ManagerDashboard({
  onLogout,
  role,
}: {
  onLogout: () => void;
  role: StaffRole;
}) {
  const { user, subscription, openBillingPortal } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const justSubscribed =
    new URLSearchParams(location.split("?")[1] ?? "").get("subscribed") ===
    "true";

  const endDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end * 1000).toLocaleDateString(
        "en-AU",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        },
      )
    : null;

  async function handlePortal() {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const url = await openBillingPortal();
      window.location.href = url;
    } catch (err: any) {
      setPortalError(err.message);
      setPortalLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: "#0D1117", color: "#F0F6FC" }}
    >
      {/* NAV */}
      <nav
        style={{
          borderBottom: "1px solid #21262D",
          background: "rgba(13,17,23,0.95)",
        }}
        className="sticky top-0 z-40"
      >
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <Logo size={28} />
            <span className="font-bold text-sm">PrepFlows</span>
          </button>
          <div className="flex items-center gap-3">
            <AccessBadge role={role} />
            <span
              className="text-sm hidden sm:block"
              style={{ color: "#8B949E" }}
            >
              {user?.email}
            </span>
            <button
              onClick={onLogout}
              className="text-sm font-medium px-4 py-1.5 rounded-lg transition-opacity hover:opacity-75"
              style={{ background: "#21262D", color: "#8B949E" }}
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {justSubscribed && (
          <div
            className="mb-6 p-4 rounded-xl flex items-center gap-3"
            style={{ background: `${GREEN}12`, border: `1px solid ${GREEN}35` }}
          >
            <span className="text-xl">🎉</span>
            <div>
              <p className="text-sm font-bold" style={{ color: GREEN }}>
                You're on PrepFlows Pro!
              </p>
              <p className="text-xs" style={{ color: "#8B949E" }}>
                Your subscription is now active. Welcome aboard.
              </p>
            </div>
          </div>
        )}
        <h1 className="text-2xl font-bold mb-2">Your workspace</h1>
        <p className="text-sm mb-8" style={{ color: "#8B949E" }}>
          Signed in as Head Office / Manager — you have full access to all
          settings and controls.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Subscription card */}
          <div
            className="md:col-span-2 rounded-2xl p-7"
            style={{ background: "#161B22", border: "1px solid #21262D" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-1"
                  style={{ color: "#8B949E" }}
                >
                  Current plan
                </p>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">
                    {subscription ? "PrepFlows Pro" : "Starter"}
                  </h2>
                  <PlanBadge subscription={subscription} />
                </div>
                {endDate && (
                  <p className="text-sm" style={{ color: "#8B949E" }}>
                    Renews {endDate}
                  </p>
                )}
              </div>
            </div>

            {!subscription && (
              <div
                className="mb-5 p-4 rounded-xl"
                style={{
                  background: `${BLUE}10`,
                  border: `1px solid ${BLUE}25`,
                }}
              >
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: BLUE }}
                >
                  Upgrade to Pro — first month free
                </p>
                <p className="text-xs" style={{ color: "#8B949E" }}>
                  Unlimited functions, Live Service Mode, Analytics, Smart
                  Import, and more.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {!subscription ? (
                <button
                  onClick={() => navigate("/pricing")}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-80"
                  style={{ background: BLUE, color: "#fff" }}
                >
                  Upgrade to Pro →
                </button>
              ) : (
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{
                    background: "#21262D",
                    color: "#F0F6FC",
                    border: "1px solid #30363D",
                  }}
                >
                  {portalLoading ? "Opening…" : "Manage billing"}
                </button>
              )}
              {portalError && (
                <p className="text-xs self-center" style={{ color: RED }}>
                  {portalError}
                </p>
              )}
            </div>
          </div>

          {/* Account card */}
          <div
            className="rounded-2xl p-7"
            style={{ background: "#161B22", border: "1px solid #21262D" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: "#8B949E" }}
            >
              Account
            </p>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg mb-3"
              style={{ background: `${GREEN}20`, color: GREEN }}
            >
              {user?.email?.[0].toUpperCase()}
            </div>
            <p
              className="text-sm font-semibold mb-1"
              style={{ wordBreak: "break-all" }}
            >
              {user?.email}
            </p>
            <p className="text-xs" style={{ color: "#8B949E" }}>
              Head Office / Manager
            </p>
          </div>
        </div>

        {/* Staff Access Management */}
        <div
          className="rounded-2xl p-7 mb-5"
          style={{ background: "#161B22", border: `1px solid ${GREEN}30` }}
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xl">🛡️</span>
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: GREEN }}
              >
                Staff Access Control
              </p>
              <p className="text-sm font-semibold mt-0.5">
                Manage who can edit in the PrepFlows app
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                role: "Head Office / Manager",
                access: "Full access",
                desc: "Edit functions, toggle prep, manage staff, print & export documents",
                color: GREEN,
                icon: "🛡️",
              },
              {
                role: "Team Leader",
                access: "View only by default",
                desc: "Can browse all screens. Managers can grant full access on a per-person basis in the app roster.",
                color: BLUE,
                icon: "👥",
              },
              {
                role: "Staff",
                access: "View only",
                desc: "Can view their schedule, function brief, and prep list. Cannot make changes.",
                color: "#8B949E",
                icon: "👤",
              },
            ].map((item) => (
              <div
                key={item.role}
                className="p-4 rounded-xl"
                style={{
                  background: `${item.color}08`,
                  border: `1px solid ${item.color}25`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span>{item.icon}</span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${item.color}20`, color: item.color }}
                  >
                    {item.access}
                  </span>
                </div>
                <p className="text-sm font-semibold mb-1">{item.role}</p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#8B949E" }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4" style={{ color: "#484F58" }}>
            To grant or revoke access for an individual team member, open the
            PrepFlows app → Roster → tap their card → use the Lock/Open button.
          </p>
        </div>

        {/* Get the app */}
        <div
          className="rounded-2xl p-7 mb-5"
          style={{ background: "#161B22", border: "1px solid #21262D" }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-5"
            style={{ color: "#8B949E" }}
          >
            Download the app
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: "📱",
                title: "iOS",
                sub: "iPhone & iPad",
                label: "App Store",
                href: "#",
                color: BLUE,
              },
              {
                icon: "🤖",
                title: "Android",
                sub: "Phone & Tablet",
                label: "Google Play",
                href: "#",
                color: GREEN,
              },
              {
                icon: "🌐",
                title: "Web",
                sub: "Any browser",
                label: "Open app",
                href: "#",
                color: YELLOW,
              },
            ].map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="flex items-center gap-4 p-4 rounded-xl transition-opacity hover:opacity-80"
                style={{
                  background: `${item.color}10`,
                  border: `1px solid ${item.color}25`,
                }}
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="font-bold text-sm">{item.title}</p>
                  <p className="text-xs" style={{ color: "#8B949E" }}>
                    {item.sub}
                  </p>
                </div>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-lg"
                  style={{ background: `${item.color}20`, color: item.color }}
                >
                  {item.label}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "📖", label: "Docs & guides", href: "#" },
            { icon: "💬", label: "Support chat", href: "#" },
            { icon: "📣", label: "What's new", href: "#" },
            { icon: "⭐", label: "Leave a review", href: "#" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-opacity hover:opacity-75"
              style={{ background: "#161B22", border: "1px solid #21262D" }}
            >
              <span className="text-xl">{item.icon}</span>
              <span
                className="text-xs font-medium"
                style={{ color: "#8B949E" }}
              >
                {item.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function ViewOnlyDashboard({
  onLogout,
  role,
}: {
  onLogout: () => void;
  role: StaffRole;
}) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const opt = ROLE_OPTIONS.find((r) => r.value === role)!;

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: "#0D1117", color: "#F0F6FC" }}
    >
      {/* NAV */}
      <nav
        style={{
          borderBottom: "1px solid #21262D",
          background: "rgba(13,17,23,0.95)",
        }}
        className="sticky top-0 z-40"
      >
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <Logo size={28} />
            <span className="font-bold text-sm">PrepFlows</span>
          </button>
          <div className="flex items-center gap-3">
            <AccessBadge role={role} />
            <span
              className="text-sm hidden sm:block"
              style={{ color: "#8B949E" }}
            >
              {user?.email}
            </span>
            <button
              onClick={onLogout}
              className="text-sm font-medium px-4 py-1.5 rounded-lg transition-opacity hover:opacity-75"
              style={{ background: "#21262D", color: "#8B949E" }}
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <span className="text-5xl mb-6 block">{opt.icon}</span>
        <h1 className="text-2xl font-bold mb-3">You're signed in</h1>
        <p className="text-sm mb-2" style={{ color: "#8B949E" }}>
          Signed in as <strong style={{ color: "#F0F6FC" }}>{opt.label}</strong>
        </p>
        <p className="text-sm mb-10" style={{ color: "#8B949E" }}>
          Your account is in{" "}
          <strong style={{ color: "#F0F6FC" }}>view-only mode</strong>. You can
          browse functions, prep lists, and your roster — but you cannot make
          changes. Use the PrepFlows mobile or web app to access your content.
        </p>

        {/* Access explanation */}
        <div
          className="p-5 rounded-2xl mb-8 text-left"
          style={{ background: "#161B22", border: "1px solid #21262D" }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: "#8B949E" }}
          >
            Your access level
          </p>
          <div className="flex flex-col gap-3">
            {[
              { label: "View functions & run sheets", allowed: true },
              { label: "View prep list & progress", allowed: true },
              { label: "View roster & shift times", allowed: true },
              { label: "View casual staff QR brief", allowed: true },
              { label: "Edit function details", allowed: false },
              { label: "Mark prep tasks as done", allowed: false },
              { label: "Add or edit staff", allowed: false },
              { label: "Print & export documents", allowed: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span
                  className="text-sm"
                  style={{ color: item.allowed ? GREEN : RED }}
                >
                  {item.allowed ? "✓" : "✕"}
                </span>
                <span
                  className="text-sm"
                  style={{ color: item.allowed ? "#F0F6FC" : "#484F58" }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4" style={{ color: "#484F58" }}>
            Need more access? Ask your manager to open your access in the
            PrepFlows app under Roster.
          </p>
        </div>

        {/* Open app */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "📱", title: "iOS App", href: "#", color: BLUE },
            { icon: "🤖", title: "Android App", href: "#", color: GREEN },
            { icon: "🌐", title: "Web App", href: "#", color: YELLOW },
          ].map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="flex items-center justify-center gap-2 p-4 rounded-xl transition-opacity hover:opacity-80"
              style={{
                background: `${item.color}10`,
                border: `1px solid ${item.color}25`,
              }}
            >
              <span>{item.icon}</span>
              <span className="text-sm font-semibold">{item.title}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("staff");
  const [confirmed, setConfirmed] = useState(false);
  const { login, signup, loading, error } = useAuth();
  const [, navigate] = useLocation();
  const [location] = useLocation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "login") {
      await login(email, password);
      // store role selection
      sessionStorage.setItem("pf_role", role);
    } else {
      const result = await signup(email, password);
      if ((result as any)?.confirmationRequired) {
        setConfirmed(true);
      } else {
        sessionStorage.setItem("pf_role", role);
      }
    }
  }

  const planParam = new URLSearchParams(location.split("?")[1] ?? "").get(
    "plan",
  );

  if (confirmed) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen font-sans px-4"
        style={{ background: "#0D1117", color: "#F0F6FC" }}
      >
        <div
          className="w-full max-w-sm text-center p-8 rounded-2xl"
          style={{ background: "#161B22", border: "1px solid #21262D" }}
        >
          <span className="text-4xl mb-4 block">📧</span>
          <h2 className="text-xl font-bold mb-2">Check your email</h2>
          <p className="text-sm" style={{ color: "#8B949E" }}>
            We've sent a confirmation link to{" "}
            <strong style={{ color: "#F0F6FC" }}>{email}</strong>. Click it to
            activate your account, then come back to sign in.
          </p>
          <button
            onClick={() => setMode("login")}
            className="mt-6 w-full py-3 rounded-xl font-bold text-sm"
            style={{ background: BLUE, color: "#fff" }}
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen font-sans px-4"
      style={{ background: "#0D1117", color: "#F0F6FC" }}
    >
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 mb-10"
      >
        <Logo size={40} />
        <span className="text-xl font-bold">PrepFlows</span>
      </button>

      <div className="w-full max-w-sm">
        {planParam && (
          <div
            className="mb-5 p-4 rounded-xl text-center"
            style={{ background: `${BLUE}10`, border: `1px solid ${BLUE}25` }}
          >
            <p className="text-sm font-semibold" style={{ color: BLUE }}>
              {mode === "signup"
                ? "Create an account to continue to checkout"
                : "Sign in to continue to checkout"}
            </p>
          </div>
        )}

        <div
          className="rounded-2xl p-8"
          style={{ background: "#161B22", border: "1px solid #21262D" }}
        >
          <h1 className="text-2xl font-bold mb-1">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-sm mb-6" style={{ color: "#8B949E" }}>
            {mode === "login"
              ? "Sign in to your workspace"
              : "First month is on us"}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Role selector */}
            <div>
              <label
                className="text-xs font-semibold block mb-2"
                style={{ color: "#8B949E" }}
              >
                I am signing in as
              </label>
              <div className="flex flex-col gap-2">
                {ROLE_OPTIONS.map((opt) => {
                  const selected = role === opt.value;
                  const color =
                    opt.value === "manager"
                      ? GREEN
                      : opt.value === "team_leader"
                        ? BLUE
                        : "#8B949E";
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRole(opt.value)}
                      className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                      style={{
                        background: selected ? `${color}12` : "#0D1117",
                        border: `1.5px solid ${selected ? color : "#30363D"}`,
                      }}
                    >
                      <span className="text-base">{opt.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold leading-tight"
                          style={{ color: selected ? "#F0F6FC" : "#8B949E" }}
                        >
                          {opt.label}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: selected ? color : "#484F58" }}
                        >
                          {opt.desc}
                        </p>
                      </div>
                      {selected && (
                        <span
                          className="text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full shrink-0"
                          style={{ background: color, color: "#fff" }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                className="text-xs font-semibold block mb-1.5"
                style={{ color: "#8B949E" }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "#0D1117",
                  border: "1.5px solid #30363D",
                  color: "#F0F6FC",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = BLUE;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#30363D";
                }}
              />
            </div>
            <div>
              <label
                className="text-xs font-semibold block mb-1.5"
                style={{ color: "#8B949E" }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={8}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "#0D1117",
                  border: "1.5px solid #30363D",
                  color: "#F0F6FC",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = BLUE;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#30363D";
                }}
              />
            </div>

            {error && (
              <div
                className="p-3 rounded-lg text-sm"
                style={{ background: `${RED}15`, color: RED }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-85 disabled:opacity-50 mt-1"
              style={{ background: BLUE, color: "#fff" }}
            >
              {loading
                ? "Please wait…"
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-sm text-center mt-5" style={{ color: "#8B949E" }}>
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="font-semibold hover:underline"
            style={{ color: BLUE }}
          >
            {mode === "login" ? "Sign up free" : "Sign in"}
          </button>
        </p>

        <p className="text-xs text-center mt-4" style={{ color: "#484F58" }}>
          By continuing you agree to our{" "}
          <a href="#" className="underline" style={{ color: "#8B949E" }}>
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="underline" style={{ color: "#8B949E" }}>
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default function AppPage() {
  usePageMeta({
    title: "Sign in — PrepFlows",
    description:
      "Sign in to your PrepFlows account to manage your kitchen operations, prep lists, and team roster.",
    canonical: "https://prepflows.com/app",
  });
  const { user, loading, logout, checkout } = useAuth();
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const [role, setRole] = useState<StaffRole>("staff");

  useEffect(() => {
    // Restore role from session after login
    const stored = sessionStorage.getItem("pf_role") as StaffRole | null;
    if (stored) setRole(stored);
  }, [user]);

  useEffect(() => {
    if (!loading && user) {
      const params = new URLSearchParams(location.split("?")[1] ?? "");
      const plan = params.get("plan");
      const billing = params.get("billing") ?? "monthly";
      if (plan && plan !== "starter") {
        handleCheckout(plan, billing);
      }
    }
  }, [loading, user]);

  async function handleCheckout(plan: string, billing = "monthly") {
    try {
      const url = await checkout(plan, billing);
      window.location.href = url;
    } catch {
      navigate("/pricing");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("pf_role");
    logout();
  }

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen font-sans"
        style={{ background: "#0D1117" }}
      >
        <div className="flex flex-col items-center gap-3">
          <Logo size={32} />
          <p className="text-sm" style={{ color: "#8B949E" }}>
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (user) {
    if (role === "manager") {
      return <ManagerDashboard onLogout={handleLogout} role={role} />;
    }
    return <ViewOnlyDashboard onLogout={handleLogout} role={role} />;
  }

  return <AuthForm />;
}
