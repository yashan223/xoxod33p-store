"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthFormProps = { mode: "sign-in" | "sign-up" };

type ApiResponse = { error?: string; message?: string; code?: string; redirectTo?: string };

export function AuthForm({ mode }: AuthFormProps) {
  const isSignUp = mode === "sign-up";
  const [firstName, setFirstName] = useState("");
  const [country, setCountry] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (isSignUp) return;
    const verificationState = new URLSearchParams(window.location.search).get("verified");
    const resetState = new URLSearchParams(window.location.search).get("reset");
    if (verificationState === "1") setNotice("Email verified. You can sign in now.");
    if (verificationState === "0") setError("This verification link is invalid or has expired.");
    if (resetState === "1") setNotice("Password updated. You can sign in now.");
  }, [isSignUp]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setCanResend(false);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, country, acceptedTerms, email, password, rememberMe, redirectTo: new URLSearchParams(window.location.search).get("redirect_url") }),
      });
      const result = await response.json() as ApiResponse;
      if (!response.ok) {
        setError(result.error ?? "Something went wrong.");
        setCanResend(result.code === "EMAIL_NOT_VERIFIED");
        return;
      }
      if (isSignUp) setNotice(result.message ?? "Check your email to verify your account.");
      else window.location.assign(result.redirectTo ?? "/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function resendVerification() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/resend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const result = await response.json() as ApiResponse;
      if (!response.ok) throw new Error(result.error ?? "Unable to resend the email.");
      setNotice(result.message ?? "Check your email.");
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : "Unable to resend the email.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <form className="auth-fields" onSubmit={submit}>
        {isSignUp && <label>Full name<Input autoComplete="name" value={firstName} onChange={(event) => setFirstName(event.target.value)} /></label>}
        {isSignUp && <label>Country<select value={country} onChange={(event) => setCountry(event.target.value)} required><option value="">Select your country</option><option value="Sri Lanka">Sri Lanka</option><option value="India">India</option><option value="Pakistan">Pakistan</option><option value="Bangladesh">Bangladesh</option><option value="United Kingdom">United Kingdom</option><option value="United States">United States</option><option value="Australia">Australia</option><option value="Other">Other</option></select></label>}
        <label>Email address<Input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>Password<div className="password-field"><Input type={showPassword ? "text" : "password"} autoComplete={isSignUp ? "new-password" : "current-password"} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /><button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
        {!isSignUp && <label className="auth-checkbox"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> Remember me</label>}
        {!isSignUp && <Link className="auth-forgot-link" href="/forgot-password">Forgot password?</Link>}
        {error && <p className="auth-message auth-error">{error}</p>}
        {notice && <p className="auth-message auth-success">{notice}</p>}
        {isSignUp && <label className="auth-checkbox"><input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} required /> I agree to the <Link href="/terms">Terms & Conditions</Link> and <Link href="/refund-policy">No Refund Policy</Link></label>}
        <Button type="submit" disabled={isLoading}>{isLoading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}</Button>
        {canResend && <button className="auth-resend" type="button" onClick={resendVerification}>Resend verification email</button>}
      </form>
      <p className="auth-switch">{isSignUp ? "Already have an account?" : "Need an account?"} <Link href={isSignUp ? "/sign-in" : "/sign-up"}>{isSignUp ? "Sign in" : "Create one"}</Link></p>
    </div>
  );
}
