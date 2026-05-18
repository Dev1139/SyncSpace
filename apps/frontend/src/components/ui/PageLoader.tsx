import { Loader2 } from "lucide-react";

type PageLoaderProps = {
  text?: string;
};

export default function PageLoader({
  text = "Loading...",
}: PageLoaderProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
      {/* Spinner */}
      <Loader2
        size={32}
        className="animate-spin text-primary"
      />

      {/* Text */}
      <p className="text-sm text-muted">
        {text}
      </p>
    </div>
  );
}