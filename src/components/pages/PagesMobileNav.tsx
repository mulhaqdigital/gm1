"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PanelLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PagesSidebar, type SidebarPage } from "./PagesSidebar";

export function PagesMobileNav({ tree }: { tree: SidebarPage[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close sheet when the user navigates to a new page
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <PanelLeft className="h-4 w-4" />
          Pages
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-6 pt-10">
        <PagesSidebar tree={tree} />
      </SheetContent>
    </Sheet>
  );
}
