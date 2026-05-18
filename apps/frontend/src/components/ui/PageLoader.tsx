import { Loader2 } from "lucide-react";

type PageLoaderProps = {
  text?: string;
};

export default function PageLoader({ text = "Loading..." }: PageLoaderProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-4 text-center">
      {/* Spinner */}
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-border bg-surface shadow-lg">
        <Loader2 size={30} className="animate-spin text-primary" />
      </div>

      {/* Text */}
      <div className="mt-5 space-y-1">
        <p className="text-sm font-medium text-text">{text}</p>

        <p className="text-xs text-muted">Please wait a moment</p>
      </div>
    </div>
  );
}
