import { NextResponse } from "next/server";
import { parse } from "node-html-parser";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LinkVaultBot/1.0;)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const html = await response.text();
    const root = parse(html);

    // Basic Metadata
    const title = 
      root.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      root.querySelector('title')?.innerText ||
      "";

    const description = 
      root.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
      root.querySelector('meta[name="description"]')?.getAttribute('content') ||
      "";

    let favicon = 
      root.querySelector('link[rel="icon"]')?.getAttribute('href') ||
      root.querySelector('link[rel="shortcut icon"]')?.getAttribute('href') ||
      "";

    // Handle relative favicons
    if (favicon && !favicon.startsWith('http')) {
      const urlObj = new URL(url);
      favicon = `${urlObj.origin}${favicon.startsWith('/') ? '' : '/'}${favicon}`;
    } else if (!favicon) {
      const urlObj = new URL(url);
      favicon = `${urlObj.origin}/favicon.ico`;
    }

    // Smart Tagging (Keywords)
    const keywordsStr = 
      root.querySelector('meta[name="keywords"]')?.getAttribute('content') || "";
    
    let tags: string[] = [];
    if (keywordsStr) {
      tags = keywordsStr.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 2 && k.length < 20);
    }

    // If no keywords, try to extract from title/description
    if (tags.length === 0) {
      const combinedText = `${title} ${description}`.toLowerCase();
      const commonWords = ['the', 'and', 'for', 'with', 'your', 'from', 'this', 'that', 'software', 'platform', 'website'];
      const words = combinedText.match(/\b\w{4,15}\b/g) || [];
      tags = [...new Set(words)]
        .filter(w => !commonWords.includes(w))
        .slice(0, 5);
    }

    return NextResponse.json({
      title: title.trim(),
      description: description.trim(),
      favicon,
      tags: tags.slice(0, 8)
    });

  } catch (error) {
    console.error("Metadata fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 });
  }
}
