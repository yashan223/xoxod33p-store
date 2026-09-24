"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) return setError("Passwords do not match.");
    setIsLoading(true);
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const result = (await response.json()) as { error?: string; message?: string };
    if (!response.ok) setError(result.error ?? "Unable to reset password.");
    else router.replace("/sign-in?reset=1");
    setIsLoading(false);
  }

  return (
    <form className="auth-fields" onSubmit={submit}>
      <label>
        New password
        <Input
          type="password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <label>
        Confirm password
        <Input
          type="password"
          minLength={8}
          required
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
        />
      </label>
      {error && <p className="auth-message auth-error">{error}</p>}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
