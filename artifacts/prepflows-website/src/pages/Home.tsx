import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Logo } from "@/components/Logo";

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg:          "#0D1117",
  card:        "#161B22",
  surface:     "rgba(22,27,34,0.85)",
  border:      "rgba(255,255,255,0.07)",
  borderHover: "rgba(234,179,8,0.35)",
  text:        "#F0F6FC",
  muted:       "#8B949E",
  dim:         "#484F58",
  yellow:      "#EAB308",
  green:       "#22C55E",
  yellowGlow:  "rgba(234,179,8,0.18)",
  greenGlow:   "rgba(34,197,94,0.14)",
} as const;

const yellowText = {
  background:           "linear-gradient(135deg, #FDE68A 0%, #EAB308 45%, #CA8A04 100%)",
  WebkitBackgroundClip: "text" as const,
  WebkitTextFillColor:  "transparent",
  backgroundClip:       "text" as const,
};

const warmText = {
  background:           "linear-gradient(135deg, #FFFFFF 0%, #F0F6FC 40%, #FDE68A 80%, #EAB308 100%)",
  WebkitBackgroundClip: "text" as const,
  WebkitTextFillColor:  "transparent",
  backgroundClip:       "text" as const,
};

// ── Fade-up helper ────────────────────────────────────────────────────────
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

// ── Ambient orb ───────────────────────────────────────────────────────────
function Orb({ style }: { style: React.CSSProperties }) {
  return <div style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", ...style }} />;
}

