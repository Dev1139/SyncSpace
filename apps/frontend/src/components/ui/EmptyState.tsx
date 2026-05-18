import { FileText } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;

  icon?: React.ReactNode;
};

export default function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center sm:px-10">
      {/* Icon */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-1 ring-primary/10">
        {icon || <FileText size={30} />}
      </div>

      {/* Title */}
      <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-text">
        {title}
      </h2>

      {/* Description */}
      {description && (
        <p className="mt-3 max-w-md text-sm leading-7 text-muted">
          {description}
        </p>
      )}

      {/* Action */}
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}
