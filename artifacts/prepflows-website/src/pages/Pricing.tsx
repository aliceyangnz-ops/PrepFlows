import { useState } from "react";
import { useLocation } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Logo } from "@/components/Logo";

const YELLOW = "#EAB308";
const GREEN  = "#22C55E";
const BLUE   = "#3B82F6";
const CYAN   = "#06B6D4";
const INDIGO = "#818CF8";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: null,
    yearlyPrice: null,
    desc: "For a single venue getting started with digital ops",
    color: "#8B949E",
    features: [
      { text: "Up to 3 functions per day", included: true },
      { text: "Up to 10 staff members", included: true },
      { text: "Prep list & roster", included: true },
      { text: "QR staff briefs", included: true },
      { text: "iOS, Android & Web", included: true },
      { text: "Live Service Mode", included: false },
      { text: "Smart Import", included: false },
      { text: "Analytics Dashboard", included: false },
      { text: "Priority support", included: false },
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
    color: YELLOW,
    features: [
      { text: "Unlimited functions", included: true },
      { text: "Unlimited staff", included: true },
      { text: "Prep list & roster", included: true },
      { text: "QR staff briefs", included: true },
      { text: "iOS, Android & Web", included: true },
      { text: "Live Service Mode", included: true },
      { text: "Smart Import (AI extract)", included: true },
      { text: "Analytics Dashboard", included: true },
      { text: "Priority support", included: true },
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
    color: BLUE,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited venues", included: true },
      { text: "Centralised roster management", included: true },
      { text: "Cross-venue analytics", included: true },
      { text: "Dedicated onboarding", included: true },
      { text: "API access", included: true },
      { text: "SLA support (4hr response)", included: true },
      { text: "Custom integrations", included: true },
      { text: "White-label option", included: false },
    ],
    cta: "Contact sales",
    highlight: false,
    badge: "Enterprise",
    priceId: "team",
  },
];

const FAQ = [
  {
    q: "Is there a free trial?",
    a: "Yes — Pro includes a 14-day free trial. No credit card required to start. You'll only be charged after the trial ends.",
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. You can upgrade, downgrade, or cancel any time from your billing dashboard. Prorated credits apply when upgrading mid-cycle.",
  },
  {
    q: "How does billing work?",
    a: "Monthly plans are billed on the same date each month. Annual plans are billed once per year and save you 20% compared to monthly.",
  },
  {
    q: "Does my whole team need accounts?",
    a: "No. One subscription covers your entire venue. Staff access the app on their own devices — no per-seat pricing.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your data is kept for 30 days after cancellation. You can export everything as a CSV or PDF before then.",
  },
  {
    q: "Do you support multiple currencies?",
    a: "Pricing is in USD. Stripe handles currency conversion automatically for non-USD cards.",
  },
];

/* ── Reusable gradient defs (single SVG, shared across icons) ── */
function GradDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="pg-icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#60A5FA" />
          <stop offset="45%"  stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <filter id="pg-icon-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

/* ── Futuristic icon wrapper ── */
function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: 56, height: 56,
      borderRadius: 16,
      background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.06))",
      border: "1px solid rgba(59,130,246,0.25)",
      boxShadow: "0 0 18px rgba(59,130,246,0.12)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      {children}
    </div>
  );
}

/* ── Individual futuristic SVG icons ── */
function IconDevice({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect x="8" y="2" width="12" height="18" rx="3"
        stroke="url(#pg-icon-grad)" strokeWidth="1.8" filter="url(#pg-icon-glow)" />
      <line x1="14" y1="17" x2="14" y2="17.5"
        stroke="url(#pg-icon-grad)" strokeWidth="2" strokeLinecap="round" />
      <rect x="2" y="7" width="8" height="11" rx="2"
        stroke="url(#pg-icon-grad)" strokeWidth="1.4" strokeOpacity="0.5" />
      <rect x="18" y="7" width="8" height="11" rx="2"
        stroke="url(#pg-icon-grad)" strokeWidth="1.4" strokeOpacity="0.5" />
    </svg>
  );
}

