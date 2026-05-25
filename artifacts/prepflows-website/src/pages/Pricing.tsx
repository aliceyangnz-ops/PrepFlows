import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, useInView } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Logo } from "@/components/Logo";

const C = {
  bg:     "#0D1117",
  card:   "#161B22",
  border: "#21262D",
  text:   "#F0F6FC",
  muted:  "#8B949E",
  dim:    "#484F58",
  yellow: "#EAB308",
  green:  "#22C55E",
} as const;

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >{children}</motion.div>
  );
}

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: null,
    yearlyPrice: null,
    desc: "For a single venue getting started with digital ops",
    color: C.muted,
    features: [
      { text: "Up to 3 functions per day",     included: true  },
      { text: "Up to 10 staff members",         included: true  },
      { text: "Prep list & roster",             included: true  },
      { text: "QR staff briefs",                included: true  },
      { text: "iOS, Android & Web",             included: true  },
      { text: "Live Service Mode",              included: false },
      { text: "Smart Import (AI extract)",      included: false },
      { text: "Analytics Dashboard",            included: false },
      { text: "Priority support",               included: false },
    ],
    cta: "Get started free",
    highlight: false,
    badge: null,
    priceId: null,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 49,
    yearlyPrice: 470,
    desc: "For busy venues running multiple events every week",
    color: C.yellow,
    features: [
      { text: "Unlimited functions",            included: true },
      { text: "Unlimited staff",                included: true },
      { text: "Prep list & roster",             included: true },
      { text: "QR staff briefs",                included: true },
      { text: "iOS, Android & Web",             included: true },
      { text: "Live Service Mode",              included: true },
      { text: "Smart Import (AI extract)",      included: true },
      { text: "Analytics Dashboard",            included: true },
      { text: "Priority support",               included: true },
    ],
    cta: "Start free trial",
    highlight: true,
    badge: "Most popular",
    priceId: "pro",
  },
  {
    id: "team",
    name: "Team",
    monthlyPrice: 199,
    yearlyPrice: 1910,
    desc: "For multi-venue groups and hotel catering companies",
    color: C.green,
    features: [
      { text: "Everything in Pro",              included: true  },
      { text: "Unlimited venues",               included: true  },
      { text: "Centralised roster management",  included: true  },
      { text: "Cross-venue analytics",          included: true  },
      { text: "Dedicated onboarding",           included: true  },
      { text: "API access",                     included: true  },
      { text: "SLA support (4hr response)",     included: true  },
      { text: "Custom integrations",            included: true  },
      { text: "White-label option",             included: false },
    ],
    cta: "Contact sales",
    highlight: false,
    badge: "Enterprise",
    priceId: "team",
  },
];

const FAQ = [
  { q: "Is there a free trial?",           a: "Yes — Pro includes a 14-day free trial. No credit card required to start. You'll only be charged after the trial ends." },
  { q: "Can I switch plans later?",        a: "Absolutely. You can upgrade, downgrade, or cancel any time from your billing dashboard. Prorated credits apply when upgrading mid-cycle." },
  { q: "How does billing work?",           a: "Monthly plans are billed on the same date each month. Annual plans are billed once per year and save you 20% compared to monthly." },
  { q: "Does my whole team need accounts?",a: "No. One subscription covers your entire venue. Staff access the app on their own devices — no per-seat pricing." },
  { q: "What happens to my data if I cancel?", a: "Your data is kept for 30 days after cancellation. You can export everything as a CSV or PDF before then." },
  { q: "Do you support multiple currencies?",  a: "Pricing is in USD. Stripe handles currency conversion automatically for non-USD cards." },
];

const ALL_INCLUDE = [
  { icon: "📱", label: "iOS, Android & Web" },
  { icon: "🔒", label: "End-to-end data security" },
  { icon: "🌏", label: "Multi-language UI" },
  { icon: "✨", label: "Free updates forever" },
];

