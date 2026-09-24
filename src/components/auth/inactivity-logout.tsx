"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const inactivityLimitMs = 3 * 60 * 1000;

export function InactivityLogout({ enabled }: { enabled: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const signOut = async () => {
      await fetch("/api/auth/sign-out", { method: "POST" });
      router.push("/");
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => void signOut(), inactivityLimitMs);
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "touchstart",
      "wheel",
      "scroll",
    ];
    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, resetTimer, { passive: true }),
    );
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
    };
  }, [enabled, router]);

  return null;
}
