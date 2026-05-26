import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Logo } from "@/components/Logo";

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg:           "#080808",
  surface:      "rgba(255,255,255,0.04)",
  surfaceHover: "rgba(255,255,255,0.07)",
  border:       "rgba(255,255,255,0.08)",
  borderHover:  "rgba(255,255,255,0.18)",
  text:         "#FFFFFF",
  muted:        "#A1A1AA",
  dim:          "#3F3F46",
  accent:       "#3B82F6",
  // Gradient
  grad:         "linear-gradient(135deg, #3B82F6 0%, #06B6D4 55%, #818CF8 100%)",
  gradReverse:  "linear-gradient(135deg, #818CF8 0%, #06B6D4 45%, #3B82F6 100%)",
} as const;

// Gradient text style helper
const gradText = {
  background:            "linear-gradient(135deg, #ffffff 0%, #e0f2fe 30%, #a5f3fc 60%, #c4b5fd 100%)",
  WebkitBackgroundClip:  "text" as const,
  WebkitTextFillColor:   "transparent",
  backgroundClip:        "text" as const,
};

// ── Fade-up animation helper ───────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >{children}</motion.div>
  );
}

// ── Gradient orb decoration ────────────────────────────────────────────────
function Orb({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{
      position: "absolute",
      borderRadius: "50%",
      pointerEvents: "none",
      ...style,
    }} />
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Features", id: "features" },
  { label: "System",   id: "system"   },
  { label: "Plan",     href: "/pricing" },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobile,   setMobile]   = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function go(id?: string, href?: string) {
    setMobile(false);
    if (href) { navigate(href); return; }
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        background: scrolled ? "rgba(8,8,8,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <button onClick={() => go("hero")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer" }}>
          <Logo size={30} />
          <span style={{ color: C.text, fontWeight: 600, fontSize: 15, letterSpacing: "-0.03em" }}>PrepFlows</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex" style={{ alignItems: "center", gap: 36 }}>
          {NAV_LINKS.map((l) => (
            <button key={l.label} onClick={() => go(l.id, l.href)}
              style={{ color: C.muted, fontSize: 14, fontWeight: 500, background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
            >{l.label}</button>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex" style={{ alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate("/app")}
            style={{ color: C.muted, fontSize: 14, fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: "8px 16px", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
          >Log in</button>
          <button onClick={() => navigate("/app")}
            style={{ background: C.grad, color: "#fff", fontSize: 14, fontWeight: 600, padding: "9px 20px", borderRadius: 9999, border: "none", cursor: "pointer", transition: "opacity 0.2s, transform 0.2s", letterSpacing: "-0.01em" }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "scale(1.03)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
          >Try first month free</button>
        </div>

        {/* Hamburger */}
        <button className="md:hidden" onClick={() => setMobile(!mobile)}
          style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobile
              ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
            }
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {mobile && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ borderTop: `1px solid ${C.border}`, background: "rgba(8,8,8,0.97)", backdropFilter: "blur(24px)", padding: "16px 28px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
            {NAV_LINKS.map((l) => (
              <button key={l.label} onClick={() => go(l.id, l.href)}
                style={{ color: C.muted, fontSize: 15, fontWeight: 500, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: "8px 0" }}
              >{l.label}</button>
            ))}
            <button onClick={() => navigate("/app")}
              style={{ marginTop: 8, background: C.grad, color: "#fff", fontSize: 14, fontWeight: 600, padding: "14px 20px", borderRadius: 9999, border: "none", cursor: "pointer", textAlign: "center" }}
            >Start free trial</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────
function Hero() {
  const [, navigate] = useLocation();

  return (
    <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 28px 100px", textAlign: "center", overflow: "hidden" }}>

      {/* Ambient gradient orbs */}
      <Orb style={{ top: "8%", left: "12%", width: 440, height: 440, background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 68%)", filter: "blur(48px)" }} />
      <Orb style={{ top: "12%", right: "10%", width: 360, height: 360, background: "radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 68%)", filter: "blur(48px)" }} />
      <Orb style={{ bottom: "15%", left: "50%", transform: "translateX(-50%)", width: 600, height: 280, background: "radial-gradient(ellipse, rgba(129,140,248,0.10) 0%, transparent 68%)", filter: "blur(64px)" }} />

      {/* Dot grid background */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px", zIndex: 0, pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Announcement badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5 }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 9999, padding: "1px", background: C.grad, marginBottom: 44 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.bg, borderRadius: 9999, padding: "6px 16px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.grad, display: "inline-block", flexShrink: 0 }} />
            <span style={{ color: C.muted, fontSize: 13, fontWeight: 500, letterSpacing: "0.01em" }}>iOS, Android, Windows and More</span>
          </div>
        </motion.div>

        {/* Heading with gradient text */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontSize: "clamp(56px, 9vw, 96px)", fontWeight: 700, lineHeight: 1.0, letterSpacing: "-0.05em", margin: 0, marginBottom: 8 }}
        >
          <span style={gradText}>PrepFlows</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.6 }}
          style={{ fontSize: "clamp(18px, 2.8vw, 28px)", fontWeight: 300, color: "#71717A", letterSpacing: "-0.02em", margin: 0, marginBottom: 16, maxWidth: 620, lineHeight: 1.3 }}
        >
          The operating system for<br />
          <span style={{ color: C.muted }}>professional kitchens.</span>
        </motion.p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32, duration: 0.6 }}
          style={{ fontSize: 12, fontWeight: 600, color: "#3F3F46", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 56 }}
        >
          Plan &nbsp;·&nbsp; Prep &nbsp;·&nbsp; Service &nbsp;·&nbsp; Scale
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.40, duration: 0.5 }}
          style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginBottom: 88 }}
        >
          <button onClick={() => navigate("/app")}
            style={{ background: C.grad, color: "#fff", fontSize: 15, fontWeight: 600, padding: "15px 36px", borderRadius: 9999, border: "none", cursor: "pointer", letterSpacing: "-0.02em", transition: "opacity 0.2s, transform 0.2s", boxShadow: "0 0 32px rgba(59,130,246,0.35), 0 0 64px rgba(6,182,212,0.15)" }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.87"; e.currentTarget.style.transform = "scale(1.03)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            Try first month free
          </button>
          <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            style={{ background: "transparent", color: C.muted, fontSize: 15, fontWeight: 500, padding: "15px 36px", borderRadius: 9999, border: `1px solid ${C.border}`, cursor: "pointer", letterSpacing: "-0.01em", transition: "border-color 0.2s, color 0.2s, transform 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; e.currentTarget.style.color = C.text; e.currentTarget.style.transform = "scale(1.02)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; e.currentTarget.style.transform = "scale(1)"; }}
          >
            View demo
          </button>
        </motion.div>

        {/* Product preview cards */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.50, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", maxWidth: 820, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}
        >
          {[
            { label: "Today",   sub: "All functions at a glance", number: "4 live",    icon: <DashIcon /> },
            { label: "Prep",    sub: "Team tasks & progress",     number: "68% done",  icon: <PrepIcon /> },
            { label: "Service", sub: "Fire courses in real-time", number: "Main away", icon: <ServiceIcon /> },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.54 + i * 0.07, duration: 0.5, ease: "easeOut" }}
              whileHover={{ scale: 1.025 }}
              style={{
                position: "relative",
                background: "rgba(255,255,255,0.035)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18,
                padding: "22px 20px",
                textAlign: "left",
                overflow: "hidden",
              }}
            >
              {/* Gradient top accent line */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: C.grad, opacity: 0.5 }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.15))", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {s.icon}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#06B6D4", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 9999, padding: "3px 9px", letterSpacing: "0.02em" }}>{s.number}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4, letterSpacing: "-0.02em" }}>{s.label}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{s.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.78, duration: 0.6 }}
          style={{ marginTop: 52, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "10px 28px" }}
        >
          {["Hotel chains", "Wedding venues", "Function centres", "Catering companies"].map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#3F3F46" }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="url(#ck)" strokeWidth="1.2" />
                <defs>
                  <linearGradient id="ck" x1="0" y1="0" x2="12" y2="12" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3B82F6" />
                    <stop offset="1" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
                <path d="M 3.5 6 L 5.2 7.8 L 8.5 4.5" stroke="url(#ck)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Tiny inline SVG icons for hero cards ─────────────────────────────────

/** Today — calendar view with highlighted event bars */
function DashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <defs>
        <linearGradient id="di" x1="0" y1="0" x2="18" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      {/* Calendar outline */}
      <rect x="2" y="2.5" width="14" height="13" rx="2.5" stroke="url(#di)" strokeWidth="1.4" />
      {/* Calendar cap nubs */}
      <line x1="6"  y1="1"   x2="6"  y2="4"   stroke="url(#di)" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="12" y1="1"   x2="12" y2="4"   stroke="url(#di)" strokeWidth="1.4" strokeLinecap="round" />
      {/* Header divider */}
      <line x1="2" y1="6.5" x2="16" y2="6.5" stroke="url(#di)" strokeWidth="0.9" opacity="0.4" />
      {/* Event bars */}
      <rect x="4" y="8.5"  width="10" height="1.8" rx="0.9" fill="url(#di)" />
      <rect x="4" y="11.5" width="6.5" height="1.8" rx="0.9" fill="url(#di)" opacity="0.55" />
    </svg>
  );
}