function IconShield({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M14 3 L24 7 L24 13 C24 19 19 23.5 14 25.5 C9 23.5 4 19 4 13 L4 7 Z"
        stroke="url(#pg-icon-grad)" strokeWidth="1.8" strokeLinejoin="round"
        filter="url(#pg-icon-glow)" />
      <path d="M10 14 L13 17 L18 11"
        stroke="url(#pg-icon-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGlobe({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="10"
        stroke="url(#pg-icon-grad)" strokeWidth="1.8" filter="url(#pg-icon-glow)" />
      <ellipse cx="14" cy="14" rx="5" ry="10"
        stroke="url(#pg-icon-grad)" strokeWidth="1.4" strokeOpacity="0.6" />
      <line x1="4" y1="14" x2="24" y2="14"
        stroke="url(#pg-icon-grad)" strokeWidth="1.4" strokeOpacity="0.6" />
      <path d="M6 9.5 Q14 11 22 9.5" stroke="url(#pg-icon-grad)" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />
      <path d="M6 18.5 Q14 17 22 18.5" stroke="url(#pg-icon-grad)" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />
    </svg>
  );
}

function IconRefresh({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M22 14 A8 8 0 0 1 7 19.5"
        stroke="url(#pg-icon-grad)" strokeWidth="1.8" strokeLinecap="round"
        filter="url(#pg-icon-glow)" />
      <path d="M6 14 A8 8 0 0 1 21 8.5"
        stroke="url(#pg-icon-grad)" strokeWidth="1.8" strokeLinecap="round" />
      <polyline points="22,9 22,14 17,14"
        stroke="url(#pg-icon-grad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="6,19 6,14 11,14"
        stroke="url(#pg-icon-grad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBuildings({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="14" y="8" width="20" height="36" rx="2"
        stroke="url(#pg-icon-grad)" strokeWidth="2" filter="url(#pg-icon-glow)" />
      <rect x="4" y="18" width="10" height="26" rx="2"
        stroke="url(#pg-icon-grad)" strokeWidth="1.8" strokeOpacity="0.7" />
      <rect x="34" y="18" width="10" height="26" rx="2"
        stroke="url(#pg-icon-grad)" strokeWidth="1.8" strokeOpacity="0.7" />
      <line x1="14" y1="18" x2="34" y2="18"
        stroke="url(#pg-icon-grad)" strokeWidth="1.2" strokeOpacity="0.4" />
      <line x1="14" y1="26" x2="34" y2="26"
        stroke="url(#pg-icon-grad)" strokeWidth="1.2" strokeOpacity="0.4" />
      <line x1="14" y1="34" x2="34" y2="34"
        stroke="url(#pg-icon-grad)" strokeWidth="1.2" strokeOpacity="0.4" />
      <rect x="20" y="34" width="8" height="10" rx="1"
        stroke="url(#pg-icon-grad)" strokeWidth="1.6" />
    </svg>
  );
}

const ALL_PLAN_ITEMS = [
  { icon: <IconDevice />,  label: "iOS, Android & Web" },
  { icon: <IconShield />,  label: "End-to-end data security" },
  { icon: <IconGlobe />,   label: "Multi-language UI" },
  { icon: <IconRefresh />, label: "Free updates forever" },
];

