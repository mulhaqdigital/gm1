import { Icon } from "@iconify/react";

const GRADIENTS = [
  ["#f093fb", "#f5576c"],
  ["#4facfe", "#00f2fe"],
  ["#43e97b", "#38f9d7"],
  ["#fa709a", "#fee140"],
  ["#a18cd1", "#fbc2eb"],
  ["#667eea", "#764ba2"],
  ["#f6d365", "#fda085"],
  ["#96fbc4", "#f9f586"],
  ["#fbc2eb", "#a6c1ee"],
  ["#fddb92", "#d1fdff"],
];

const ICONS = [
  "line-md:document-list",
  "line-md:document",
  "line-md:document-code",
  "line-md:document-report",
  "line-md:file-document",
  "line-md:text-box",
  "line-md:text-box-multiple",
  "line-md:file",
  "line-md:file-search",
  "line-md:image",
  "line-md:file-plus",
  "line-md:file-export",
  "line-md:file-import",
];

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = seed.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h);
}

function getGradient(seed: string): string {
  const [from, to] = GRADIENTS[hash(seed) % GRADIENTS.length];
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}

function getIcon(seed: string): string {
  return ICONS[hash(seed + "icon") % ICONS.length];
}

interface PageCoverProps {
  title: string;
  className?: string;
}

export function PageCover({ title, className }: PageCoverProps) {
  return (
    <div
      className={className}
      style={{ background: getGradient(title) }}
    >
      <Icon
        icon={getIcon(title)}
        className="text-white select-none"
        style={{ fontSize: "clamp(2rem, 40%, 5rem)", opacity: 0.85, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))" }}
      />
    </div>
  );
}
