import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Handles Supabase email confirmation redirects
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // On Vercel, request.url origin is localhost — use forwarded host or env var instead
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const siteOrigin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : appUrl ?? origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${siteOrigin}${next}`);
    }
  }

  return NextResponse.redirect(`${siteOrigin}/login?error=auth_callback_failed`);
}
