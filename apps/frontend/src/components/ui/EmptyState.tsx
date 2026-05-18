import { FileText } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface/40 px-6 py-14 text-center">
      {/* Icon */}
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <FileText size={26} />
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-text">
        {title}
      </h2>

      {/* Description */}
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}