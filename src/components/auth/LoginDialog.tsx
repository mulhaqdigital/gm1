"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "./GoogleButton";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  next?: string;
}

export function LoginDialog({ open, onOpenChange, next = "/dashboard" }: LoginDialogProps) {
  const router = useRouter();
  const [view, setView] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  function handleClose(val: boolean) {
    if (!val) {
      // Reset all state on close
      setView("login");
      setEmail("");
      setPassword("");
      setError("");
      setLoading(false);
      setResetSent(false);
    }
    onOpenChange(val);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      handleClose(false);
      router.push(next);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/profile`,
    });
    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden gap-0">
        <VisuallyHidden><DialogTitle>Sign in</DialogTitle></VisuallyHidden>

        <div className="px-8 pt-8 pb-7 space-y-6">
          {view === "login" ? (
            <>
              {/* Header */}
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">GM1</p>
                <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
                <p className="text-sm text-muted-foreground">Sign in to continue</p>
              </div>

              {/* Google first */}
              <GoogleButton next={next} />

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or continue with email</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Email/password form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-xs font-medium">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    required
                    className=""
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-xs font-medium">Password</Label>
                    <button
                      type="button"
                      onClick={() => { setView("forgot"); setError(""); }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    required
                    className=""
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in…</> : "Sign in"}
                </Button>
              </form>

              {/* Footer */}
              <p className="text-xs text-muted-foreground text-center">
                No account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-foreground hover:underline"
                  onClick={() => handleClose(false)}
                >
                  Sign up free
                </Link>
              </p>
            </>
          ) : (
            <>
              {/* Forgot password view */}
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">GM1</p>
                <h2 className="text-2xl font-bold tracking-tight">Reset password</h2>
                <p className="text-sm text-muted-foreground">We'll send you a link to reset it.</p>
              </div>

              {resetSent ? (
                <div className="space-y-4">
                  <div className="text-sm bg-muted px-4 py-3 rounded-lg text-muted-foreground">
                    Check <span className="font-medium text-foreground">{email}</span> for a reset link.
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => { setView("login"); setResetSent(false); }}>
                    Back to sign in
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="reset-email" className="text-xs font-medium">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      required
                      className=""
                      autoFocus
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</> : "Send reset link"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => { setView("login"); setError(""); }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to sign in
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