// ── Liquid glass card ─────────────────────────────────────────────────────
function GlassCard({ children, style, active = false, className = "" }: { children: React.ReactNode; style?: React.CSSProperties; active?: boolean; className?: string }) {
  return (
    <div className={className} style={{
      position: "relative",
      background: "linear-gradient(160deg, rgba(30,37,48,0.90) 0%, rgba(18,23,30,0.95) 100%)",
      borderRadius: 20,
      border: `1px solid ${active ? C.yellow + "55" : "rgba(255,255,255,0.08)"}`,
      boxShadow: active
        ? `0 0 40px ${C.yellowGlow}, inset 0 1px 0 rgba(255,255,255,0.10)`
        : "inset 0 1px 0 rgba(255,255,255,0.07), 0 2px 24px rgba(0,0,0,0.4)",
      overflow: "hidden",
      ...style,
    }}>
      {/* specular highlight */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "48%", pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0) 100%)",
        borderRadius: "20px 20px 0 0",
      }} />
      {/* top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1, pointerEvents: "none",
        background: active
          ? `linear-gradient(90deg, transparent, ${C.yellow}88, transparent)`
          : "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Features",  id: "features"  },
  { label: "How it works", id: "system" },
  { label: "Pricing",   href: "/pricing" },
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
        borderBottom: scrolled ? `1px solid rgba(234,179,8,0.12)` : "1px solid transparent",
        background: scrolled ? "rgba(13,17,23,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => go("hero")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer" }}>
          <Logo size={30} />
          <span style={{ color: C.text, fontWeight: 700, fontSize: 16, letterSpacing: "-0.03em" }}>PrepFlows</span>
        </button>

        <div className="hidden md:flex" style={{ alignItems: "center", gap: 36 }}>
          {NAV_LINKS.map((l) => (
            <button key={l.label} onClick={() => go(l.id, l.href)}
              style={{ color: C.muted, fontSize: 14, fontWeight: 500, background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
            >{l.label}</button>
          ))}
        </div>

        <div className="hidden md:flex" style={{ alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate("/app")}
            style={{ color: C.muted, fontSize: 14, fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: "8px 16px", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
          >Log in</button>
          <button onClick={() => navigate("/app")}
            style={{ background: C.yellow, color: "#0D1117", fontSize: 14, fontWeight: 700, padding: "9px 22px", borderRadius: 9999, border: "none", cursor: "pointer", transition: "opacity 0.2s, transform 0.2s", letterSpacing: "-0.01em", boxShadow: `0 0 20px ${C.yellowGlow}` }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "scale(1.03)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
          >Start free →</button>
        </div>

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
            style={{ borderTop: `1px solid rgba(234,179,8,0.12)`, background: "rgba(13,17,23,0.97)", backdropFilter: "blur(24px)", padding: "16px 28px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
            {NAV_LINKS.map((l) => (
              <button key={l.label} onClick={() => go(l.id, l.href)}
                style={{ color: C.muted, fontSize: 15, fontWeight: 500, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: "8px 0" }}
              >{l.label}</button>
            ))}
            <button onClick={() => navigate("/app")}
              style={{ marginTop: 8, background: C.yellow, color: "#0D1117", fontSize: 14, fontWeight: 700, padding: "14px 20px", borderRadius: 9999, border: "none", cursor: "pointer", textAlign: "center" }}
            >Start free →</button>
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

      {/* Ambient yellow/green orbs */}
      <Orb style={{ top: "6%",  left: "8%",  width: 480, height: 480, background: `radial-gradient(circle, ${C.yellowGlow} 0%, transparent 68%)`, filter: "blur(52px)" }} />
      <Orb style={{ top: "10%", right: "6%", width: 380, height: 380, background: `radial-gradient(circle, ${C.greenGlow} 0%, transparent 68%)`,  filter: "blur(52px)" }} />
      <Orb style={{ bottom: "12%", left: "50%", transform: "translateX(-50%)", width: 640, height: 300, background: `radial-gradient(ellipse, rgba(234,179,8,0.07) 0%, transparent 68%)`, filter: "blur(64px)" }} />

      {/* Dot grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(234,179,8,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px", zIndex: 0, pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5 }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 9999, padding: "5px 16px", background: `${C.yellow}18`, border: `1px solid ${C.yellow}40`, marginBottom: 44 }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.yellow, display: "inline-block", flexShrink: 0 }} />
          <span style={{ color: C.yellow, fontSize: 13, fontWeight: 600, letterSpacing: "0.02em" }}>iOS · Android · Web — one subscription</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontSize: "clamp(52px, 8.5vw, 92px)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.05em", margin: 0, marginBottom: 10 }}
        >
          <span style={warmText}>PrepFlows</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.6 }}
          style={{ fontSize: "clamp(18px, 2.6vw, 26px)", fontWeight: 300, color: "#6E7681", letterSpacing: "-0.02em", margin: 0, marginBottom: 14, maxWidth: 580, lineHeight: 1.3 }}
        >
          The operating system for
          <br />
          <span style={{ color: C.muted }}>professional kitchens.</span>
        </motion.p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.30, duration: 0.6 }}
          style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 52 }}
        >
          Plan &nbsp;·&nbsp; Prep &nbsp;·&nbsp; Service &nbsp;·&nbsp; Scale
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.5 }}
          style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginBottom: 88 }}
        >
          <button onClick={() => navigate("/app")}
            style={{ background: C.yellow, color: "#0D1117", fontSize: 15, fontWeight: 700, padding: "15px 38px", borderRadius: 9999, border: "none", cursor: "pointer", letterSpacing: "-0.01em", transition: "opacity 0.2s, transform 0.2s", boxShadow: `0 0 36px ${C.yellowGlow}, 0 0 80px rgba(234,179,8,0.08)` }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.87"; e.currentTarget.style.transform = "scale(1.03)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            Start free trial
          </button>
          <button onClick={() => navigate("/pricing")}
            style={{ background: "transparent", color: C.muted, fontSize: 15, fontWeight: 500, padding: "15px 38px", borderRadius: 9999, border: `1px solid rgba(255,255,255,0.10)`, cursor: "pointer", letterSpacing: "-0.01em", transition: "border-color 0.2s, color 0.2s, transform 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(234,179,8,0.40)"; e.currentTarget.style.color = C.text; e.currentTarget.style.transform = "scale(1.02)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; e.currentTarget.style.color = C.muted; e.currentTarget.style.transform = "scale(1)"; }}
          >
            View pricing
          </button>
        </motion.div>

        {/* Preview cards — liquid glass */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", maxWidth: 840, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}
        >
          {[
            { label: "Today",    sub: "All functions at a glance",  number: "4 live",     color: C.yellow,  icon: <TodayIcon /> },
            { label: "Prep",     sub: "Team tasks & progress",      number: "68% done",   color: C.green,   icon: <PrepIcon /> },
            { label: "Roster",   sub: "Staff, shifts & roles",      number: "12 on shift", color: C.yellow,  icon: <RosterIcon /> },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52 + i * 0.07, duration: 0.5 }}
              whileHover={{ scale: 1.025, y: -3 }}
            >
              <GlassCard style={{ padding: "22px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${s.color}18`, border: `1px solid ${s.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {s.icon}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: `${s.color}14`, border: `1px solid ${s.color}28`, borderRadius: 9999, padding: "3px 9px", letterSpacing: "0.02em" }}>{s.number}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4, letterSpacing: "-0.02em", textAlign: "left" }}>{s.label}</div>
                <div style={{ fontSize: 12, color: C.muted, textAlign: "left" }}>{s.sub}</div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          style={{ marginTop: 52, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "10px 28px" }}
        >
          {["Hotel chains", "Wedding venues", "Function centres", "Catering companies"].map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: C.dim }}>
              <CheckMark />
              {t}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    title: "Operational Intelligence",
    desc: "Every function, roster, and prep task in one place. Know what's happening across your kitchen at a glance — no clipboards, no group chats.",
    icon: <TodayIcon size={22} />,
    color: C.yellow,
  },
  {
    title: "Prep Control",
    desc: "Assign, track, and complete prep tasks by section. Hot kitchen, cold larder, pastry — progress visible to every team member in real time.",
    icon: <PrepIcon size={22} />,
    color: C.green,
  },
  {
    title: "Live Service Mode",
    desc: "Fire courses, hold service, track dietary requirements, and log every moment of service with a timestamped record your team can trust.",
    icon: <ServiceIcon size={22} />,
    color: C.yellow,
  },
];

