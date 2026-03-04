import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="font-semibold text-base">GM1</p>
          <p className="text-sm text-muted-foreground">
            Groups, pages, and people — together.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/pages" className="hover:text-foreground transition-colors">
            Pages
          </Link>
          <Link href="/groups" className="hover:text-foreground transition-colors">
            Groups
          </Link>
          <Link href="/login" className="hover:text-foreground transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="hover:text-foreground transition-colors">
            Sign up
          </Link>
        </nav>
      </div>
    </footer>
  );
}
