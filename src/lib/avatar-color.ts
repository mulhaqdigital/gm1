// Notion-style deterministic avatar background colors
const COLORS = [
  "#E03E3E",
  "#D9730D",
  "#0F7B6C",
  "#0B6E99",
  "#6940A5",
  "#AD1A72",
  "#4D4D4D",
  "#2F6B4E",
  "#C4692A",
  "#2383E2",
];

export function getAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}
