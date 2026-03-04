import { getAvatarColor } from "@/lib/avatar-color";

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

function getGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const [from, to] = GRADIENTS[Math.abs(hash) % GRADIENTS.length];
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
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
      <span
        className="text-white font-bold select-none"
        style={{ fontSize: "clamp(2rem, 40%, 5rem)", opacity: 0.85, textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
      >
        {title[0]?.toUpperCase()}
      </span>
    </div>
  );
}