export default function Pricing() {
  usePageMeta({
    title: "Pricing — PrepFlows Kitchen Operations Software",
    description: "Simple, honest pricing for PrepFlows. Start free, no credit card required. Upgrade to Pro for $49/month or Team for $199/month.",
    canonical: "https://prepflows.com/pricing",
  });

  const [annual,  setAnnual]  = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [, navigate] = useLocation();

  function handleCta(plan: typeof PLANS[0]) {
    if (!plan.priceId) { navigate("/app"); return; }
    if (plan.id === "team") {
      document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    navigate(`/app?plan=${plan.priceId}&billing=${annual ? "annual" : "monthly"}`);
  }

  return (
    <div className="min-h-screen font-sans" style={{ background: C.bg, color: C.text }}>

      {/* ── NAV ── */}
      <nav style={{ borderBottom: `1px solid ${C.border}`, background: "rgba(13,17,23,0.92)", backdropFilter: "blur(16px)" }}
        className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <Logo size={30} />
            <span className="text-base font-bold" style={{ letterSpacing: "-0.03em" }}>PrepFlows</span>
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="text-sm font-medium transition-colors hover:text-white" style={{ color: C.muted, background: "none", border: "none", cursor: "pointer" }}>Home</button>
            <button onClick={() => navigate("/app")}
              className="text-sm font-bold px-4 py-2 rounded-full transition-opacity hover:opacity-85"
              style={{ background: C.yellow, color: "#0D1117", border: "none", cursor: "pointer" }}>
              Log in
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="pt-36 pb-16 text-center px-6" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 700, height: 360, background: "radial-gradient(ellipse at 50% 0%, rgba(234,179,8,0.10) 0%, transparent 68%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(234,179,8,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

        <FadeUp>
          <div className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-full mb-6"
            style={{ background: `${C.yellow}18`, border: `1px solid ${C.yellow}40`, color: C.yellow }}>
            Simple, transparent pricing
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ letterSpacing: "-0.04em" }}>
            Choose Your Plan
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: C.muted }}>
            No per-seat fees. No hidden extras. Every staff member uses the app under a single venue subscription.
          </p>
        </FadeUp>

        {/* Toggle */}
        <FadeUp delay={0.08}>
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className="text-sm font-semibold" style={{ color: annual ? C.muted : C.text }}>Monthly</span>
            <button
              onClick={() => setAnnual((a) => !a)}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{ background: annual ? C.yellow : "#21262D", border: "none", cursor: "pointer" }}
            >
              <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: annual ? "26px" : "4px", backgroundColor: annual ? "#0D1117" : "#fff" }} />
            </button>
            <span className="text-sm font-semibold" style={{ color: annual ? C.text : C.muted }}>
              Annual
              <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${C.green}20`, color: C.green }}>
                Save 20%
              </span>
            </span>
          </div>
        </FadeUp>
      </div>

      {/* ── PLAN CARDS ── */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => {
            const price  = plan.monthlyPrice === null ? "Free" : annual ? `$${Math.round((plan.yearlyPrice ?? 0) / 12)}` : `$${plan.monthlyPrice}`;
            const period = plan.monthlyPrice === null ? "" : "/mo";
            const billed = annual && plan.monthlyPrice !== null ? `Billed $${plan.yearlyPrice}/yr` : plan.monthlyPrice !== null ? "Billed monthly" : "";

            return (
              <FadeUp key={plan.id} delay={i * 0.08}>
                <div className="relative rounded-2xl overflow-hidden flex flex-col h-full"
                  style={{
                    background: plan.highlight
                      ? "linear-gradient(160deg, rgba(30,37,48,0.95) 0%, rgba(20,25,32,0.98) 100%)"
                      : "linear-gradient(160deg, rgba(22,27,34,0.90) 0%, rgba(16,20,26,0.95) 100%)",
                    border: `1.5px solid ${plan.highlight ? C.yellow + "55" : C.border}`,
                    boxShadow: plan.highlight
                      ? `0 0 50px rgba(234,179,8,0.12), inset 0 1px 0 rgba(255,255,255,0.08)`
                      : "inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}>

                  {/* specular highlight */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0) 100%)", borderRadius: "14px 14px 0 0", pointerEvents: "none" }} />
                  {/* top accent line */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: plan.highlight ? `linear-gradient(90deg, transparent, ${C.yellow}99, transparent)` : `linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)`, pointerEvents: "none" }} />

                  {plan.badge && (
                    <div className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: plan.highlight ? C.yellow : `${plan.color}22`, color: plan.highlight ? "#0D1117" : plan.color, zIndex: 1 }}>
                      {plan.badge}
                    </div>
                  )}

                  <div className="p-8 flex-1 flex flex-col" style={{ position: "relative", zIndex: 1 }}>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-1" style={{ color: plan.color, letterSpacing: "-0.03em" }}>{plan.name}</h3>
                      <p className="text-sm" style={{ color: C.muted }}>{plan.desc}</p>
                    </div>

                    <div className="mb-7">
                      <div className="flex items-end gap-1">
                        <span className="text-5xl font-black" style={{ letterSpacing: "-0.04em" }}>{price}</span>
                        {period && <span className="text-base font-medium mb-2" style={{ color: C.muted }}>{period}</span>}
                      </div>
                      {billed && <p className="text-xs mt-1" style={{ color: C.dim }}>{billed}</p>}
                    </div>

                    <button onClick={() => handleCta(plan)}
                      className="w-full py-3.5 rounded-xl font-bold text-sm mb-8 transition-opacity hover:opacity-85"
                      style={{
                        background: plan.highlight ? C.yellow : `${plan.color}20`,
                        color: plan.highlight ? "#0D1117" : plan.color,
                        border: plan.highlight ? "none" : `1.5px solid ${plan.color}40`,
                        boxShadow: plan.highlight ? `0 0 24px rgba(234,179,8,0.25)` : "none",
                        cursor: "pointer",
                      }}>
                      {plan.cta}
                    </button>

                    <ul className="flex flex-col gap-3">
                      {plan.features.map((f, fi) => (
                        <li key={fi} className="flex items-center gap-3 text-sm">
                          <span className="flex-shrink-0">
                            {f.included
                              ? <span style={{ color: plan.highlight ? C.yellow : C.green }}>✓</span>
                              : <span style={{ color: C.dim }}>—</span>}
                          </span>
                          <span style={{ color: f.included ? C.text : C.dim }}>{f.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </FadeUp>
            );
          })}
        </div>

        {/* ── ALL PLANS INCLUDE ── */}
        <FadeUp delay={0.1}>
          <div className="mt-16 rounded-2xl overflow-hidden"
            style={{ background: "linear-gradient(160deg, rgba(22,27,34,0.90) 0%, rgba(16,20,26,0.95) 100%)", border: `1px solid ${C.yellow}22`, boxShadow: `0 0 40px rgba(234,179,8,0.05), inset 0 1px 0 rgba(255,255,255,0.06)` }}>
            <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${C.yellow}88, ${C.green}66, transparent)` }} />
            <div className="p-8 text-center">
              <p className="text-xs font-bold mb-8" style={{ color: C.yellow, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                All plans include
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {ALL_INCLUDE.map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-3">
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: `${C.yellow}12`, border: `1px solid ${C.yellow}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium leading-snug" style={{ color: C.muted }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeUp>

        {/* ── FAQ ── */}
        <FadeUp delay={0.1}>
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-center mb-10" style={{ letterSpacing: "-0.03em" }}>Frequently asked questions</h2>
            <div className="max-w-2xl mx-auto flex flex-col gap-3">
              {FAQ.map((item, i) => (
                <div key={i} className="rounded-xl overflow-hidden cursor-pointer transition-colors"
                  style={{ background: "linear-gradient(160deg, rgba(22,27,34,0.90) 0%, rgba(16,20,26,0.95) 100%)", border: `1px solid ${openFaq === i ? C.yellow + "40" : C.border}`, boxShadow: openFaq === i ? `0 0 20px rgba(234,179,8,0.06)` : "none" }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <div className="flex items-center justify-between px-6 py-4">
                    <span className="font-semibold text-sm">{item.q}</span>
                    <span style={{ color: openFaq === i ? C.yellow : C.muted, fontSize: 18, fontWeight: 300 }}>{openFaq === i ? "−" : "+"}</span>
                  </div>
                  {openFaq === i && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 pb-5">
                      <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{item.a}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* ── MULTI-VENUE CTA ── */}
        <FadeUp delay={0.08}>
          <div id="contact-section" className="mt-20 rounded-2xl overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(22,27,34,0.95) 0%, rgba(16,20,26,0.98) 100%)", border: `1.5px solid ${C.green}40`, boxShadow: `0 0 50px rgba(34,197,94,0.08), inset 0 1px 0 rgba(255,255,255,0.06)` }}>
            <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${C.green}88, ${C.yellow}66, transparent)` }} />
            <div className="p-10 text-center">
              <div className="flex justify-center mb-6">
                <div style={{ width: 72, height: 72, borderRadius: 20, background: `${C.green}16`, border: `1px solid ${C.green}35`, boxShadow: `0 0 24px rgba(34,197,94,0.14)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                  🏨
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ letterSpacing: "-0.03em" }}>Running multiple venues?</h3>
              <p className="mb-8 max-w-md mx-auto text-base" style={{ color: C.muted }}>
                Talk to our team about custom pricing, dedicated onboarding, API access, and SLA support for groups.
              </p>
              <a href="mailto:sales@prepflows.com"
                className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-full transition-opacity hover:opacity-85"
                style={{ background: C.green, color: "#0D1117", boxShadow: `0 4px 24px rgba(34,197,94,0.28)`, letterSpacing: "-0.01em", textDecoration: "none" }}>
                Contact sales
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="#0D1117" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </FadeUp>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${C.border}` }} className="py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5" style={{ background: "none", border: "none", cursor: "pointer" }}>
            <Logo size={28} />
            <span className="font-bold" style={{ color: C.text }}>PrepFlows</span>
          </button>
          <p className="text-xs" style={{ color: C.dim }}>
            © {new Date().getFullYear()} PrepFlows · All rights reserved
          </p>
          <div className="flex gap-5">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a key={l} href="#" className="text-xs transition-colors hover:text-white" style={{ color: C.dim, textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
