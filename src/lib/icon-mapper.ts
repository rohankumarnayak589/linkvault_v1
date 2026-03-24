// Smart icon and color assignment for collections
import type { ThemeName } from "./types";

// ===== ICON MAPPER =====
// Maps keywords in collection names to relevant emojis

const KEYWORD_ICON_MAP: Record<string, string> = {
  // Tech
  development: "💻", dev: "💻", code: "💻", coding: "💻", programming: "💻",
  frontend: "⚛️", react: "⚛️", vue: "⚛️", angular: "⚛️",
  backend: "🔧", server: "🔧", api: "🔧",
  devops: "☁️", cloud: "☁️", aws: "☁️", docker: "☁️",
  ai: "🤖", "machine learning": "🤖", ml: "🤖", artificial: "🤖",
  data: "📊", analytics: "📊", statistics: "📊",
  security: "🔒", cyber: "🔒", privacy: "🔒",
  mobile: "📱", ios: "📱", android: "📱",
  game: "🎮", gaming: "🎮", games: "🎮",
  github: "🐙", git: "🐙",
  database: "🗄️", sql: "🗄️", mongo: "🗄️",

  // Creative
  design: "🎨", ui: "🎨", ux: "🎨", figma: "🎨", graphic: "🎨",
  photo: "📷", photography: "📷", camera: "📷", image: "📷",
  video: "🎬", movie: "🎬", movies: "🎬", film: "🎬", cinema: "🎬", youtube: "🎬",
  music: "🎵", audio: "🎵", podcast: "🎵", spotify: "🎵", song: "🎵",
  art: "🖼️", illustration: "🖼️", drawing: "🖼️",
  writing: "✍️", blog: "✍️", blogging: "✍️", content: "✍️",
  animation: "🎞️", motion: "🎞️",

  // Learning
  education: "🎓", learning: "🎓", course: "🎓", tutorial: "🎓", study: "🎓",
  reading: "📖", book: "📖", books: "📖", ebook: "📖", library: "📖",
  research: "🔬", science: "🔬", academic: "🔬",
  documentation: "📄", docs: "📄", reference: "📄", wiki: "📄",
  news: "📰", article: "📰", articles: "📰", press: "📰",

  // Lifestyle
  food: "🍕", recipe: "🍕", cooking: "🍕", restaurant: "🍕",
  travel: "✈️", trip: "✈️", vacation: "✈️", destination: "✈️",
  health: "💪", fitness: "💪", workout: "💪", exercise: "💪",
  shopping: "🛒", store: "🛒", buy: "🛒", ecommerce: "🛒",
  finance: "💰", money: "💰", invest: "💰", banking: "💰", crypto: "💰",
  sport: "⚽", sports: "⚽", football: "⚽",
  anime: "🍥", manga: "🍥",

  // Work
  work: "💼", business: "💼", startup: "💼", project: "💼",
  productivity: "⚡", tools: "🛠️", utility: "🛠️",
  social: "💬", chat: "💬", community: "💬", forum: "💬",
  email: "📧", newsletter: "📧",
  marketing: "📢", seo: "📢", ads: "📢",
  inspiration: "✨", ideas: "✨", creative: "✨",
  personal: "🏠", home: "🏠",

  // Default/Other
  archive: "🗃️", trash: "🗑️", inbox: "📥", misc: "📦", other: "📦",
};

// Pastel colors for collection cards
const PASTEL_COLORS = [
  "#FDE8E0", // warm peach
  "#DBEAFE", // light blue
  "#D1FAE5", // mint green
  "#EDE9FE", // soft lavender
  "#FEF3C7", // light yellow
  "#FCE7F3", // light pink
  "#CCFBF1", // soft teal
  "#FEE2E2", // soft rose
  "#E0E7FF", // periwinkle
  "#D5F5F6", // aqua
  "#FFF7ED", // cream orange
  "#F0FDF4", // pale green
];

/**
 * Get a relevant emoji icon for a collection name.
 * Matches keywords in the name against the icon map.
 */
export function getCollectionIcon(name: string): string {
  const lower = name.toLowerCase().trim();
  // Direct match first
  if (KEYWORD_ICON_MAP[lower]) return KEYWORD_ICON_MAP[lower];
  // Partial keyword match
  for (const [keyword, icon] of Object.entries(KEYWORD_ICON_MAP)) {
    if (lower.includes(keyword)) return icon;
  }
  // Fallback
  return "📁";
}

