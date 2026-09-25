"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
  isLoading?: boolean;
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmationModalProps) {
  const [internalLoading, setInternalLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleConfirm() {
    try {
      setInternalLoading(true);
      await onConfirm();
    } finally {
      setInternalLoading(false);
    }
  }

  const busy = isLoading || internalLoading;

  return (
    <div className="confirm-modal-overlay" role="presentation" onClick={busy ? undefined : onClose}>
      <div
        className={cn("confirm-modal-box", `confirm-modal-${variant}`)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="confirm-modal-close"
          onClick={onClose}
          disabled={busy}
          aria-label="Close confirmation"
        >
          <X size={18} />
        </button>

        <div className="confirm-modal-content">
          <div className={cn("confirm-modal-icon-badge", `icon-${variant}`)}>
            {variant === "danger" ? (
              <Trash2 size={24} strokeWidth={2} />
            ) : (
              <AlertTriangle size={24} strokeWidth={2} />
            )}
          </div>

          <div className="confirm-modal-text">
            <h3 id="confirm-modal-title">{title}</h3>
            <div id="confirm-modal-desc" className="confirm-modal-desc">
              {description}
            </div>
          </div>
        </div>

        <div className="confirm-modal-actions">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            {cancelText}
          </Button>

          <Button
            type="button"
            className={cn(
              variant === "danger" && "confirm-modal-btn-danger",
              variant === "warning" && "confirm-modal-btn-warning",
            )}
            onClick={handleConfirm}
            disabled={busy}
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