/** Prep — circular progress ring with inner checkmark */
function PrepIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <defs>
        <linearGradient id="pi" x1="0" y1="0" x2="18" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818CF8" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      {/* Track ring */}
      <circle cx="9" cy="9" r="6.5" stroke="rgba(129,140,248,0.18)" strokeWidth="2" />
      {/* Progress arc — ~68% (circumference ≈40.84, offset for 68% ≈13.07) */}
      <circle cx="9" cy="9" r="6.5"
        stroke="url(#pi)" strokeWidth="2"
        strokeDasharray="40.84" strokeDashoffset="13.07"
        strokeLinecap="round"
        transform="rotate(-90 9 9)"
      />
      {/* Checkmark */}
      <path d="M 6 9 L 8 11.2 L 12.5 6.5"
        stroke="url(#pi)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Service — clock face with precise hands (fire timing) */
function ServiceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <defs>
        <linearGradient id="si" x1="0" y1="0" x2="18" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22D3EE" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
      {/* Clock face */}
      <circle cx="9" cy="9" r="7" stroke="url(#si)" strokeWidth="1.4" />
      {/* Minute markers — top, right, bottom, left */}
      <line x1="9"  y1="3"  x2="9"  y2="4.2"  stroke="url(#si)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <line x1="15" y1="9"  x2="13.8" y2="9"  stroke="url(#si)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <line x1="9"  y1="15" x2="9"  y2="13.8" stroke="url(#si)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      {/* Hour hand (pointing ~10 o'clock) */}
      <path d="M 9 9 L 6 5.8" stroke="url(#si)" strokeWidth="1.7" strokeLinecap="round" />
      {/* Minute hand (pointing ~2 o'clock) */}
      <path d="M 9 9 L 12 5.5" stroke="url(#si)" strokeWidth="1.4" strokeLinecap="round" />
      {/* Centre dot */}
      <circle cx="9" cy="9" r="1.2" fill="url(#si)" />
    </svg>
  );
}