/**
 * Get a unique pastel color for a collection, based on its name hash.
 */
export function getCollectionColor(name: string, index?: number): string {
  if (index !== undefined) {
    return PASTEL_COLORS[index % PASTEL_COLORS.length];
  }
  const hash = name
    .split("")
    .reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  return PASTEL_COLORS[Math.abs(hash) % PASTEL_COLORS.length];
}

// ===== THEME DEFINITIONS =====

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  emoji: string;
  isDark: boolean;
  preview: string; // Preview accent color for the picker
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    border: string;
    input: string;
    ring: string;
    sidebar: string;
    sidebarForeground: string;
    sidebarBorder: string;
    sidebarActive: string;
  };
}

export const THEMES: ThemeConfig[] = [
  {
    name: "ivory-warm",
    label: "Ivory Warm",
    emoji: "🌅",
    isDark: false,
    preview: "#E16A3D",
    colors: {
      background: "#FAF8F5",
      foreground: "#1C1917",
      card: "#FFFFFF",
      cardForeground: "#1C1917",
      primary: "#E16A3D",
      primaryForeground: "#FFFFFF",
      secondary: "#F5F0EB",
      secondaryForeground: "#57534E",
      muted: "#F5F0EB",
      mutedForeground: "#78716C",
      accent: "#FFF1EB",
      accentForeground: "#1C1917",
      border: "rgba(0, 0, 0, 0.08)",
      input: "rgba(0, 0, 0, 0.06)",
      ring: "#E16A3D",
      sidebar: "#FFFFFF",
      sidebarForeground: "#1C1917",
      sidebarBorder: "rgba(0, 0, 0, 0.06)",
      sidebarActive: "rgba(225, 106, 61, 0.1)",
    },
  },
  {
    name: "ocean-breeze",
    label: "Ocean Breeze",
    emoji: "🌊",
    isDark: false,
    preview: "#0EA5E9",
    colors: {
      background: "#F0F7FA",
      foreground: "#0C4A6E",
      card: "#FFFFFF",
      cardForeground: "#0C4A6E",
      primary: "#0EA5E9",
      primaryForeground: "#FFFFFF",
      secondary: "#E0F2FE",
      secondaryForeground: "#0369A1",
      muted: "#E0F2FE",
      mutedForeground: "#64748B",
      accent: "#E0F2FE",
      accentForeground: "#0C4A6E",
      border: "rgba(14, 165, 233, 0.12)",
      input: "rgba(14, 165, 233, 0.08)",
      ring: "#0EA5E9",
      sidebar: "#FFFFFF",
      sidebarForeground: "#0C4A6E",
      sidebarBorder: "rgba(14, 165, 233, 0.08)",
      sidebarActive: "rgba(14, 165, 233, 0.1)",
    },
  },
  {
    name: "forest-dew",
    label: "Forest Dew",
    emoji: "🌿",
    isDark: false,
    preview: "#22C55E",
    colors: {
      background: "#F2F7F2",
      foreground: "#14532D",
      card: "#FFFFFF",
      cardForeground: "#14532D",
      primary: "#22C55E",
      primaryForeground: "#FFFFFF",
      secondary: "#DCFCE7",
      secondaryForeground: "#166534",
      muted: "#DCFCE7",
      mutedForeground: "#6B7280",
      accent: "#DCFCE7",
      accentForeground: "#14532D",
      border: "rgba(34, 197, 94, 0.12)",
      input: "rgba(34, 197, 94, 0.08)",
      ring: "#22C55E",
      sidebar: "#FFFFFF",
      sidebarForeground: "#14532D",
      sidebarBorder: "rgba(34, 197, 94, 0.08)",
      sidebarActive: "rgba(34, 197, 94, 0.1)",
    },
  },
  {
    name: "midnight",
    label: "Midnight",
    emoji: "🌙",
    isDark: true,
    preview: "#F59E0B",
    colors: {
      background: "#0F0F1A",
      foreground: "#E5E5E5",
      card: "#1A1A2E",
      cardForeground: "#E5E5E5",
      primary: "#F59E0B",
      primaryForeground: "#000000",
      secondary: "#252540",
      secondaryForeground: "#A3A3A3",
      muted: "#252540",
      mutedForeground: "#737373",
      accent: "#252540",
      accentForeground: "#E5E5E5",
      border: "rgba(245, 158, 11, 0.12)",
      input: "rgba(245, 158, 11, 0.08)",
      ring: "#F59E0B",
      sidebar: "#121225",
      sidebarForeground: "#E5E5E5",
      sidebarBorder: "rgba(245, 158, 11, 0.08)",
      sidebarActive: "rgba(245, 158, 11, 0.12)",
    },
  },
  {
    name: "lavender-haze",
    label: "Lavender Haze",
    emoji: "💜",
    isDark: false,
    preview: "#8B5CF6",
    colors: {
      background: "#F5F0FF",
      foreground: "#2E1065",
      card: "#FFFFFF",
      cardForeground: "#2E1065",
      primary: "#8B5CF6",
      primaryForeground: "#FFFFFF",
      secondary: "#EDE9FE",
      secondaryForeground: "#5B21B6",
      muted: "#EDE9FE",
      mutedForeground: "#6B7280",
      accent: "#EDE9FE",
      accentForeground: "#2E1065",
      border: "rgba(139, 92, 246, 0.12)",
      input: "rgba(139, 92, 246, 0.08)",
      ring: "#8B5CF6",
      sidebar: "#FFFFFF",
      sidebarForeground: "#2E1065",
      sidebarBorder: "rgba(139, 92, 246, 0.08)",
      sidebarActive: "rgba(139, 92, 246, 0.1)",
    },
  },
  {
    name: "sunset-glow",
    label: "Sunset Glow",
    emoji: "🌇",
    isDark: false,
    preview: "#F97316",
    colors: {
      background: "#FFF5F0",
      foreground: "#431407",
      card: "#FFFFFF",
      cardForeground: "#431407",
      primary: "#F97316",
      primaryForeground: "#FFFFFF",
      secondary: "#FFF7ED",
      secondaryForeground: "#9A3412",
      muted: "#FFF7ED",
      mutedForeground: "#78716C",
      accent: "#FFF7ED",
      accentForeground: "#431407",
      border: "rgba(249, 115, 22, 0.12)",
      input: "rgba(249, 115, 22, 0.08)",
      ring: "#F97316",
      sidebar: "#FFFFFF",
      sidebarForeground: "#431407",
      sidebarBorder: "rgba(249, 115, 22, 0.08)",
      sidebarActive: "rgba(249, 115, 22, 0.1)",
    },
  },
];

