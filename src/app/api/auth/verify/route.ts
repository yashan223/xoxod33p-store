import { NextResponse } from "next/server";
import { verifyEmail } from "@/server/auth/users";
import { enforceRateLimit } from "@/server/rate-limit";
import { getRequestBaseUrl } from "@/lib/env";

export async function GET(request: Request) {
  const limited = enforceRateLimit(request, "auth-verify", { limit: 20, windowMs: 15 * 60_000 });
  if (limited) return limited;

  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim();
  const verified = token ? await verifyEmail(token) : false;
  const baseUrl = getRequestBaseUrl(request);
  const destination = new URL(
    verified ? "/sign-in?verified=1" : "/sign-in?verified=0",
    baseUrl,
  );
  return NextResponse.redirect(destination);
}
