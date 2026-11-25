import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  warningText?: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  warningText,
  confirmLabel,
  cancelLabel = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  const confirmBtnClass =
    variant === 'danger'
      ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white'
      : variant === 'warning'
      ? 'bg-[#F59E0B] hover:bg-[#D97706] text-[#020B18]'
      : 'bg-[#00D084] hover:bg-[#20E39A] text-[#020B18]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#020B18]/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-md rounded-xl bg-[#0A1729] border border-[#1D3552] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1D3552]">
          <div className="flex items-center gap-2.5">
            <AlertTriangle
              className={`w-5 h-5 ${
                variant === 'danger'
                  ? 'text-[#EF4444]'
                  : variant === 'warning'
                  ? 'text-[#F59E0B]'
                  : 'text-[#00D084]'
              }`}
            />
            <h3 id="confirm-dialog-title" className="text-base font-semibold text-[#F1F5F9]">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#0D1D32] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-[#CBD5E1] leading-relaxed">{description}</p>
          {warningText && (
            <div className="rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-3.5 py-2.5 text-xs text-[#FCD34D] leading-relaxed">
              {warningText}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-3.5 bg-[#061326] border-t border-[#1D3552]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#CBD5E1] bg-[#0D1D32] hover:bg-[#162B47] border border-[#1D3552] transition-colors whitespace-nowrap"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${confirmBtnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
