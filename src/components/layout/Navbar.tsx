"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getAvatarColor } from "@/lib/avatar-color";
import { Menu } from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/groups", label: "Groups" },
  { href: "/pages", label: "Pages" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link href="/" className="font-bold text-lg tracking-tight shrink-0">GM1</Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-4 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                pathname.startsWith(link.href) ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex-1 md:hidden" />

        {/* Desktop user menu */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.picture_url} />
                    <AvatarFallback className="text-white text-xs font-semibold" style={{ background: getAvatarColor(user.email ?? user.id) }}>
                      {user.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                  <Link href="/" className="font-bold text-lg tracking-tight" onClick={() => setMobileOpen(false)}>
                    GM1
                  </Link>
                </div>
                <nav className="flex flex-col p-4 gap-1 flex-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent ${
                        pathname.startsWith(link.href) ? "bg-accent text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="p-4 border-t">
                  {user ? (
                    <div className="space-y-2">
                      <Link
                        href="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent"
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={user.user_metadata?.picture_url} />
                          <AvatarFallback className="text-white text-xs" style={{ background: getAvatarColor(user.email ?? user.id) }}>
                            {user.email?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{user.email}</span>
                      </Link>
                      <Button variant="destructive" size="sm" className="w-full" onClick={handleSignOut}>
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href="/login" onClick={() => setMobileOpen(false)}>Log in</Link>
                      </Button>
                      <Button size="sm" className="w-full" asChild>
                        <Link href="/signup" onClick={() => setMobileOpen(false)}>Sign up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
