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

    let lastReset = 0;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => void signOut(), inactivityLimitMs);
    };

    const onActivity = () => {
      const now = Date.now();
      if (now - lastReset > 5000) {
        lastReset = now;
        resetTimer();
      }
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "touchstart",
      "wheel",
      "scroll",
    ];
    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, onActivity, { passive: true }),
    );
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, onActivity));
    };
  }, [enabled, router]);

  return null;
}
