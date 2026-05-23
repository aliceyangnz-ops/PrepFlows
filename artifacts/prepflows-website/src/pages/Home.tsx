import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

// ── Design tokens (inline — isolated from the rest of the site) ───────────
const C = {
  bg: "#0A0A0A",
  bg2: "#111111",
  surface: "rgba(255,255,255,0.04)",
  surfaceHover: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.08)",
  borderHover: "rgba(255,255,255,0.14)",
  text: "#FFFFFF",
  muted: "#A1A1AA",
  dim: "#52525B",
  accent: "#3B82F6",
  accentDim: "rgba(59,130,246,0.12)",
  accentBorder: "rgba(59,130,246,0.25)",
} as const;

// ── Fade-up animation helper ──────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Features", id: "features" },
  { label: "System", id: "system" },
  { label: "Pricing", href: "/pricing" },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
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
        background: scrolled ? "rgba(10,10,10,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <button onClick={() => go("hero")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 13, letterSpacing: "-0.02em" }}>PF</div>
          <span style={{ color: C.text, fontWeight: 600, fontSize: 16, letterSpacing: "-0.02em" }}>PrepFlows</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex" style={{ alignItems: "center", gap: 36 }}>
          {NAV_LINKS.map((l) => (
            <button key={l.label} onClick={() => go(l.id, l.href)}
              style={{ color: C.muted, fontSize: 14, fontWeight: 500, background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex" style={{ alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate("/app")}
            style={{ color: C.muted, fontSize: 14, fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: "8px 16px", borderRadius: 9999, transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
          >
            Log in
          </button>
          <button onClick={() => navigate("/app")}
            style={{ background: C.text, color: "#000", fontSize: 14, fontWeight: 600, padding: "9px 20px", borderRadius: 9999, border: "none", cursor: "pointer", transition: "opacity 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Start free trial
          </button>
        </div>

        {/* Hamburger */}
        <button className="md:hidden" onClick={() => setMobile(!mobile)}
          style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobile
              ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobile && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ borderTop: `1px solid ${C.border}`, background: "rgba(10,10,10,0.97)", backdropFilter: "blur(20px)", padding: "16px 28px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
            {NAV_LINKS.map((l) => (
              <button key={l.label} onClick={() => go(l.id, l.href)}
                style={{ color: C.muted, fontSize: 15, fontWeight: 500, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: "8px 0" }}>
                {l.label}
              </button>
            ))}
            <button onClick={() => navigate("/app")}
              style={{ marginTop: 8, background: C.text, color: "#000", fontSize: 14, fontWeight: 600, padding: "14px 20px", borderRadius: 9999, border: "none", cursor: "pointer", textAlign: "center" }}>
              Start free trial
            </button>
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
    <section id="hero" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 28px 100px", textAlign: "center" }}>
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${C.border}`, borderRadius: 9999, padding: "7px 16px", marginBottom: 40, background: C.surface }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, display: "inline-block" }} />
        <span style={{ color: C.muted, fontSize: 13, fontWeight: 500, letterSpacing: "0.01em" }}>Now available on iOS, Android & Web</span>
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ fontSize: "clamp(52px, 8vw, 88px)", fontWeight: 300, color: C.text, lineHeight: 1.0, letterSpacing: "-0.05em", margin: 0, marginBottom: 20 }}
      >
        PrepFlows
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26, duration: 0.6, ease: "easeOut" }}
        style={{ fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 400, color: C.muted, letterSpacing: "-0.02em", margin: 0, marginBottom: 16, maxWidth: 640 }}
      >
        The operating system for professional kitchens.
      </motion.p>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.34, duration: 0.6 }}
        style={{ fontSize: 15, fontWeight: 500, color: C.dim, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 52 }}
      >
        Plan &nbsp;·&nbsp; Prep &nbsp;·&nbsp; Service &nbsp;·&nbsp; Scale
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42, duration: 0.5, ease: "easeOut" }}
        style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginBottom: 80 }}
      >
        <button onClick={() => navigate("/app")}
          style={{ background: C.text, color: "#000", fontSize: 15, fontWeight: 600, padding: "14px 32px", borderRadius: 9999, border: "none", cursor: "pointer", letterSpacing: "-0.01em", transition: "opacity 0.2s, transform 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "scale(1.02)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          Start free trial
        </button>
        <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
          style={{ background: "transparent", color: C.text, fontSize: 15, fontWeight: 500, padding: "14px 32px", borderRadius: 9999, border: `1px solid ${C.border}`, cursor: "pointer", letterSpacing: "-0.01em", transition: "border-color 0.2s, transform 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.transform = "scale(1.02)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "scale(1)"; }}
        >
          View demo
        </button>
      </motion.div>

      {/* Product preview strip */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.52, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: 800, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}
      >
        {[
          { label: "Today", sub: "All functions at a glance", icon: "▦", number: "4 live" },
          { label: "Prep", sub: "Team tasks & progress", icon: "◉", number: "68% done" },
          { label: "Service", sub: "Fire courses in real-time", icon: "◈", number: "Main away" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.56 + i * 0.08, duration: 0.5, ease: "easeOut" }}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: "20px 20px",
              textAlign: "left",
              cursor: "default",
              transition: "background 0.2s, border-color 0.2s, transform 0.25s",
            }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 20, color: C.accent, opacity: 0.8 }}>{s.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.accent, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 9999, padding: "3px 9px" }}>{s.number}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4, letterSpacing: "-0.01em" }}>{s.label}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{s.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Social proof row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        style={{ marginTop: 56, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "12px 32px" }}
      >
        {["Hotel chains", "Wedding venues", "Function centres", "Catering companies"].map((t) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.dim }}>
            <span style={{ color: C.accent, fontSize: 11 }}>✓</span>
            {t}
          </div>
        ))}
      </motion.div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "◈",
    title: "Operational Intelligence",
    desc: "Every function, roster, and prep task in one place. Know what's happening across your kitchen at a glance — no clipboards, no group chats.",
  },
  {
    icon: "◉",
    title: "Prep Control",
    desc: "Assign, track, and complete prep tasks by section. Hot kitchen, cold larder, pastry — progress visible to every team member in real time.",
  },
  {
    icon: "▦",
    title: "Live Service Mode",
    desc: "Fire courses, hold service, track dietary requirements, and log every moment of service with a timestamped record your team can trust.",
  },
];

function Features() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="features" style={{ padding: "140px 28px", borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 18 }}>
              Features
            </div>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 300, color: C.text, letterSpacing: "-0.04em", lineHeight: 1.1, margin: 0 }}>
              Everything your kitchen needs.
            </h2>
          </div>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {FEATURES.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.08}>
              <div
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: hovered === i ? C.surfaceHover : C.surface,
                  border: `1px solid ${hovered === i ? C.borderHover : C.border}`,
                  borderRadius: 20,
                  padding: "36px 32px",
                  height: "100%",
                  boxSizing: "border-box",
                  transition: "background 0.25s, border-color 0.25s, transform 0.25s",
                  transform: hovered === i ? "scale(1.015)" : "scale(1)",
                  cursor: "default",
                }}
              >
                <div style={{ fontSize: 28, color: C.accent, marginBottom: 24, opacity: 0.85 }}>{f.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: C.text, marginBottom: 12, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: 0 }}>
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
    { value: "10 min", label: "Setup time" },
    { value: "100%", label: "Offline capable" },
    { value: "Any role", label: "Plain-language UI" },
  ];

  return (
    <section id="system" style={{ padding: "140px 28px", borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="grid-cols-responsive">
        {/* Left: text */}
        <FadeUp>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 24 }}>
              The system
            </div>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 300, color: C.text, letterSpacing: "-0.04em", lineHeight: 1.15, margin: 0, marginBottom: 24 }}>
              Built for modern kitchen operations.
            </h2>
            <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.75, margin: 0, marginBottom: 24 }}>
              Replace spreadsheets, paper run sheets, and WhatsApp groups with a unified system. Every team member — from head chef to casual staff — working from the same source of truth.
            </p>
            <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.75, margin: 0 }}>
              Role-based access means managers see everything, team leaders control their sections, and staff see exactly what they need to do their job.
            </p>
          </div>
        </FadeUp>

        {/* Right: stats */}
        <FadeUp delay={0.1}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {STATS.map((s, i) => (
              <div key={s.label}
                style={{
                  padding: "28px 0",
                  borderTop: i === 0 ? `1px solid ${C.border}` : "none",
                  borderBottom: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 20,
                }}
              >
                <span style={{ fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 300, color: C.text, letterSpacing: "-0.04em" }}>{s.value}</span>
                <span style={{ fontSize: 14, color: C.muted, textAlign: "right", maxWidth: 180, lineHeight: 1.4 }}>{s.label}</span>
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
  const [hoverPrimary, setHoverPrimary] = useState(false);
  const [hoverSecondary, setHoverSecondary] = useState(false);

  return (
    <section style={{ padding: "160px 28px", borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <FadeUp>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${C.border}`, borderRadius: 9999, padding: "7px 16px", marginBottom: 40, background: C.surface }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, display: "inline-block" }} />
            <span style={{ color: C.muted, fontSize: 13, fontWeight: 500 }}>Trusted by 200+ kitchens worldwide</span>
          </div>
        </FadeUp>

        <FadeUp delay={0.06}>
          <h2 style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 300, color: C.text, letterSpacing: "-0.05em", lineHeight: 1.05, margin: 0, marginBottom: 20 }}>
            Run your kitchen<br />like a system.
          </h2>
        </FadeUp>

        <FadeUp delay={0.12}>
          <p style={{ fontSize: 18, color: C.muted, margin: 0, marginBottom: 52, letterSpacing: "-0.01em" }}>
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
                background: C.text, color: "#000", fontSize: 15, fontWeight: 600,
                padding: "14px 36px", borderRadius: 9999, border: "none", cursor: "pointer",
                letterSpacing: "-0.01em", transition: "opacity 0.2s, transform 0.2s",
                opacity: hoverPrimary ? 0.86 : 1,
                transform: hoverPrimary ? "scale(1.02)" : "scale(1)",
              }}
            >
              Start free trial
            </button>
            <button
              onClick={() => navigate("/pricing")}
              onMouseEnter={() => setHoverSecondary(true)}
              onMouseLeave={() => setHoverSecondary(false)}
              style={{
                background: "transparent", color: C.text, fontSize: 15, fontWeight: 500,
                padding: "14px 36px", borderRadius: 9999,
                border: `1px solid ${hoverSecondary ? C.borderHover : C.border}`,
                cursor: "pointer", letterSpacing: "-0.01em",
                transition: "border-color 0.2s, transform 0.2s",
                transform: hoverSecondary ? "scale(1.02)" : "scale(1)",
              }}
            >
              View pricing
            </button>
          </div>
        </FadeUp>

        {/* Testimonial */}
        <FadeUp delay={0.26}>
          <div style={{ marginTop: 80, display: "flex", justifyContent: "center" }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "32px 40px", maxWidth: 580, textAlign: "left" }}>
              <p style={{ fontSize: 16, color: C.text, lineHeight: 1.65, fontWeight: 400, margin: 0, marginBottom: 20, letterSpacing: "-0.01em" }}>
                "PrepFlows replaced three separate systems and a wall of paper run sheets. Service has never been smoother."
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${C.accentDim}`, border: `1px solid ${C.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: C.accent }}>
                  MK
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Marcus K.</div>
                  <div style={{ fontSize: 12, color: C.dim }}>Executive Chef, Sofitel Melbourne</div>
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
          <div style={{ width: 28, height: 28, borderRadius: 7, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 11 }}>PF</div>
          <span style={{ fontWeight: 600, fontSize: 14, color: C.text, letterSpacing: "-0.01em" }}>PrepFlows</span>
        </div>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          {[
            { label: "Features", action: () => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }) },
            { label: "Pricing", action: () => navigate("/pricing") },
            { label: "Log in", action: () => navigate("/app") },
          ].map((l) => (
            <button key={l.label} onClick={l.action}
              style={{ fontSize: 13, color: C.dim, background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.muted)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.dim)}
            >
              {l.label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: C.dim }}>© {new Date().getFullYear()} PrepFlows</span>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function Home() {
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
