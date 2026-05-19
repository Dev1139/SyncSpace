import Modal from "./Modal";

type ConfirmModalProps = {
  open: boolean;

  title: string;

  description?: string;

  confirmText?: string;

  cancelText?: string;

  loading?: boolean;

  danger?: boolean;

  onConfirm: () => void;

  onClose: () => void;
};

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  danger = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-6">
        {/* Description */}
        {description && (
          <p className="text-sm leading-7 text-muted">{description}</p>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium text-text transition hover:bg-surface2"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`rounded-xl px-5 py-3 text-sm font-medium text-white transition ${
              danger
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-primary text-white hover:opacity-90"
            }`}
          >
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