// ── Features ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    title: "Operational Intelligence",
    desc: "Every function, roster, and prep task in one place. Know what's happening across your kitchen at a glance — no clipboards, no group chats.",
    icon: <DashIcon />,
    grad: "linear-gradient(135deg, #3B82F6, #06B6D4)",
  },
  {
    title: "Prep Control",
    desc: "Assign, track, and complete prep tasks by section. Hot kitchen, cold larder, pastry — progress visible to every team member in real time.",
    icon: <PrepIcon />,
    grad: "linear-gradient(135deg, #06B6D4, #818CF8)",
  },
  {
    title: "Live Service Mode",
    desc: "Fire courses, hold service, track dietary requirements, and log every moment of service with a timestamped record your team can trust.",
    icon: <ServiceIcon />,
    grad: "linear-gradient(135deg, #818CF8, #3B82F6)",
  },
];

function Features() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="features" style={{ position: "relative", padding: "140px 28px", borderTop: `1px solid ${C.border}`, overflow: "hidden" }}>
      <Orb style={{ top: "20%", right: "-5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(129,140,248,0.1) 0%, transparent 68%)", filter: "blur(60px)" }} />
      <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <div style={{ width: 20, height: 1, background: C.grad }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", ...gradText, WebkitTextFillColor: undefined, color: "#06B6D4" }}>Features</span>
              <div style={{ width: 20, height: 1, background: C.grad }} />
            </div>
            <h2 style={{ fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1.05, margin: 0 }}>
              <span style={gradText}>Everything your kitchen needs.</span>
            </h2>
          </div>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {FEATURES.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.09}>
              <div
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: "relative",
                  background: hovered === i ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${hovered === i ? "rgba(255,255,255,0.14)" : C.border}`,
                  borderRadius: 24,
                  padding: "40px 36px",
                  height: "100%",
                  boxSizing: "border-box",
                  transition: "background 0.25s, border-color 0.25s, transform 0.25s",
                  transform: hovered === i ? "translateY(-4px)" : "translateY(0)",
                  overflow: "hidden",
                }}
              >
                {/* Gradient accent line at top */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: f.grad, opacity: hovered === i ? 0.8 : 0.3, transition: "opacity 0.25s" }} />

                {/* Gradient glow on hover */}
                {hovered === i && (
                  <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)", filter: "blur(20px)", pointerEvents: "none" }} />
                )}

                <div style={{ width: 48, height: 48, borderRadius: 14, background: f.grad, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28, boxShadow: hovered === i ? "0 0 20px rgba(59,130,246,0.3)" : "none", transition: "box-shadow 0.3s" }}>
                  <div style={{ transform: "scale(1.4)" }}>{f.icon}</div>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 14, letterSpacing: "-0.03em", lineHeight: 1.25 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: "#71717A", lineHeight: 1.75, margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── System section ─────────────────────────────────────────────────────────
function SystemSection() {
  const STATS = [
    { value: "10 min",  label: "From download to live operations" },
    { value: "100%",    label: "Works offline, no internet required" },
    { value: "Any role", label: "Plain-language UI for every staff member" },
  ];

  return (
    <section id="system" style={{ position: "relative", padding: "140px 28px", borderTop: `1px solid ${C.border}`, overflow: "hidden" }}>
      <Orb style={{ bottom: "10%", left: "-5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 68%)", filter: "blur(60px)" }} />
      <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="grid-cols-responsive">
        {/* Left */}
        <FadeUp>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
              <div style={{ width: 20, height: 1, background: C.grad }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#06B6D4" }}>The system</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px, 3.8vw, 46px)", fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1.1, margin: 0, marginBottom: 24 }}>
              <span style={gradText}>Built for modern kitchen operations.</span>
            </h2>
            <p style={{ fontSize: 16, color: "#71717A", lineHeight: 1.8, margin: 0, marginBottom: 20 }}>
              Replace spreadsheets, paper run sheets, and WhatsApp groups with a unified system. Every team member — from head chef to casual staff — working from the same source of truth.
            </p>
            <p style={{ fontSize: 16, color: "#71717A", lineHeight: 1.8, margin: 0 }}>
              Role-based access means managers see everything, team leaders control their sections, and staff see exactly what they need to do their job.
            </p>
          </div>
        </FadeUp>

        {/* Right: stats */}
        <FadeUp delay={0.1}>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {STATS.map((s, i) => (
              <div key={s.label}
                style={{
                  padding: "32px 0",
                  borderTop: `1px solid ${C.border}`,
                  borderBottom: i === STATS.length - 1 ? `1px solid ${C.border}` : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 20,
                }}
              >
                <span style={{
                  fontSize: "clamp(28px, 3.5vw, 44px)",
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                  ...gradText,
                }}>{s.value}</span>
                <span style={{ fontSize: 14, color: "#71717A", textAlign: "right", maxWidth: 200, lineHeight: 1.5 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────
function FinalCTA() {
  const [, navigate] = useLocation();
  const [hoverPrimary,   setHoverPrimary]   = useState(false);
  const [hoverSecondary, setHoverSecondary] = useState(false);

  return (
    <section style={{ position: "relative", padding: "160px 28px", borderTop: `1px solid ${C.border}`, overflow: "hidden" }}>
      {/* Central glow */}
      <Orb style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 700, height: 400, background: "radial-gradient(ellipse, rgba(59,130,246,0.14) 0%, rgba(6,182,212,0.08) 40%, transparent 70%)", filter: "blur(60px)" }} />

      <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <FadeUp>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 9999, padding: "1px", background: C.grad, marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.bg, borderRadius: 9999, padding: "6px 16px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.grad, display: "inline-block" }} />
              <span style={{ color: C.muted, fontSize: 13, fontWeight: 500 }}>Trusted by 200+ kitchens worldwide</span>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.06}>
          <h2 style={{ fontSize: "clamp(40px, 6.5vw, 76px)", fontWeight: 800, letterSpacing: "-0.055em", lineHeight: 1.02, margin: 0, marginBottom: 20 }}>
            <span style={gradText}>Run your kitchen<br />like a system.</span>
          </h2>
        </FadeUp>

        <FadeUp delay={0.12}>
          <p style={{ fontSize: 18, color: "#71717A", margin: 0, marginBottom: 52, letterSpacing: "-0.01em" }}>
            Start free. Scale when you're ready.
          </p>
        </FadeUp>

        <FadeUp delay={0.18}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
            <button
              onClick={() => navigate("/app")}
              onMouseEnter={() => setHoverPrimary(true)}
              onMouseLeave={() => setHoverPrimary(false)}
              style={{
                background: C.grad, color: "#fff", fontSize: 15, fontWeight: 700,
                padding: "16px 44px", borderRadius: 9999, border: "none", cursor: "pointer",
                letterSpacing: "-0.02em", transition: "opacity 0.2s, transform 0.2s",
                boxShadow: "0 0 40px rgba(59,130,246,0.4), 0 0 80px rgba(6,182,212,0.15)",
                opacity: hoverPrimary ? 0.85 : 1,
                transform: hoverPrimary ? "scale(1.03)" : "scale(1)",
              }}
            >Try first month free</button>
            <button
              onClick={() => navigate("/pricing")}
              onMouseEnter={() => setHoverSecondary(true)}
              onMouseLeave={() => setHoverSecondary(false)}
              style={{
                background: "transparent", color: hoverSecondary ? C.text : C.muted, fontSize: 15, fontWeight: 500,
                padding: "16px 44px", borderRadius: 9999,
                border: `1px solid ${hoverSecondary ? "rgba(255,255,255,0.2)" : C.border}`,
                cursor: "pointer", letterSpacing: "-0.01em",
                transition: "border-color 0.2s, color 0.2s, transform 0.2s",
                transform: hoverSecondary ? "scale(1.02)" : "scale(1)",
              }}
            >View pricing</button>
          </div>
        </FadeUp>

        {/* Testimonial */}
        <FadeUp delay={0.28}>
          <div style={{ marginTop: 88, display: "flex", justifyContent: "center" }}>
            <div style={{
              position: "relative",
              background: "rgba(255,255,255,0.035)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 24,
              padding: "36px 44px",
              maxWidth: 580,
              textAlign: "left",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: C.grad, opacity: 0.4 }} />
              {/* Quote mark */}
              <div style={{ fontSize: 56, lineHeight: 1, color: "rgba(59,130,246,0.3)", fontFamily: "Georgia, serif", marginBottom: 8, marginTop: -12 }}>"</div>
              <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.7, fontWeight: 400, margin: 0, marginBottom: 24, letterSpacing: "-0.01em" }}>
                PrepFlows replaced three separate systems and a wall of paper run sheets. Service has never been smoother.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(6,182,212,0.2))", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#06B6D4" }}>
                  MK
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, letterSpacing: "-0.01em" }}>Marcus K.</div>
                  <div style={{ fontSize: 12, color: "#52525B" }}>Executive Chef, Sofitel Melbourne</div>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────
function Footer() {
  const [, navigate] = useLocation();
  return (
    <footer style={{ borderTop: `1px solid ${C.border}`, padding: "40px 28px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={28} />
          <span style={{ fontWeight: 600, fontSize: 14, color: C.text, letterSpacing: "-0.02em" }}>PrepFlows</span>
        </div>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          {[
            { label: "Features", action: () => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }) },
            { label: "Pricing",  action: () => navigate("/pricing") },
            { label: "Log in",   action: () => navigate("/app") },
          ].map((l) => (
            <button key={l.label} onClick={l.action}
              style={{ fontSize: 13, color: "#3F3F46", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.muted)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#3F3F46")}
            >{l.label}</button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: "#3F3F46" }}>© {new Date().getFullYear()} PrepFlows</span>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function Home() {
  usePageMeta({
    title: "PrepFlows — Kitchen Operations Software for Hospitality Teams",
    description: "The operating system for professional kitchens. Manage functions, prep lists, rosters, and live service — all in one place. Free trial, no credit card required.",
    canonical: "https://prepflows.com/",
  });
  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, -apple-system, sans-serif", WebkitFontSmoothing: "antialiased", minHeight: "100vh" }}>
      <style>{`
        @media (max-width: 720px) {
          .grid-cols-responsive { grid-template-columns: 1fr !important; gap: 48px !important; }
          .hidden.md\\:flex { display: none !important; }
          .md\\:hidden { display: flex !important; }
        }
        @media (min-width: 721px) {
          .md\\:hidden { display: none !important; }
        }
      `}</style>
      <Nav />
      <Hero />
      <Features />
      <SystemSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
