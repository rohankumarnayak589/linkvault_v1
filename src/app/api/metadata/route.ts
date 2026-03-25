import { NextResponse } from "next/server";
import { parse } from "node-html-parser";

// Helper: check if URL is absolute
function toAbsoluteUrl(href: string, base: string): string {
  if (!href) return "";
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  try {
    const origin = new URL(base).origin;
    return href.startsWith("/") ? `${origin}${href}` : `${origin}/${href}`;
  } catch { return href; }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  let hostname = "";
  try { hostname = new URL(url).hostname; } catch {}

  // Google Favicon API as reliable fallback
  const googleFavicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const root = parse(html);

    // Title
    const title =
      root.querySelector('meta[property="og:title"]')?.getAttribute("content") ||
      root.querySelector("title")?.innerText ||
      "";

    // Description
    const description =
      root.querySelector('meta[property="og:description"]')?.getAttribute("content") ||
      root.querySelector('meta[name="description"]')?.getAttribute("content") ||
      "";

    // Preview Image — try multiple OG sources
    let previewImage =
      root.querySelector('meta[property="og:image"]')?.getAttribute("content") ||
      root.querySelector('meta[property="og:image:url"]')?.getAttribute("content") ||
      root.querySelector('meta[name="twitter:image"]')?.getAttribute("content") ||
      root.querySelector('meta[name="twitter:image:src"]')?.getAttribute("content") ||
      "";
    if (previewImage) previewImage = toAbsoluteUrl(previewImage, url);

    // Favicon — try link tags first, then Google as fallback
    let favicon =
      root.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href") ||
      root.querySelector('link[rel="icon"][sizes]')?.getAttribute("href") ||
      root.querySelector('link[rel="icon"]')?.getAttribute("href") ||
      root.querySelector('link[rel="shortcut icon"]')?.getAttribute("href") ||
      "";
    favicon = favicon ? toAbsoluteUrl(favicon, url) : googleFavicon;

    // Smart Tags from meta keywords
    const keywordsStr =
      root.querySelector('meta[name="keywords"]')?.getAttribute("content") || "";
    let tags: string[] = [];
    if (keywordsStr) {
      tags = keywordsStr
        .split(",")
        .map((k) => k.trim().toLowerCase())
        .filter((k) => k.length > 2 && k.length < 25);
    }

    // Fallback: extract meaningful words from title+description
    if (tags.length === 0) {
      const commonWords = new Set([
        "the","and","for","with","your","from","this","that","software","platform",
        "website","blog","home","page","free","best","more","what","when","where",
        "about","learn","using","able","have","will","make","just","them",
      ]);
      const combinedText = `${title} ${description}`.toLowerCase();
      const words = [...new Set(combinedText.match(/\b[a-z]{4,15}\b/g) || [])];
      tags = words.filter((w) => !commonWords.has(w)).slice(0, 6);
    }

    return NextResponse.json({
      title: title.trim().slice(0, 200),
      description: description.trim().slice(0, 500),
      favicon,
      previewImage,
      tags: tags.slice(0, 8),
    });
  } catch (error) {
    // If fetch fails (CORS, timeout, etc.) — return at least a favicon via Google
    console.error("Metadata fetch error:", error);
    return NextResponse.json({
      title: "",
      description: "",
      favicon: googleFavicon,
      previewImage: "",
      tags: [],
    });
  }
}
