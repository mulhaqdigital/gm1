function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

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
  return COLORS[hashSeed(seed) % COLORS.length];
}

const DUO_ICONS = [
  "duo-icons:add-circle", "duo-icons:airplay", "duo-icons:alert-octagon",
  "duo-icons:alert-triangle", "duo-icons:align-bottom", "duo-icons:align-center",
  "duo-icons:android", "duo-icons:app", "duo-icons:app-dots", "duo-icons:apple",
  "duo-icons:approved", "duo-icons:appstore", "duo-icons:award", "duo-icons:baby-carriage",
  "duo-icons:bank", "duo-icons:battery", "duo-icons:bell", "duo-icons:bell-badge",
  "duo-icons:book", "duo-icons:book-2", "duo-icons:book-3", "duo-icons:bookmark",
  "duo-icons:box", "duo-icons:box-2", "duo-icons:bread", "duo-icons:bridge",
  "duo-icons:briefcase", "duo-icons:brush", "duo-icons:brush-2", "duo-icons:bug",
  "duo-icons:building", "duo-icons:bus", "duo-icons:cake", "duo-icons:calendar",
  "duo-icons:camera", "duo-icons:camera-square", "duo-icons:campground", "duo-icons:candle",
  "duo-icons:car", "duo-icons:certificate", "duo-icons:chart-pie", "duo-icons:check-circle",
  "duo-icons:chip", "duo-icons:clapperboard", "duo-icons:clipboard", "duo-icons:clock",
  "duo-icons:cloud-lightning", "duo-icons:cloud-snow", "duo-icons:coin-stack",
  "duo-icons:compass", "duo-icons:computer-camera", "duo-icons:computer-camera-off",
  "duo-icons:confetti", "duo-icons:credit-card", "duo-icons:currency-euro",
  "duo-icons:dashboard", "duo-icons:discount", "duo-icons:disk", "duo-icons:file",
  "duo-icons:fire", "duo-icons:folder-open", "duo-icons:folder-upload", "duo-icons:g-translate",
  "duo-icons:id-card", "duo-icons:info", "duo-icons:lamp", "duo-icons:lamp-2",
  "duo-icons:location", "duo-icons:marker", "duo-icons:menu", "duo-icons:message",
  "duo-icons:message-2", "duo-icons:message-3", "duo-icons:moon-2", "duo-icons:moon-stars",
  "duo-icons:palette", "duo-icons:rocket", "duo-icons:settings", "duo-icons:shopping-bag",
  "duo-icons:slideshow", "duo-icons:smartphone", "duo-icons:smartphone-vibration",
  "duo-icons:smartwatch", "duo-icons:sun", "duo-icons:target", "duo-icons:toggle",
  "duo-icons:translation", "duo-icons:upload-file", "duo-icons:user", "duo-icons:user-card",
  "duo-icons:world",
];

export function getGroupIcon(seed: string): string {
  return DUO_ICONS[hashSeed(seed) % DUO_ICONS.length];
}

export function getGroupGradient(seed: string): string {
  const hash = hashSeed(seed);
  const color1 = COLORS[hash % COLORS.length];
  const color2 = COLORS[(hash + 4) % COLORS.length];
  return `linear-gradient(135deg, ${color1}, ${color2})`;
}

export function getDiceBearUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}`;
}
