import { useState } from "react";

const NAV_LINKS = ["Features", "Pricing", "About", "Blog", "Contact"];

const FEATURES = [
  {
    icon: "📋",
    title: "Smart Function Import",
    desc: "Paste a booking email and PrepFlows extracts the function name, room, covers, dietary requirements, and service times automatically.",
    color: "#EAB308",
  },
  {
    icon: "👥",
    title: "Team Roster & Shifts",
    desc: "Full staff directory with shift timelines, team assignments, sick-call tracking, and casual staff QR briefs — all in one screen.",
    color: "#22C55E",
  },
  {
    icon: "🍽️",
    title: "Prep Lists by Team",
    desc: "Prep tasks organised by section (Hot Kitchen, Cold Larder, Pastry, Butchery) with deadlines, quantities, and progress tracking.",
    color: "#3B82F6",
  },
  {
    icon: "🔥",
    title: "Live Service Mode",
    desc: "Fire courses, hold service, track section status in real-time, and keep a timestamped service log from a single full-screen view.",
    color: "#F97316",
  },
  {
    icon: "📊",
    title: "Analytics Dashboard",
    desc: "Manager-only view of weekly completion rates, on-time service metrics, labour efficiency, and dietary incident tracking.",
    color: "#8B5CF6",
  },
  {
    icon: "📱",
    title: "Works on Any Device",
    desc: "Native iOS and Android apps plus a full web version. All data syncs instantly so the whole kitchen stays aligned.",
    color: "#14B8A6",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    desc: "Perfect for a single venue getting started",
    features: [
      "Up to 3 functions per day",
      "Up to 10 staff members",
      "Prep list & roster",
      "QR staff briefs",
      "iOS, Android & Web",
    ],
    cta: "Get started free",
    highlight: false,
    badge: null,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    desc: "For busy venues running multiple events",
    features: [
      "Unlimited functions",
      "Unlimited staff",
      "Live Service Mode",
      "Smart Import (AI extract)",
      "Analytics Dashboard",
      "Priority support",
    ],
    cta: "Start free trial",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Team",
    price: "$199",
    period: "/month",
    desc: "Multi-venue groups and catering companies",
    features: [
      "Everything in Pro",
      "Unlimited venues",
      "Centralised roster management",
      "Cross-venue analytics",
      "Dedicated onboarding",
      "SLA support",
    ],
    cta: "Contact sales",
    highlight: false,
    badge: null,
  },
];

const BLOG_POSTS = [
  {
    tag: "Operations",
    tagColor: "#EAB308",
    title: "How top hotel kitchens cut prep time by 30%",
    desc: "The systems and habits that high-volume kitchens use to stay organised under pressure.",
    date: "May 12, 2026",
    read: "5 min read",
  },
  {
    tag: "Product",
    tagColor: "#22C55E",
    title: "Introducing Live Service Mode",
    desc: "Fire courses, hold service, and track section status from a single full-screen view.",
    date: "Apr 28, 2026",
    read: "3 min read",
  },
  {
    tag: "Tips",
    tagColor: "#3B82F6",
    title: "Writing a run sheet that actually gets followed",
    desc: "Plain-English timelines, clear categories, and one source of truth for the whole team.",
    date: "Apr 10, 2026",
    read: "4 min read",
  },
];

