import { NextResponse } from "next/server";
import { verifyEmail } from "@/server/auth/users";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const verified = url.searchParams.get("token") ? await verifyEmail(url.searchParams.get("token") as string) : false;
  const destination = new URL(verified ? "/sign-in?verified=1" : "/sign-in?verified=0", request.url);
  return NextResponse.redirect(destination);
}