function Features() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="features" style={{ position: "relative", padding: "140px 28px", borderTop: `1px solid ${C.border}`, overflow: "hidden" }}>
      <Orb style={{ top: "15%", right: "-4%", width: 520, height: 520, background: `radial-gradient(circle, rgba(234,179,8,0.08) 0%, transparent 68%)`, filter: "blur(60px)" }} />

      <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 24, height: 1, background: C.yellow }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.yellow }}>Features</span>
              <div style={{ width: 24, height: 1, background: C.yellow }} />
            </div>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1.05, margin: 0 }}>
              <span style={warmText}>Everything your kitchen needs.</span>
            </h2>
          </div>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {FEATURES.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.09}>
              <div
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ height: "100%", transition: "transform 0.25s", transform: hovered === i ? "translateY(-4px)" : "translateY(0)" }}
              >
                <GlassCard active={hovered === i} style={{ padding: "40px 36px", height: "100%", boxSizing: "border-box", transition: "box-shadow 0.25s, border-color 0.25s" }}>
                  {/* hover glow */}
                  {hovered === i && (
                    <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${f.color}15, transparent 70%)`, filter: "blur(24px)", pointerEvents: "none" }} />
                  )}
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: `${f.color}16`, border: `1px solid ${f.color}35`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28, boxShadow: hovered === i ? `0 0 20px ${f.color}25` : "none", transition: "box-shadow 0.25s" }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: "-0.03em", marginBottom: 12 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                </GlassCard>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── System / How it works ─────────────────────────────────────────────────
const STEPS = [
  {
    n: "01",
    title: "Add your functions",
    desc: "Paste an email or booking confirmation — Smart Import pulls the venue, time, covers, and dietary notes automatically. Or enter manually in seconds.",
    color: C.yellow,
  },
  {
    n: "02",
    title: "Build your roster",
    desc: "Add staff once, assign sections and shift times. Role-based access means managers see everything; line cooks see their section.",
    color: C.green,
  },
  {
    n: "03",
    title: "Run your prep",
    desc: "Prep lists appear automatically from function data. Each section tracks its own progress. No double-handling, no missed tasks.",
    color: C.yellow,
  },
  {
    n: "04",
    title: "Fire service",
    desc: "Live Service Mode keeps your team in sync — fire courses, monitor dietary flags, and log the record as you go. Works offline on any device.",
    color: C.green,
  },
];

function System() {
  return (
    <section id="system" style={{ position: "relative", padding: "140px 28px", borderTop: `1px solid ${C.border}`, overflow: "hidden" }}>
      <Orb style={{ bottom: "20%", left: "-4%", width: 500, height: 500, background: `radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 68%)`, filter: "blur(60px)" }} />

      <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 88 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 24, height: 1, background: C.green }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.green }}>How it works</span>
              <div style={{ width: 24, height: 1, background: C.green }} />
            </div>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1.05, margin: 0 }}>
              <span style={warmText}>From booking to plated.</span>
            </h2>
            <p style={{ marginTop: 16, fontSize: 16, color: C.muted, maxWidth: 480, margin: "16px auto 0" }}>
              PrepFlows follows the natural flow of kitchen operations — no retraining required.
            </p>
          </div>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 }}>
          {STEPS.map((s, i) => (
            <FadeUp key={s.n} delay={i * 0.08}>
              <GlassCard style={{ padding: "32px 28px", height: "100%" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: s.color, letterSpacing: "0.18em", marginBottom: 18, opacity: 0.7 }}>{s.n}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: "-0.03em", marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                {/* bottom colour bar */}
                <div style={{ position: "absolute", bottom: 0, left: 24, right: 24, height: 2, borderRadius: 9999, background: `linear-gradient(90deg, ${s.color}80, ${s.color}20)` }} />
              </GlassCard>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── For your team ──────────────────────────────────────────────────────────
const ROLES = [
  {
    role: "Executive Chef",
    quote: "I can see every function running in the building without leaving my section. Dietary alerts come straight to me.",
    initial: "EC",
    color: C.yellow,
  },
  {
    role: "Function Coordinator",
    quote: "Smart Import saves me 20 minutes per booking. I paste the email, check the details, and the whole team is briefed.",
    initial: "FC",
    color: C.green,
  },
  {
    role: "Sous Chef",
    quote: "The QR brief means casuals know their section, their team leader, and every dietary note before they even clock on.",
    initial: "SC",
    color: C.yellow,
  },
];

function ForYourTeam() {
  return (
    <section style={{ position: "relative", padding: "140px 28px", borderTop: `1px solid ${C.border}`, overflow: "hidden" }}>
      <Orb style={{ top: "30%", right: "0%", width: 440, height: 440, background: `radial-gradient(circle, rgba(234,179,8,0.06) 0%, transparent 68%)`, filter: "blur(56px)" }} />

      <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 24, height: 1, background: C.yellow }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.yellow }}>Built for kitchen teams</span>
              <div style={{ width: 24, height: 1, background: C.yellow }} />
            </div>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1.05, margin: 0 }}>
              <span style={warmText}>For every person in the kitchen.</span>
            </h2>
          </div>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {ROLES.map((r, i) => (
            <FadeUp key={r.role} delay={i * 0.09}>
              <GlassCard style={{ padding: "32px 30px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 22, background: `${r.color}20`, border: `1px solid ${r.color}35`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: r.color }}>{r.initial}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{r.role}</span>
                </div>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>"{r.quote}"</p>
              </GlassCard>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ────────────────────────────────────────────────────────────────────
function CTA() {
  const [, navigate] = useLocation();

  return (
    <section style={{ padding: "140px 28px", borderTop: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
      <Orb style={{ top: "10%", left: "50%", transform: "translateX(-50%)", width: 700, height: 400, background: `radial-gradient(ellipse, rgba(234,179,8,0.10) 0%, transparent 68%)`, filter: "blur(72px)" }} />

      <FadeUp>
        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1.05, marginBottom: 20 }}>
            <span style={warmText}>Ready to run a tighter kitchen?</span>
          </h2>
          <p style={{ fontSize: 17, color: C.muted, marginBottom: 44, lineHeight: 1.6 }}>
            Join hotel chains, function centres, and catering companies who've replaced clipboards and group chats with PrepFlows.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
            <button onClick={() => navigate("/app")}
              style={{ background: C.yellow, color: "#0D1117", fontSize: 16, fontWeight: 700, padding: "16px 42px", borderRadius: 9999, border: "none", cursor: "pointer", transition: "opacity 0.2s, transform 0.2s", boxShadow: `0 0 48px ${C.yellowGlow}` }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.87"; e.currentTarget.style.transform = "scale(1.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              Start free trial
            </button>
            <button onClick={() => navigate("/pricing")}
              style={{ background: "transparent", color: C.muted, fontSize: 16, fontWeight: 500, padding: "16px 42px", borderRadius: 9999, border: `1px solid rgba(255,255,255,0.10)`, cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${C.yellow}40`; e.currentTarget.style.color = C.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; e.currentTarget.style.color = C.muted; }}
            >
              View pricing
            </button>
          </div>
          <p style={{ marginTop: 24, fontSize: 13, color: C.dim }}>No credit card required · 14-day Pro trial · Cancel anytime</p>
        </div>
      </FadeUp>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────
