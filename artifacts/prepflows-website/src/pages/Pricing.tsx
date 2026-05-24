import { useState } from "react";
import { useLocation } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Logo } from "@/components/Logo";

const YELLOW = "#EAB308";
const GREEN = "#22C55E";
const BLUE = "#3B82F6";

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

export default function Pricing() {
  usePageMeta({
    title: "Pricing — PrepFlows Kitchen Operations Software",
    description: "Simple, honest pricing for PrepFlows. Start free, no credit card required. Upgrade to Pro for $49/month or Team for $199/month. All plans include iOS, Android & Web.",
    canonical: "https://prepflows.com/pricing",
  });
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [, navigate] = useLocation();

  function handleCta(plan: typeof PLANS[0]) {
    if (!plan.priceId) {
      navigate("/app");
      return;
    }
    if (plan.id === "team") {
      document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    navigate(`/app?plan=${plan.priceId}&billing=${annual ? "annual" : "monthly"}`);
  }

  return (
    <div className="min-h-screen font-sans" style={{ background: "#0D1117", color: "#F0F6FC" }}>
      {/* ── NAV ── */}
      <nav style={{ borderBottom: "1px solid #21262D", background: "rgba(13,17,23,0.9)", backdropFilter: "blur(12px)" }}
        className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-lg font-bold">PrepFlows</span>
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="text-sm font-medium"
              style={{ color: "#8B949E" }}>Home</button>
            <button onClick={() => navigate("/app")}
              className="text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
              style={{ background: YELLOW, color: "#0D1117" }}>
              Log in
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="pt-32 pb-16 text-center px-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-6"
          style={{ background: `${YELLOW}15`, border: `1px solid ${YELLOW}30`, color: YELLOW }}>
          Simple, transparent pricing
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ letterSpacing: "-0.03em" }}>
          One subscription.<br />
          <span style={{ color: YELLOW }}>Your whole kitchen.</span>
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
            style={{ background: annual ? YELLOW : "#21262D" }}
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
            const price = plan.monthlyPrice === null
              ? "Free"
              : annual
                ? `$${Math.round((plan.yearlyPrice ?? 0) / 12)}`
                : `$${plan.monthlyPrice}`;
            const period = plan.monthlyPrice === null ? "" : "/month";
            const billed = annual && plan.monthlyPrice !== null
              ? `Billed $${plan.yearlyPrice}/yr`
              : plan.monthlyPrice !== null ? "Billed monthly" : "";

            return (
              <div
                key={plan.id}
                className="relative rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: plan.highlight ? `${YELLOW}08` : "#161B22",
                  border: `1.5px solid ${plan.highlight ? YELLOW + "60" : "#21262D"}`,
                  boxShadow: plan.highlight ? `0 0 40px ${YELLOW}15` : "none",
                }}
              >
                {plan.badge && (
                  <div className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: plan.highlight ? YELLOW : `${plan.color}25`, color: plan.highlight ? "#0D1117" : plan.color }}>
                    {plan.badge}
                  </div>
                )}

                <div className="p-8 flex-1 flex flex-col">
                  {/* Plan name & desc */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-1" style={{ color: plan.color }}>{plan.name}</h3>
                    <p className="text-sm" style={{ color: "#8B949E" }}>{plan.desc}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className="text-5xl font-black" style={{ letterSpacing: "-0.04em" }}>
                        {price}
                      </span>
                      {period && <span className="text-lg font-medium mb-2" style={{ color: "#8B949E" }}>{period}</span>}
                    </div>
                    {billed && (
                      <p className="text-xs mt-1" style={{ color: "#484F58" }}>{billed}</p>
                    )}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleCta(plan)}
                    className="w-full py-3.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-85 mb-8"
                    style={{
                      background: plan.highlight ? YELLOW : `${plan.color}20`,
                      color: plan.highlight ? "#0D1117" : plan.color,
                      border: plan.highlight ? "none" : `1.5px solid ${plan.color}40`,
                    }}
                  >
                    {plan.cta}
                  </button>

                  {/* Features */}
                  <ul className="flex flex-col gap-3">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <span className="flex-shrink-0 text-base">
                          {f.included ? (
                            <span style={{ color: plan.highlight ? YELLOW : GREEN }}>✓</span>
                          ) : (
                            <span style={{ color: "#484F58" }}>—</span>
                          )}
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

        {/* All plans include */}
        <div className="mt-16 rounded-2xl p-8 text-center" style={{ background: "#161B22", border: "1px solid #21262D" }}>
          <p className="text-sm font-bold mb-6" style={{ color: "#8B949E", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            All plans include
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "📱", label: "iOS, Android & Web" },
              { icon: "🔒", label: "End-to-end data security" },
              { icon: "🌏", label: "Multi-language UI" },
              { icon: "🔄", label: "Free updates forever" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm font-medium" style={{ color: "#8B949E" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center mb-10">Frequently asked questions</h2>
          <div className="max-w-2xl mx-auto flex flex-col gap-3">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden cursor-pointer"
                style={{ background: "#161B22", border: "1px solid #21262D" }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
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

        {/* ── Contact sales ── */}
        <div id="contact-section" className="mt-20 rounded-2xl p-10 text-center"
          style={{ background: `${YELLOW}08`, border: `1.5px solid ${YELLOW}25` }}>
          <span className="text-3xl mb-4 block">🏨</span>
          <h3 className="text-2xl font-bold mb-3">Running multiple venues?</h3>
          <p className="mb-6 max-w-md mx-auto" style={{ color: "#8B949E" }}>
            Talk to our team about custom pricing, dedicated onboarding, API access, and SLA support for groups.
          </p>
          <a
            href="mailto:sales@prepflows.com"
            className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-opacity hover:opacity-80"
            style={{ background: YELLOW, color: "#0D1117" }}
          >
            Contact sales →
          </a>
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
