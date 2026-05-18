import { Search, X } from "lucide-react";

type Props = {
  value: string;

  onChange: (value: string) => void;

  onClear: () => void;
};

export default function DocumentSearch({ value, onChange, onClear }: Props) {
  return (
    <div className="relative">
      {/* Search Icon */}
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      />

      {/* Input */}
      <input
        type="text"
        value={value}
        placeholder="Search documents..."
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-background py-3 pl-10 pr-10 text-sm text-text outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
      />

      {/* Clear */}
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-text"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