export default function Pricing() {
  usePageMeta({
    title: "Pricing — PrepFlows Kitchen Operations Software",
    description: "Simple, honest pricing for PrepFlows. Start free, no credit card required. Upgrade to Pro for $49/month or Team for $199/month. All plans include iOS, Android & Web.",
    canonical: "https://prepflows.com/pricing",
  });
  const [annual, setAnnual]   = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [, navigate]          = useLocation();

  function handleCta(plan: typeof PLANS[0]) {
    if (!plan.priceId) { navigate("/app"); return; }
    if (plan.id === "team") {
      document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    navigate(`/app?plan=${plan.priceId}&billing=${annual ? "annual" : "monthly"}`);
  }

  return (
    <div className="min-h-screen font-sans" style={{ background: "#0D1117", color: "#F0F6FC" }}>
      <GradDefs />

      {/* ── NAV ── */}
      <nav style={{ borderBottom: "1px solid #21262D", background: "rgba(13,17,23,0.9)", backdropFilter: "blur(12px)" }}
        className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-lg font-bold">PrepFlows</span>
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="text-sm font-medium" style={{ color: "#8B949E" }}>Home</button>
            <button onClick={() => navigate("/app")}
              className="text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
              style={{ background: YELLOW, color: "#0D1117" }}>
              Log in
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="pt-32 pb-16 text-center px-6" style={{ position: "relative", overflow: "hidden" }}>
        {/* ambient glow */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: 600, height: 320,
          background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.13) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-6"
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.1))",
            border: "1px solid rgba(59,130,246,0.3)",
            color: CYAN,
          }}>
          Simple, transparent pricing
        </div>

        <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ letterSpacing: "-0.03em" }}>
          Choose Your Plan
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: "#8B949E" }}>
          No per-seat fees. No hidden extras. Every staff member on your team uses the app under a single venue subscription.
        </p>

        {/* Monthly / Annual toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className="text-sm font-semibold" style={{ color: annual ? "#8B949E" : "#F0F6FC" }}>Monthly</span>
          <button
            onClick={() => setAnnual((a) => !a)}
            className="relative w-12 h-6 rounded-full transition-colors"
            style={{ background: annual ? `linear-gradient(90deg, ${BLUE}, ${CYAN})` : "#21262D" }}
          >
            <span
              className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
              style={{ left: annual ? "26px" : "4px" }}
            />
          </button>
          <span className="text-sm font-semibold" style={{ color: annual ? "#F0F6FC" : "#8B949E" }}>
            Annual
            <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${GREEN}20`, color: GREEN }}>
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* ── PLAN CARDS ── */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const price  = plan.monthlyPrice === null ? "Free" : annual ? `$${Math.round((plan.yearlyPrice ?? 0) / 12)}` : `$${plan.monthlyPrice}`;
            const period = plan.monthlyPrice === null ? "" : "/month";
            const billed = annual && plan.monthlyPrice !== null ? `Billed $${plan.yearlyPrice}/yr` : plan.monthlyPrice !== null ? "Billed monthly" : "";

            return (
              <div key={plan.id} className="relative rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: plan.highlight ? `${YELLOW}08` : "#161B22",
                  border: `1.5px solid ${plan.highlight ? YELLOW + "60" : "#21262D"}`,
                  boxShadow: plan.highlight ? `0 0 40px ${YELLOW}15` : "none",
                }}>
                {plan.badge && (
                  <div className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: plan.highlight ? YELLOW : `${plan.color}25`, color: plan.highlight ? "#0D1117" : plan.color }}>
                    {plan.badge}
                  </div>
                )}
                <div className="p-8 flex-1 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-1" style={{ color: plan.color }}>{plan.name}</h3>
                    <p className="text-sm" style={{ color: "#8B949E" }}>{plan.desc}</p>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className="text-5xl font-black" style={{ letterSpacing: "-0.04em" }}>{price}</span>
                      {period && <span className="text-lg font-medium mb-2" style={{ color: "#8B949E" }}>{period}</span>}
                    </div>
                    {billed && <p className="text-xs mt-1" style={{ color: "#484F58" }}>{billed}</p>}
                  </div>
                  <button onClick={() => handleCta(plan)}
                    className="w-full py-3.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-85 mb-8"
                    style={{
                      background: plan.highlight ? YELLOW : `${plan.color}20`,
                      color: plan.highlight ? "#0D1117" : plan.color,
                      border: plan.highlight ? "none" : `1.5px solid ${plan.color}40`,
                    }}>
                    {plan.cta}
                  </button>
                  <ul className="flex flex-col gap-3">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <span className="flex-shrink-0 text-base">
                          {f.included ? <span style={{ color: plan.highlight ? YELLOW : GREEN }}>✓</span> : <span style={{ color: "#484F58" }}>—</span>}
                        </span>
                        <span style={{ color: f.included ? "#F0F6FC" : "#484F58" }}>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── ALL PLANS INCLUDE ── */}
        <div className="mt-16 rounded-2xl overflow-hidden" style={{
          background: "#161B22",
          border: "1px solid rgba(59,130,246,0.18)",
          boxShadow: "0 0 40px rgba(59,130,246,0.06)",
        }}>
          {/* gradient accent bar */}
          <div style={{
            height: 3,
            background: `linear-gradient(90deg, ${BLUE}, ${CYAN}, ${INDIGO})`,
          }} />
          <div className="p-8 text-center">
            <p className="text-sm font-bold mb-8" style={{
              color: CYAN,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}>
              All plans include
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {ALL_PLAN_ITEMS.map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-3">
                  <IconBadge>{item.icon}</IconBadge>
                  <span className="text-sm font-medium leading-snug" style={{ color: "#8B949E" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center mb-10">Frequently asked questions</h2>
          <div className="max-w-2xl mx-auto flex flex-col gap-3">
            {FAQ.map((item, i) => (
              <div key={i} className="rounded-xl overflow-hidden cursor-pointer"
                style={{ background: "#161B22", border: "1px solid #21262D" }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="flex items-center justify-between px-6 py-4">
                  <span className="font-semibold text-sm">{item.q}</span>
                  <span style={{ color: "#8B949E", fontSize: 18 }}>{openFaq === i ? "−" : "+"}</span>
                </div>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm leading-relaxed" style={{ color: "#8B949E" }}>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── RUNNING MULTIPLE VENUES ── */}
        <div id="contact-section" className="mt-20 rounded-2xl overflow-hidden" style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.07) 0%, rgba(6,182,212,0.04) 50%, rgba(129,140,248,0.06) 100%)",
          border: "1.5px solid rgba(59,130,246,0.28)",
          boxShadow: "0 0 50px rgba(59,130,246,0.10)",
        }}>
          {/* gradient accent bar */}
          <div style={{
            height: 3,
            background: `linear-gradient(90deg, ${BLUE}, ${CYAN}, ${INDIGO})`,
          }} />
          <div className="p-10 text-center">
            {/* futuristic buildings icon */}
            <div className="flex justify-center mb-6">
              <div style={{
                width: 72, height: 72,
                borderRadius: 20,
                background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.08))",
                border: "1px solid rgba(59,130,246,0.3)",
                boxShadow: "0 0 24px rgba(59,130,246,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <IconBuildings size={40} />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3">Running multiple venues?</h3>
            <p className="mb-8 max-w-md mx-auto text-base" style={{ color: "#8B949E" }}>
              Talk to our team about custom pricing, dedicated onboarding, API access, and SLA support for groups.
            </p>
            <a href="mailto:sales@prepflows.com"
              className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-xl transition-opacity hover:opacity-85"
              style={{
                background: `linear-gradient(135deg, ${BLUE}, ${CYAN})`,
                color: "#fff",
                boxShadow: `0 4px 20px rgba(59,130,246,0.35)`,
                letterSpacing: "0.01em",
              }}>
              Contact sales
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #21262D" }} className="py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={28} />
            <span className="font-bold">PrepFlows</span>
          </div>
          <p className="text-xs" style={{ color: "#484F58" }}>
            © {new Date().getFullYear()} PrepFlows · All rights reserved
          </p>
          <div className="flex gap-5">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a key={l} href="#" className="text-xs transition-colors hover:text-white" style={{ color: "#484F58" }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
