"use client";

import { useState } from "react";
import { Server, AlertTriangle, CheckCircle2, RefreshCw, Calendar, Clock, CreditCard } from "lucide-react";
import type { ServerSubscriptionWithTiming } from "@/server/subscriptions/servers";

export function ServerSubscriptionsCard({
  subscriptions,
}: {
  subscriptions: ServerSubscriptionWithTiming[];
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (subscriptions.length === 0) {
    return null;
  }

  async function handleRenew(subscriptionId: string) {
    setLoadingId(subscriptionId);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/servers/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to open renewal checkout.");
      }

      window.location.assign(data.url);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Renewal checkout failed.");
      setLoadingId(null);
    }
  }

  return (
    <section className="dashboard-panel dashboard-servers-panel">
      <div className="dashboard-panel-heading">
        <div>
          <span className="section-kicker">Monthly subscriptions</span>
          <h2>Active Game Servers</h2>
        </div>
        <span className="profile-count">{subscriptions.length} hosted servers</span>
      </div>

      {errorMessage && (
        <div className="server-renew-error">
          <AlertTriangle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="server-subscriptions-grid">
        {subscriptions.map((sub) => {
          const isRenewing = loadingId === sub.id;
          const cyclePercent = Math.min(100, Math.round((sub.daysElapsed / 30) * 100));

          return (
            <article
              className={`server-sub-card ${sub.isExpired ? "expired" : sub.isDay25OrLater ? "expiring" : "active"}`}
              key={sub.id}
            >
              <div className="server-sub-header">
                <div className="server-sub-title">
                  <div className="server-sub-icon">
                    <Server size={18} />
                  </div>
                  <div>
                    <h3>{sub.serverName}</h3>
                    <span className="server-sub-id">{sub.id}</span>
                  </div>
                </div>

                <div className="server-sub-badge">
                  {sub.isExpired ? (
                    <span className="sub-badge expired">
                      <AlertTriangle size={11} /> Expired
                    </span>
                  ) : sub.isDay25OrLater ? (
                    <span className="sub-badge warning">
                      <Clock size={11} /> Renewal Due (Day {sub.daysElapsed})
                    </span>
                  ) : (
                    <span className="sub-badge active">
                      <CheckCircle2 size={11} /> Active
                    </span>
                  )}
                </div>
              </div>

              {/* Day 25 Warning Banner */}
              {sub.isDay25OrLater && !sub.isExpired && (
                <div className="server-renew-alert">
                  <AlertTriangle size={15} />
                  <div>
                    <strong>Renewal notice: Day {sub.daysElapsed} of 30</strong>
                    <p>
                      Your server will expire in <strong>{sub.daysRemaining} days</strong> (on{" "}
                      {sub.formattedExpiry}). Renew now to maintain uptime.
                    </p>
                  </div>
                </div>
              )}

              {/* Expired Banner */}
              {sub.isExpired && (
                <div className="server-expired-alert">
                  <AlertTriangle size={15} />
                  <div>
                    <strong>Subscription Expired</strong>
                    <p>Expired on {sub.formattedExpiry}. Pay for the next month to reactivate your server.</p>
                  </div>
                </div>
              )}

              {/* Cycle Progress Bar */}
              <div className="server-cycle-progress">
                <div className="progress-labels">
                  <span>Cycle progress (30 days)</span>
                  <span>
                    <strong>Day {Math.min(30, sub.daysElapsed)}</strong> of 30 (
                    {sub.daysRemaining} days left)
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill ${sub.isExpired ? "fill-danger" : sub.isDay25OrLater ? "fill-warning" : "fill-normal"}`}
                    style={{ width: `${cyclePercent}%` }}
                  />
                </div>
              </div>

              {/* Metadata details */}
              <div className="server-sub-details">
                <div className="detail-item">
                  <Calendar size={13} />
                  <div>
                    <small>Expires / Renews On</small>
                    <strong>{sub.formattedExpiry}</strong>
                  </div>
                </div>
                <div className="detail-item">
                  <CreditCard size={13} />
                  <div>
                    <small>Monthly Plan</small>
                    <strong>{sub.formattedRenewalPrice} / mo</strong>
                  </div>
                </div>
              </div>

              {/* Renewal Action */}
              <div className="server-sub-action">
                <button
                  type="button"
                  className={`server-renew-btn ${sub.isDay25OrLater || sub.isExpired ? "highlight" : ""}`}
                  onClick={() => handleRenew(sub.id)}
                  disabled={isRenewing}
                >
                  <RefreshCw size={14} className={isRenewing ? "spin-icon" : ""} />
                  {isRenewing
                    ? "Opening checkout..."
                    : sub.isExpired
                      ? `Reactivate Server (${sub.formattedRenewalPrice})`
                      : `Renew Server for Next Month (${sub.formattedRenewalPrice})`}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
