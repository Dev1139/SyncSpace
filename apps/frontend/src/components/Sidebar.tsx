import { useState } from "react";
import { FileText, Plus, Search, Trash2, X } from "lucide-react";

type Doc = {
  id: string;
  title: string;
};

type Props = {
  documents: Doc[];
  selectedDoc: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onSearch: (value: string) => void;
  search: string;
  workspaceName: string;
  onClose?: () => void;
};

export default function Sidebar({
  documents,
  selectedDoc,
  onSelect,
  onCreate,
  onDelete,
  onRename,
  onSearch,
  search,
  workspaceName,
  onClose,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");
  const handleRename = (id: string) => {
    if (!tempTitle.trim()) {
      setEditingId(null);
      return;
    }

    onRename(id, tempTitle);
    setEditingId(null);
  };

  return (
    <aside className="flex h-full min-h-0 flex-col p-4">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary/20 text-primary ring-1 ring-primary/30">
            <FileText size={19} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold leading-tight text-text">
              {workspaceName}
            </h1>
            <p className="text-sm text-muted">
              {documents.length}{" "}
              {documents.length === 1 ? "document" : "documents"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border2 text-muted transition hover:bg-surface3 hover:text-text md:hidden"
          aria-label="Close document list"
        >
          <X size={16} />
        </button>
      </div>

      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.05em] text-subtle">
        Documents
      </p>

      <label className="relative mb-3 block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          placeholder="Search documents..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="slate-input w-full pl-9 pr-9"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearch("")}
            className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted transition hover:bg-surface3 hover:text-text"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </label>

      <button
        onClick={onCreate}
        className="slate-button-primary mb-4 flex w-full items-center justify-center gap-2"
      >
        <Plus size={16} />
        New Document
      </button>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {documents.length === 0 ? (
          <div className="rounded border border-dashed border-border bg-void/40 p-4 text-sm text-muted">
            {search
              ? "No documents found"
              : "Create your first document to begin."}
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className={`
                flex items-center justify-between
                px-3 py-2 rounded border
                cursor-pointer
                transition
                ${
                  selectedDoc === doc.id
                    ? "border-primary/40 bg-primarySoft text-text"
                    : "border-transparent hover:border-border hover:bg-surface2 text-muted"
                }
              `}
            >
              {editingId === doc.id ? (
                <input
                  value={tempTitle}
                  autoFocus
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={() => handleRename(doc.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(doc.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="min-w-0 w-full bg-transparent text-sm outline-none text-text"
                />
              ) : (
                <span
                  onClick={() => onSelect(doc.id)}
                  onDoubleClick={() => {
                    setEditingId(doc.id);
                    setTempTitle(doc.title);
                  }}
                  className="min-w-0 flex-1 truncate text-sm"
                >
                  {doc.title}
                </span>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(doc.id);
                }}
                className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded text-muted hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
