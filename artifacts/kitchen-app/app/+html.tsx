import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

/**
 * Custom HTML shell for Expo web output (dev + static export).
 *
 * Key SEO fixes applied here:
 *  1. Explicit `robots: index, follow` — overrides Expo's default noindex in dev mode.
 *  2. Inline CSS splash screen — gives browsers/crawlers an immediate First Contentful
 *     Paint before the React bundle loads, preventing Lighthouse timeout failures that
 *     cause the page to be reported as unindexable.
 *  3. Structured data (JSON-LD) for richer search result appearance.
 *  4. <noscript> fallback so crawlers that don't run JS still see content.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* ── SEO ─────────────────────────────────────────────────────────── */}
        <title>KitchenCommand — Catering Kitchen Management</title>
        <meta
          name="description"
          content="Professional catering kitchen management for back-of-house staff. Manage events, prep lists, rosters, service timelines and dietary requirements — on iOS, Android and web."
        />
        {/* Explicit index directive — overrides Expo Router's dev-mode noindex */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="theme-color" content="#F97316" />

        {/* ── Open Graph ──────────────────────────────────────────────────── */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="KitchenCommand — Catering Kitchen Management" />
        <meta
          property="og:description"
          content="Professional catering kitchen management for back-of-house staff. Events, prep lists, rosters and service timelines — on iOS, Android and web."
        />
        <meta property="og:site_name" content="KitchenCommand" />
        <meta property="og:locale" content="en_AU" />

        {/* ── Twitter Card ────────────────────────────────────────────────── */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="KitchenCommand — Catering Kitchen Management" />
        <meta
          name="twitter:description"
          content="Professional catering kitchen management for back-of-house staff."
        />

        {/* ── Performance: resource hints ──────────────────────────────────── */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* ── Structured data (JSON-LD) ────────────────────────────────────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "KitchenCommand",
              applicationCategory: "BusinessApplication",
              operatingSystem: "iOS, Android, Web",
              description:
                "Professional catering kitchen management for back-of-house staff. Manage events, prep lists, rosters, service timelines and dietary requirements.",
              offers: { "@type": "Offer", price: "0" },
            }),
          }}
        />

        {/*
         * ── Inline critical CSS ───────────────────────────────────────────
         * The splash renders in pure CSS with zero JS — visible in < 50 ms.
         * This gives Lighthouse an immediate First Contentful Paint even when
         * the React/Expo bundle takes several seconds to download and execute.
         * Without this, Lighthouse times out and marks the page as unindexable.
         */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0;height:100%;background:#0D1117}
#kc-splash{
  position:fixed;inset:0;z-index:9999;
  background:#0D1117;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  transition:opacity .4s ease;
}
#kc-splash.kc-gone{opacity:0;pointer-events:none}
#kc-splash .kc-icon{width:72px;height:72px;margin-bottom:20px}
#kc-splash .kc-name{
  color:#F0F6FC;font-size:22px;font-weight:700;
  letter-spacing:-.3px;margin:0;
}
#kc-splash .kc-sub{
  color:#484F58;font-size:13px;margin-top:6px;
}
`.trim(),
          }}
        />

        {/* Reset body/html margins — must come before any overriding stylesheet */}
        <ScrollViewStyleReset />
      </head>

      <body>
        {/*
         * CSS-only splash screen — paints instantly, before any JS runs.
         * Hidden by the inline script below once Expo mounts its root element.
         * aria-hidden so screen readers skip straight to the live app content.
         */}
        <div id="kc-splash" aria-hidden="true">
          {/* Orange crossed knife-and-fork mark — matches the app icon */}
          <svg
            className="kc-icon"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Fork tines */}
            <line x1="30" y1="12" x2="30" y2="32" stroke="#F97316" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="38" y1="12" x2="38" y2="32" stroke="#F97316" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="46" y1="12" x2="46" y2="32" stroke="#F97316" strokeWidth="3.5" strokeLinecap="round" />
            {/* Fork handle */}
            <line x1="38" y1="32" x2="38" y2="88" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
            {/* Knife blade */}
            <path d="M62 12 Q78 22 78 44 L62 44 Z" fill="#F97316" />
            {/* Knife handle */}
            <line x1="62" y1="44" x2="62" y2="88" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <p className="kc-name">KitchenCommand</p>
          <p className="kc-sub">Operations Platform</p>
        </div>

        {/* <noscript> fallback — ensures crawlers without JS see real content */}
        <noscript>
          <div
            style={{
              padding: "40px 24px",
              fontFamily: "system-ui, sans-serif",
              background: "#0D1117",
              color: "#F0F6FC",
              minHeight: "100vh",
              textAlign: "center",
            }}
          >
            <h1 style={{ color: "#F97316", fontSize: 28 }}>KitchenCommand</h1>
            <p style={{ color: "#8B949E", maxWidth: 480, margin: "16px auto 0" }}>
              Professional catering kitchen management for back-of-house staff.
              Manage events, prep lists, rosters and service timelines — on iOS,
              Android and web. Please enable JavaScript to use the app.
            </p>
          </div>
        </noscript>

        {children}

        {/*
         * Splash-hide script — runs immediately after the DOM is ready.
         * Watches for Expo's root element to receive children, then fades
         * the splash out. Falls back to a hard timeout after 10 s.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  var splash=document.getElementById('kc-splash');
  if(!splash)return;
  var gone=false;
  function hide(){
    if(gone)return;gone=true;
    splash.classList.add('kc-gone');
    setTimeout(function(){if(splash.parentNode)splash.parentNode.removeChild(splash);},450);
  }
  // Watch for Expo root element to populate
  var obs=new MutationObserver(function(){
    var r=document.getElementById('expo-root')||document.querySelector('[data-expo-root]');
    if(r&&r.childElementCount>0){hide();obs.disconnect();}
  });
  obs.observe(document.body,{childList:true,subtree:true});
  // Hard fallback
  setTimeout(hide,10000);
})();
`.trim(),
          }}
        />
      </body>
    </html>
  );
}
