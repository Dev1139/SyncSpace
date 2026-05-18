import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function Modal({
  open,
  onClose,
  title,
  children,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          {title && (
            <h2 className="text-xl font-semibold text-text">
              {title}
            </h2>
          )}

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition hover:bg-background hover:text-text"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}