"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const result = await response.json() as { message?: string };
    setNotice(result.message ?? "Check your email.");
    setIsLoading(false);
  }

  return <form className="auth-fields" onSubmit={submit}><label>Email address<Input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>{notice && <p className="auth-message auth-success">{notice}</p>}<Button type="submit" disabled={isLoading}>{isLoading ? "Sending..." : "Send reset link"}</Button></form>;
}
