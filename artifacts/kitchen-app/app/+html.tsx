import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

/**
 * Custom HTML shell for Expo web output (dev + static export).
 * Expo Router uses this file instead of its default template, which injects
 * <meta name="robots" content="noindex"> in development mode.
 * https://docs.expo.dev/router/reference/static-rendering/#root-html
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

        {/* SEO */}
        <title>KitchenCommand — Catering Kitchen Management</title>
        <meta
          name="description"
          content="Professional catering kitchen management for back-of-house staff. Manage events, prep lists, rosters, service timelines and dietary requirements."
        />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#F97316" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="KitchenCommand — Catering Kitchen Management"
        />
        <meta
          property="og:description"
          content="Professional catering kitchen management for back-of-house staff. Events, prep lists, rosters and service timelines — on iOS, Android and web."
        />
        <meta property="og:site_name" content="KitchenCommand" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content="KitchenCommand — Catering Kitchen Management"
        />
        <meta
          name="twitter:description"
          content="Professional catering kitchen management for back-of-house staff."
        />

        {/*
         * Disable body/html default margins so the app fills the viewport.
         * Must be included before any stylesheet that may override it.
         */}
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
