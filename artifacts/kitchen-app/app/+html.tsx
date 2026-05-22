import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        <title>PrepFlows — Hospitality Operations Platform</title>
        <meta name="description" content="PrepFlows is the hospitality operations platform for back-of-house teams. Manage events, prep lists, rosters, service timelines and dietary requirements — on iOS, Android and web." />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="theme-color" content="#EAB308" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="PrepFlows — Hospitality Operations Platform" />
        <meta property="og:description" content="The hospitality operations platform for back-of-house teams. Events, prep lists, rosters and service timelines — on iOS, Android and web." />
        <meta property="og:site_name" content="PrepFlows" />
        <meta property="og:locale" content="en_AU" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="PrepFlows — Hospitality Operations Platform" />
        <meta name="twitter:description" content="The hospitality operations platform for back-of-house teams." />

        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "PrepFlows",
              applicationCategory: "BusinessApplication",
              operatingSystem: "iOS, Android, Web",
              description: "The hospitality operations platform for back-of-house teams. Manage events, prep lists, rosters, service timelines and dietary requirements.",
              offers: { "@type": "Offer", price: "0" },
            }),
          }}
        />

        <style
          dangerouslySetInnerHTML={{
            __html: `
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0;height:100%;background:#0D1117}
#pf-splash{
  position:fixed;inset:0;z-index:9999;
  background:#0D1117;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  transition:opacity .4s ease;
}
#pf-splash.pf-gone{opacity:0;pointer-events:none}
#pf-splash .pf-icon{width:72px;height:72px;margin-bottom:20px}
#pf-splash .pf-name{color:#F0F6FC;font-size:22px;font-weight:700;letter-spacing:-.3px;margin:0}
#pf-splash .pf-sub{color:#484F58;font-size:13px;margin-top:6px}
`.trim(),
          }}
        />

        <ScrollViewStyleReset />
      </head>

      <body>
        <div id="pf-splash" aria-hidden="true">
          <svg className="pf-icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="20" y="64" width="60" height="11" rx="4" fill="#EAB308" />
            <path d="M32 64 C32 64 27 53 27 44 C27 32 36 24 46 24 C48 24 50 24.6 50 24.6 C50 24.6 52 24 54 24 C64 24 73 32 73 44 C73 53 68 64 68 64 Z" fill="white" />
            <ellipse cx="37" cy="37" rx="5" ry="8" fill="white" opacity="0.25" />
          </svg>
          <p className="pf-name">PrepFlows</p>
          <p className="pf-sub">Hospitality Operations Platform</p>
        </div>

        <noscript>
          <div style={{ padding: "40px 24px", fontFamily: "system-ui, sans-serif", background: "#0D1117", color: "#F0F6FC", minHeight: "100vh", textAlign: "center" }}>
            <h1 style={{ color: "#EAB308", fontSize: 28 }}>PrepFlows</h1>
            <p style={{ color: "#8B949E", maxWidth: 480, margin: "16px auto 0" }}>
              The hospitality operations platform for back-of-house teams. Manage events, prep lists, rosters and service timelines — on iOS, Android and web. Please enable JavaScript to use the app.
            </p>
          </div>
        </noscript>

        {children}

        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  var splash=document.getElementById('pf-splash');
  if(!splash)return;
  var gone=false;
  function hide(){if(gone)return;gone=true;splash.classList.add('pf-gone');setTimeout(function(){if(splash.parentNode)splash.parentNode.removeChild(splash);},450);}
  var obs=new MutationObserver(function(){var r=document.getElementById('expo-root')||document.querySelector('[data-expo-root]');if(r&&r.childElementCount>0){hide();obs.disconnect();}});
  obs.observe(document.body,{childList:true,subtree:true});
  setTimeout(hide,10000);
})();
`.trim(),
          }}
        />
      </body>
    </html>
  );
}
