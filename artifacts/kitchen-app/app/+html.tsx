import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

const APP_NAME = "PrepFlows";
const APP_DESC =
  "The hospitality operations platform for back-of-house teams. Manage functions, prep lists, rosters and service timelines — on iOS, Android and web.";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        {/* ── Character set & viewport ───────────────────────────────── */}
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="format-detection" content="telephone=no" />

        {/* ── Title & description ────────────────────────────────────── */}
        <title>{APP_NAME} — Hospitality Operations Platform</title>
        <meta name="description" content={APP_DESC} />

        {/* ── Crawling ───────────────────────────────────────────────── */}
        {/*
          Note: Replit dev-preview URLs (.replit.dev) have noindex applied at
          the proxy level — this cannot be overridden here. The production
          server (serve.js) correctly sends X-Robots-Tag: index, follow.
        */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large" />

        {/* Canonical — set dynamically so it works across any deployment domain */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var l=document.createElement('link');l.rel='canonical';l.href=location.origin+location.pathname.replace(/\\/+$/,'') || '/';document.head.appendChild(l);})();`,
          }}
        />

        {/* ── PWA / theme ────────────────────────────────────────────── */}
        <meta name="theme-color" content="#EAB308" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/assets/images/icon.png" />
        <link rel="icon" href="/assets/images/icon.png" type="image/png" />

        {/* ── Open Graph ─────────────────────────────────────────────── */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${APP_NAME} — Hospitality Operations Platform`} />
        <meta property="og:description" content={APP_DESC} />
        <meta property="og:site_name" content={APP_NAME} />
        <meta property="og:locale" content="en_AU" />
        <meta property="og:image" content="/assets/images/icon.png" />

        {/* ── Twitter card ───────────────────────────────────────────── */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${APP_NAME} — Hospitality Operations Platform`} />
        <meta name="twitter:description" content={APP_DESC} />
        <meta name="twitter:image" content="/assets/images/icon.png" />

        {/* ── Structured data ────────────────────────────────────────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: APP_NAME,
              applicationCategory: "BusinessApplication",
              operatingSystem: "iOS, Android, Web",
              description:
                "Hospitality operations platform for back-of-house teams. Manage functions, prep lists, rosters and service timelines.",
              offers: { "@type": "Offer", price: "0", priceCurrency: "AUD" },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "5",
                ratingCount: "1",
              },
            }),
          }}
        />

        {/* ── Critical CSS ───────────────────────────────────────────── */}
        {/*
          Inline the bare minimum so the splash renders without a FOUC.
          All Inter font loading happens via @expo-google-fonts/inter (bundled
          locally — no Google Fonts CDN request needed).
        */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
*,*::before,*::after{box-sizing:border-box}
html{height:100%;-webkit-text-size-adjust:100%}
body{margin:0;padding:0;height:100%;background:#0D1117;-webkit-font-smoothing:antialiased}
#pf-splash{
  position:fixed;inset:0;z-index:9999;
  background:#0D1117;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;
  will-change:opacity;
  transition:opacity .35s ease;
}
#pf-splash.pf-gone{opacity:0;pointer-events:none}
.pf-icon{width:72px;height:72px;margin-bottom:20px;border-radius:18px}
.pf-name{color:#F0F6FC;font-size:22px;font-weight:700;letter-spacing:-.3px;margin:0;line-height:1.2}
.pf-sub{color:#484F58;font-size:13px;margin:6px 0 0;letter-spacing:.4px;text-transform:uppercase}
            `.trim(),
          }}
        />

        <ScrollViewStyleReset />
      </head>

      <body>
        {/* Splash screen — visible immediately, dismissed once React mounts */}
        <div id="pf-splash" aria-hidden="true">
          <svg
            className="pf-icon"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{ background: "#EAB308", borderRadius: 18 }}
          >
            <rect x="20" y="64" width="60" height="11" rx="4" fill="#0D1117" opacity="0.85" />
            <path
              d="M32 64 C32 64 27 53 27 44 C27 32 36 24 46 24 C48 24 50 24.6 50 24.6 C50 24.6 52 24 54 24 C64 24 73 32 73 44 C73 53 68 64 68 64 Z"
              fill="white"
              opacity="0.95"
            />
            <ellipse cx="37" cy="37" rx="5" ry="8" fill="white" opacity="0.3" />
          </svg>
          <p className="pf-name">PrepFlows</p>
          <p className="pf-sub">Hospitality Operations</p>
        </div>

        {/* No-JS fallback — indexable content for crawlers */}
        <noscript>
          <div
            style={{
              padding: "48px 24px",
              fontFamily: "system-ui, -apple-system, sans-serif",
              background: "#0D1117",
              color: "#F0F6FC",
              minHeight: "100vh",
              textAlign: "center",
            }}
          >
            <h1 style={{ color: "#EAB308", fontSize: 32, margin: "0 0 12px" }}>
              PrepFlows
            </h1>
            <h2 style={{ color: "#8B949E", fontSize: 18, fontWeight: 400, margin: "0 0 16px" }}>
              Hospitality Operations Platform
            </h2>
            <p
              style={{
                color: "#64748B",
                maxWidth: 520,
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              {APP_DESC} Please enable JavaScript to use the app.
            </p>
          </div>
        </noscript>

        {children}

        {/* Dismiss splash once React has rendered something */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  var s=document.getElementById('pf-splash');
  if(!s)return;
  var done=false;
  function hide(){
    if(done)return;
    done=true;
    s.classList.add('pf-gone');
    setTimeout(function(){s&&s.parentNode&&s.parentNode.removeChild(s);},400);
  }
  var ob=new MutationObserver(function(){
    var r=document.getElementById('expo-root')||document.querySelector('[data-expo-root]');
    if(r&&r.childElementCount>0){hide();ob.disconnect();}
  });
  ob.observe(document.body,{childList:true,subtree:true});
  // Hard timeout: never show splash more than 8 s
  setTimeout(hide,8000);
})();
            `.trim(),
          }}
        />
      </body>
    </html>
  );
}
