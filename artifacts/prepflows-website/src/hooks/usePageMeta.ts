import { useEffect } from "react";

interface PageMeta {
  title: string;
  description: string;
  canonical?: string;
}

/**
 * Sets document <title> and meta description for the current page.
 * Simple SPA-friendly alternative to react-helmet.
 */
export function usePageMeta({ title, description, canonical }: PageMeta) {
  useEffect(() => {
    // Title
    document.title = title;

    // Meta description
    let descEl = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (descEl) descEl.setAttribute("content", description);

    // OG title
    let ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);

    // OG description
    let ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", description);

    // Twitter title
    let twTitle = document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", title);

    // Twitter description
    let twDesc = document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute("content", description);

    // Canonical
    if (canonical) {
      let canonEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (canonEl) canonEl.setAttribute("href", canonical);
    }

    // Restore default on unmount
    return () => {
      document.title = "PrepFlows — Kitchen Operations Software for Hospitality Teams";
    };
  }, [title, description, canonical]);
}