const TEAM = [
  { initials: "TK", name: "Tom Keller", role: "Co-founder & CEO", bio: "15 years in hotel F&B operations across Australia and SE Asia.", color: "#EAB308" },
  { initials: "SR", name: "Sarah Rowe", role: "Co-founder & CTO", bio: "Previously built ops tooling at a global catering group.", color: "#22C55E" },
  { initials: "MC", name: "Marcus Chen", role: "Head of Product", bio: "Ex-head chef turned product manager. Speaks both languages.", color: "#3B82F6" },
];

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  function scrollTo(id: string) {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  function handleContact(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      {/* ── NAV ─────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => scrollTo("hero")} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-sm">PF</div>
            <span className="text-lg font-bold text-foreground">PrepFlows</span>
          </button>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <button
                key={l}
                onClick={() => scrollTo(l.toLowerCase())}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {l}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button className="text-sm text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg transition-colors">Log in</button>
            <button
              onClick={() => scrollTo("pricing")}
              className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Get started free
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen
                ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              }
            </svg>
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-card px-6 py-4 flex flex-col gap-3">
            {NAV_LINKS.map((l) => (
              <button key={l} onClick={() => scrollTo(l.toLowerCase())} className="text-left text-sm text-muted-foreground py-2">{l}</button>
            ))}
            <button onClick={() => scrollTo("pricing")} className="mt-2 bg-primary text-white font-semibold text-sm py-3 rounded-lg">Get started free</button>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────── */}
      <section id="hero" className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5 text-xs text-muted-foreground mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block"></span>
            Now available on iOS, Android & Web
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.05] mb-6">
            The kitchen ops app<br />
            <span className="text-primary">built for service.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            PrepFlows keeps your whole kitchen team aligned — from morning prep to last covers.
            Functions, rosters, prep lists, and live service, all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => scrollTo("pricing")}
              className="w-full sm:w-auto bg-primary text-white font-bold px-8 py-4 rounded-xl text-base hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-900/20"
            >
              Start free — no credit card
            </button>
            <button
              onClick={() => scrollTo("features")}
              className="w-full sm:w-auto border border-border bg-card text-foreground font-semibold px-8 py-4 rounded-xl text-base hover:bg-secondary transition-colors"
            >
              See how it works
            </button>
          </div>

          {/* App mockup strip */}
          <div className="mt-16 grid grid-cols-3 gap-3 max-w-2xl mx-auto">
            {[
              { label: "Today", icon: "📅", color: "#EAB308", desc: "All functions at a glance" },
              { label: "Prep", icon: "✅", color: "#22C55E", desc: "Team tasks & progress" },
              { label: "Live", icon: "🔥", color: "#F97316", desc: "Fire courses in real-time" },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-2xl p-5 text-left relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-0.5" style={{ backgroundColor: s.color }} />
                <div className="text-2xl mb-3">{s.icon}</div>
                <div className="text-sm font-bold text-foreground mb-1">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.desc}</div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {["Hotel chains", "Wedding venues", "Function centres", "Catering companies"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-accent text-base">✓</span> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────── */}
      <section id="features" className="py-20 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Features</div>
            <h2 className="text-4xl font-black text-foreground mb-4">Everything your kitchen needs</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Purpose-built for back-of-house. Plain English throughout, so the whole team can use it.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group hover:border-primary/40 transition-colors">
                <div className="absolute inset-x-0 top-0 h-0.5 opacity-80" style={{ backgroundColor: f.color }} />
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-base font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────── */}
      <section id="pricing" className="py-20 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Pricing</div>
            <h2 className="text-4xl font-black text-foreground mb-4">Simple, honest pricing</h2>
            <p className="text-muted-foreground text-lg">Start free. Scale when you're ready.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl p-7 flex flex-col ${p.highlight
                  ? "bg-card border-2 border-primary shadow-xl shadow-yellow-900/10"
                  : "bg-card border border-border"
                }`}
              >
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {p.badge}
                  </div>
                )}
                <div className="mb-1 text-xs font-bold text-muted-foreground uppercase tracking-widest">{p.name}</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-4xl font-black ${p.highlight ? "text-primary" : "text-foreground"}`}>{p.price}</span>
                  {p.period && <span className="text-muted-foreground text-sm mb-1.5">{p.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground mb-6">{p.desc}</p>
                <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                      <span className="text-accent mt-0.5 shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => scrollTo("contact")}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${p.highlight
                    ? "bg-primary text-white hover:bg-yellow-400"
                    : "bg-secondary border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ───────────────────────────────────── */}
      <section id="about" className="py-20 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3">About</div>
            <h2 className="text-4xl font-black text-foreground mb-4">Built by people who've worked the line</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              PrepFlows was born in a hotel kitchen in Melbourne. We were tired of paper run sheets, WhatsApp prep lists, and the chaos of service. So we built what we wished we had.
            </p>
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-3 gap-5 mb-14">
            {[
              { icon: "🗣️", title: "Plain English first", desc: "Every screen is readable by any staff member, ESL or otherwise. No jargon." },
              { icon: "📵", title: "Works offline", desc: "All your data lives on the device. No internet? Still works. Service goes on." },
              { icon: "🔒", title: "Role-based access", desc: "Managers see everything. Staff see what they need. Secure by design." },
            ].map((v) => (
              <div key={v.title} className="bg-card border border-border rounded-2xl p-6">
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="font-bold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Team */}
          <h3 className="text-xl font-bold text-foreground text-center mb-8">The team</h3>
          <div className="grid md:grid-cols-3 gap-5">
            {TEAM.map((t) => (
              <div key={t.name} className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-lg mb-4"
                  style={{ backgroundColor: t.color + "30", color: t.color, border: `2px solid ${t.color}40` }}
                >
                  {t.initials}
                </div>
                <div className="font-bold text-foreground">{t.name}</div>
                <div className="text-xs text-primary font-semibold mb-2">{t.role}</div>
                <p className="text-sm text-muted-foreground">{t.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG ────────────────────────────────────── */}
      <section id="blog" className="py-20 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Blog</div>
            <h2 className="text-4xl font-black text-foreground mb-4">From the kitchen</h2>
            <p className="text-muted-foreground text-lg">Ops insights, product updates, and tips for running a better kitchen.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {BLOG_POSTS.map((b) => (
              <div key={b.title} className="bg-card border border-border rounded-2xl p-6 flex flex-col hover:border-primary/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: b.tagColor, backgroundColor: b.tagColor + "15" }}>{b.tag}</span>
                  <span className="text-xs text-muted-foreground">{b.read}</span>
                </div>
                <h3 className="text-base font-bold text-foreground mb-2 flex-1">{b.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{b.desc}</p>
                <div className="text-xs text-muted-foreground mt-auto">{b.date}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ─────────────────────────────────── */}
      <section id="contact" className="py-20 px-6 border-t border-border">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Contact</div>
            <h2 className="text-4xl font-black text-foreground mb-4">Get in touch</h2>
            <p className="text-muted-foreground text-lg">Questions, feedback, or ready to get your kitchen on PrepFlows?</p>
          </div>
          {sent ? (
            <div className="bg-card border border-accent/30 rounded-2xl p-10 text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Message sent!</h3>
              <p className="text-muted-foreground">We'll get back to you within one business day.</p>
            </div>
          ) : (
            <form onSubmit={handleContact} className="bg-card border border-border rounded-2xl p-8 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-background border border-input rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  placeholder="you@venue.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full bg-background border border-input rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Message</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell us about your kitchen..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full bg-background border border-input rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-yellow-400 transition-colors mt-2"
              >
                Send message
              </button>
            </form>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a href="mailto:hello@prepflows.com" className="hover:text-foreground transition-colors">hello@prepflows.com</a>
            <span>Melbourne, Australia</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-black text-xs">PF</div>
            <span className="font-bold text-foreground">PrepFlows</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {NAV_LINKS.map((l) => (
              <button key={l} onClick={() => scrollTo(l.toLowerCase())} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} PrepFlows. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
