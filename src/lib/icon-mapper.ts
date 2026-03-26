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
    emoji: "🍦",
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
    name: "github-light",
    label: "GitHub Light",
    emoji: "🏢",
    isDark: false,
    preview: "#0969DA",
    colors: {
      background: "#FFFFFF",
      foreground: "#24292F",
      card: "#F6F8FA",
      cardForeground: "#24292F",
      primary: "#0969DA",
      primaryForeground: "#FFFFFF",
      secondary: "#F3F4F6",
      secondaryForeground: "#57606A",
      muted: "#F3F4F6",
      mutedForeground: "#6E7781",
      accent: "#0969DA15",
      accentForeground: "#24292F",
      border: "rgba(31, 35, 40, 0.15)",
      input: "rgba(31, 35, 40, 0.1)",
      ring: "#0969DA",
      sidebar: "#F6F8FA",
      sidebarForeground: "#24292F",
      sidebarBorder: "rgba(31, 35, 40, 0.1)",
      sidebarActive: "rgba(9, 105, 218, 0.1)",
    },
  },
  {
    name: "vscode-dark",
    label: "VS Code Dark",
    emoji: "💻",
    isDark: true,
    preview: "#007ACC",
    colors: {
      background: "#1E1E1E",
      foreground: "#D4D4D4",
      card: "#252526",
      cardForeground: "#D4D4D4",
      primary: "#007ACC",
      primaryForeground: "#FFFFFF",
      secondary: "#2D2D2D",
      secondaryForeground: "#CCCCCC",
      muted: "#2D2D2D",
      mutedForeground: "#858585",
      accent: "#37373D",
      accentForeground: "#FFFFFF",
      border: "rgba(255, 255, 255, 0.1)",
      input: "rgba(255, 255, 255, 0.05)",
      ring: "#007ACC",
      sidebar: "#252526",
      sidebarForeground: "#CCCCCC",
      sidebarBorder: "rgba(0, 0, 0, 0.2)",
      sidebarActive: "rgba(0, 122, 204, 0.3)",
    },
  },
  {
    name: "dracula",
    label: "Dracula",
    emoji: "🧛",
    isDark: true,
    preview: "#BD93F9",
    colors: {
      background: "#282A36",
      foreground: "#F8F8F2",
      card: "#44475A",
      cardForeground: "#F8F8F2",
      primary: "#BD93F9",
      primaryForeground: "#282A36",
      secondary: "#6272A4",
      secondaryForeground: "#F8F8F2",
      muted: "#44475A",
      mutedForeground: "#6272A4",
      accent: "#FF79C6",
      accentForeground: "#282A36",
      border: "rgba(189, 147, 249, 0.2)",
      input: "rgba(189, 147, 249, 0.1)",
      ring: "#BD93F9",
      sidebar: "#21222C",
      sidebarForeground: "#F8F8F2",
      sidebarBorder: "rgba(189, 147, 249, 0.1)",
      sidebarActive: "rgba(189, 147, 249, 0.15)",
    },
  },
  {
    name: "synthwave-84",
    label: "Synthwave '84",
    emoji: "🌆",
    isDark: true,
    preview: "#FF7EDB",
    colors: {
      background: "#262335",
      foreground: "#FFFFFF",
      card: "#34294F",
      cardForeground: "#FFFFFF",
      primary: "#FF7EDB",
      primaryForeground: "#262335",
      secondary: "#241B2F",
      secondaryForeground: "#72F1B8",
      muted: "#34294F",
      mutedForeground: "#848BB2",
      accent: "#36F9F6",
      accentForeground: "#262335",
      border: "rgba(255, 126, 219, 0.3)",
      input: "rgba(255, 126, 219, 0.15)",
      ring: "#FF7EDB",
      sidebar: "#241B2F",
      sidebarForeground: "#FFFFFF",
      sidebarBorder: "rgba(255, 126, 219, 0.2)",
      sidebarActive: "rgba(255, 126, 219, 0.2)",
    },
  },
];

/**
 * Apply a theme by setting CSS custom properties on <html>
 */
export function applyTheme(themeName: ThemeName, storageKey: string = "linkvault-dashboard-theme"): void {
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

  localStorage.setItem(storageKey, themeName);
}

/**
 * Get saved theme from localStorage
 */
export function getSavedTheme(storageKey: string = "linkvault-dashboard-theme"): ThemeName {
  if (typeof window === "undefined") return "ivory-warm";
  return (localStorage.getItem(storageKey) as ThemeName) || "ivory-warm";
}
