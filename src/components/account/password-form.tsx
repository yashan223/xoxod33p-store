"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PasswordForm() {
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const newPassword = String(formData.get("newPassword") ?? "");
    if (newPassword !== String(formData.get("confirmPassword") ?? ""))
      return setStatus("New passwords do not match.");
    setIsSaving(true);
    setStatus("");
    const response = await fetch("/api/profile/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: formData.get("currentPassword"), newPassword }),
    });
    const result = (await response.json()) as { error?: string };
    setStatus(response.ok ? "Password updated." : (result.error ?? "Unable to update password."));
    if (response.ok) form.reset();
    setIsSaving(false);
  }

  return (
    <form className="profile-form password-form" onSubmit={changePassword}>
      <label>
        Current password
        <div className="password-field">
          <Input
            name="currentPassword"
            type={showCurrent ? "text" : "password"}
            autoComplete="current-password"
            required
          />
          <button
            className="password-toggle"
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            aria-label={showCurrent ? "Hide password" : "Show password"}
          >
            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </label>
      <label>
        New password
        <div className="password-field">
          <Input
            name="newPassword"
            type={showNew ? "text" : "password"}
            minLength={8}
            autoComplete="new-password"
            required
          />
          <button
            className="password-toggle"
            type="button"
            onClick={() => setShowNew((v) => !v)}
            aria-label={showNew ? "Hide password" : "Show password"}
          >
            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </label>
      <label>
        Confirm new password
        <div className="password-field">
          <Input
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            minLength={8}
            autoComplete="new-password"
            required
          />
          <button
            className="password-toggle"
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </label>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Updating..." : "Change password"}
      </Button>
      {status && <p className="profile-form-status">{status}</p>}
    </form>
  );
}
