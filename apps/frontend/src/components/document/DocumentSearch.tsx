import { Search, X } from "lucide-react";

type DocumentSearchProps = {
  value: string;

  onChange: (value: string) => void;

  onClear: () => void;
};

export default function DocumentSearch({
  value,
  onChange,
  onClear,
}: DocumentSearchProps) {
  return (
    <div className="relative">
      {/* Search Icon */}
      <Search
        size={16}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
      />

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search documents..."
        className="w-full rounded-2xl border border-border bg-background py-3 pl-11 pr-11 text-sm text-text outline-none transition placeholder:text-subtle focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
      />

      {/* Clear */}
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted transition hover:bg-surface2 hover:text-text"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
