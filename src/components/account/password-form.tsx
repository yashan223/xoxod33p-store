"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PasswordForm() {
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const newPassword = String(formData.get("newPassword") ?? "");
    if (newPassword !== String(formData.get("confirmPassword") ?? "")) return setStatus("New passwords do not match.");
    setIsSaving(true);
    setStatus("");
    const response = await fetch("/api/profile/password", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: formData.get("currentPassword"), newPassword }) });
    const result = await response.json() as { error?: string };
    setStatus(response.ok ? "Password updated." : result.error ?? "Unable to update password.");
    if (response.ok) form.reset();
    setIsSaving(false);
  }

  return <form className="profile-form password-form" onSubmit={changePassword}><label>Current password<Input name="currentPassword" type="password" autoComplete="current-password" required /></label><label>New password<Input name="newPassword" type="password" minLength={8} autoComplete="new-password" required /></label><label>Confirm new password<Input name="confirmPassword" type="password" minLength={8} autoComplete="new-password" required /></label><Button type="submit" disabled={isSaving}>{isSaving ? "Updating..." : "Change password"}</Button>{status && <p className="profile-form-status">{status}</p>}</form>;
}