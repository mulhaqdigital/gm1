"use client";

import { Icon } from "@iconify/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getGroupIcon, getAvatarColor } from "@/lib/avatar-color";
import { cn } from "@/lib/utils";

interface GroupAvatarProps {
  name: string;
  logoUrl?: string | null;
  className?: string;
  iconClassName?: string;
  rounded?: "md" | "xl";
}

export function GroupAvatar({ name, logoUrl, className, iconClassName, rounded = "md" }: GroupAvatarProps) {
  const roundedClass = rounded === "xl" ? "rounded-xl" : "rounded-md";

  if (logoUrl) {
    return (
      <Avatar className={cn(`${roundedClass}`, className)}>
        <AvatarImage src={logoUrl} />
        <AvatarFallback className={cn(roundedClass, "text-lg font-semibold")}>
          {name[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <div
      className={cn("text-white flex items-center justify-center shrink-0", roundedClass, className)}
      style={{ background: getAvatarColor(name) }}
    >
      <Icon icon={getGroupIcon(name)} className={cn("h-1/2 w-1/2", iconClassName)} />
    </div>
  );
}
