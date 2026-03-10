"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonProps {
  title: string;
  description?: string | null;
  className?: string;
  variant?: "outline" | "ghost" | "default" | "secondary";
  size?: "sm" | "default" | "lg" | "icon";
}

export function ShareButton({
  title,
  description,
  className,
  variant = "outline",
  size = "sm",
}: ShareButtonProps) {
  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        const text = [title, url, description].filter(Boolean).join("\n");
        await navigator.share({
          text,
        });
        return;
      } catch {
        // User cancelled or API unavailable — fall through
      }
    }

    await navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleShare}>
      <Share2 className="h-4 w-4 mr-1.5" />
      Share
    </Button>
  );
}
