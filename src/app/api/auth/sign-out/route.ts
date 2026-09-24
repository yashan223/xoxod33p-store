import { NextResponse } from "next/server";
import { clearSession } from "@/server/auth/session";
import { getRequestBaseUrl } from "@/lib/env";

export async function POST(request: Request) {
  await clearSession();
  const baseUrl = getRequestBaseUrl(request);
  return NextResponse.redirect(new URL("/", baseUrl), 303);
}