/**
 * Apply a theme by setting CSS custom properties on <html>
 */
export function applyTheme(themeName: ThemeName): void {
  const theme = THEMES.find((t) => t.name === themeName);
  if (!theme) return;

  const root = document.documentElement;
  const c = theme.colors;

  root.style.setProperty("--background", c.background);
  root.style.setProperty("--foreground", c.foreground);
  root.style.setProperty("--card", c.card);
  root.style.setProperty("--card-foreground", c.cardForeground);
  root.style.setProperty("--primary", c.primary);
  root.style.setProperty("--primary-foreground", c.primaryForeground);
  root.style.setProperty("--secondary", c.secondary);
  root.style.setProperty("--secondary-foreground", c.secondaryForeground);
  root.style.setProperty("--muted", c.muted);
  root.style.setProperty("--muted-foreground", c.mutedForeground);
  root.style.setProperty("--accent", c.accent);
  root.style.setProperty("--accent-foreground", c.accentForeground);
  root.style.setProperty("--border", c.border);
  root.style.setProperty("--input", c.input);
  root.style.setProperty("--ring", c.ring);
  root.style.setProperty("--sidebar", c.sidebar);
  root.style.setProperty("--sidebar-foreground", c.sidebarForeground);
  root.style.setProperty("--sidebar-border", c.sidebarBorder);
  root.style.setProperty("--sidebar-active", c.sidebarActive);
  root.style.setProperty("--popover", c.card);
  root.style.setProperty("--popover-foreground", c.cardForeground);
  root.style.setProperty("--destructive", "#EF4444");

  // Set data attribute for conditional CSS
  root.setAttribute("data-theme", themeName);
  if (theme.isDark) {
    root.classList.add("dark-theme");
  } else {
    root.classList.remove("dark-theme");
  }

  localStorage.setItem("linkvault-theme", themeName);
}

/**
 * Get saved theme from localStorage, default to ivory-warm
 */
export function getSavedTheme(): ThemeName {
  if (typeof window === "undefined") return "ivory-warm";
  return (localStorage.getItem("linkvault-theme") as ThemeName) || "ivory-warm";
}
