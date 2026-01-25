/**
 * Confirmation dialog component.
 * Used to confirm important actions like folding strong hands.
 */

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'warning' | 'danger';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    warning: {
      icon: '⚠️',
      confirmBg: 'bg-yellow-600 hover:bg-yellow-500',
      border: 'border-yellow-500',
    },
    danger: {
      icon: '🚨',
      confirmBg: 'bg-red-600 hover:bg-red-500',
      border: 'border-red-500',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className={`relative bg-gray-800 rounded-lg shadow-2xl border-2 ${style.border} max-w-md w-full animate-slide-up`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-700">
          <span className="text-3xl">{style.icon}</span>
          <h2
            id="dialog-title"
            className="text-white font-bold text-lg flex-1"
          >
            {title}
          </h2>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-300 text-base leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-700">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white font-body font-bold rounded-lg transition-all hover:scale-105 active:scale-95 ripple-effect"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 ${style.confirmBg} text-white font-body font-bold rounded-lg transition-all hover:scale-105 active:scale-95 border-2 border-white/20 ripple-effect`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
