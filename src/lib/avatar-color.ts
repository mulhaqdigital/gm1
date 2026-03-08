// Notion-style deterministic avatar background colors
const COLORS = [
  "#4F46E5", // indigo
  "#7C3AED", // violet
  "#DB2777", // pink
  "#E11D48", // rose
  "#EA580C", // orange
  "#D97706", // amber
  "#059669", // emerald
  "#0D9488", // teal
  "#0891B2", // cyan
  "#2563EB", // blue
  "#9333EA", // purple
  "#65A30D", // lime
];

export function getAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function getDiceBearUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}`;
}