function Footer() {
  const [, navigate] = useLocation();

  return (
    <footer style={{ borderTop: `1px solid ${C.border}`, padding: "48px 28px 40px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 48, justifyContent: "space-between", marginBottom: 48 }}>
          {/* Brand */}
          <div style={{ maxWidth: 260 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Logo size={30} />
              <span style={{ fontWeight: 700, fontSize: 16, color: C.text }}>PrepFlows</span>
            </div>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0 }}>
              The operating system for professional kitchens. Plan, prep, and service from one platform.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: 64, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>Product</p>
              {[
                { label: "Features",  action: () => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }) },
                { label: "Pricing",   action: () => navigate("/pricing") },
                { label: "Dashboard", action: () => navigate("/app") },
              ].map((l) => (
                <button key={l.label} onClick={l.action}
                  style={{ display: "block", marginBottom: 10, fontSize: 13, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
                >{l.label}</button>
              ))}
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>Company</p>
              {["Privacy", "Terms", "Contact"].map((l) => (
                <a key={l} href={`mailto:${l === "Contact" ? "hello@prepflows.com" : "#"}`}
                  style={{ display: "block", marginBottom: 10, fontSize: 13, color: C.muted, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
                >{l}</a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 28, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 12, color: C.dim, margin: 0 }}>© {new Date().getFullYear()} PrepFlows · All rights reserved</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block" }} />
            <span style={{ fontSize: 12, color: C.dim }}>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── SVG icons ─────────────────────────────────────────────────────────────
function TodayIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2.5" width="14" height="13" rx="2.5" stroke="#EAB308" strokeWidth="1.4" />
      <line x1="6" y1="1" x2="6" y2="4" stroke="#EAB308" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="12" y1="1" x2="12" y2="4" stroke="#EAB308" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="2" y1="6.5" x2="16" y2="6.5" stroke="#EAB308" strokeWidth="0.9" opacity="0.4" />
      <rect x="4" y="8.5" width="10" height="1.8" rx="0.9" fill="#EAB308" />
      <rect x="4" y="11.5" width="6.5" height="1.8" rx="0.9" fill="#EAB308" opacity="0.5" />
    </svg>
  );
}

function PrepIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="6.5" stroke="rgba(34,197,94,0.2)" strokeWidth="2" />
      <circle cx="9" cy="9" r="6.5" stroke="#22C55E" strokeWidth="2"
        strokeDasharray="40.84" strokeDashoffset="13.07"
        strokeLinecap="round" transform="rotate(-90 9 9)" />
      <path d="M 6 9 L 8 11.2 L 12.5 6.5" stroke="#22C55E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ServiceIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="#EAB308" strokeWidth="1.4" />
      <line x1="9" y1="3" x2="9" y2="4.2" stroke="#EAB308" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <line x1="15" y1="9" x2="13.8" y2="9" stroke="#EAB308" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <line x1="9" y1="15" x2="9" y2="13.8" stroke="#EAB308" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <path d="M 9 9 L 6 5.8" stroke="#EAB308" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M 9 9 L 12 5.5" stroke="#EAB308" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="9" cy="9" r="1.2" fill="#EAB308" />
    </svg>
  );
}

function RosterIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="6" r="3" stroke="#EAB308" strokeWidth="1.4" />
      <path d="M3 15c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#EAB308" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function CheckMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke="#EAB308" strokeWidth="1.2" strokeOpacity="0.5" />
      <path d="M 3.5 6 L 5.2 7.8 L 8.5 4.5" stroke="#EAB308" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────
export default function Home() {
  usePageMeta({
    title: "PrepFlows — Kitchen Operations Platform",
    description: "PrepFlows is the operating system for professional kitchens. Manage functions, prep lists, rosters, and live service from iOS, Android, or the web.",
    canonical: "https://prepflows.com",
  });

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh" }}>
      <Nav />
      <Hero />
      <Features />
      <System />
      <ForYourTeam />
      <CTA />
      <Footer />
    </div>
  );
}
