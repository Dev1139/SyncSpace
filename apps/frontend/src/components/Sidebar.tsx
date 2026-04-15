import { useState } from "react";

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
    <aside className="w-72 border-r border-slate-200 bg-white/95 p-4 backdrop-blur">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Documents
      </h2>
      <input
        placeholder="Search documents..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="mb-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
      />
      {search && (
        <button
          onClick={() => onSearch("")}
          className="mb-2 text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          Clear
        </button>
      )}
      <button
        onClick={onCreate}
        className="mb-4 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        Add Document
      </button>

      {documents.length === 0 ? (
        <div className="mt-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
          {search ? "No documents found" : "No documents available"}
        </div>
      ) : (
        <div className="space-y-1.5">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`group flex items-center justify-between rounded-lg border px-2.5 py-2 transition ${
                selectedDoc === doc.id
                  ? "border-blue-200 bg-blue-50 shadow-sm"
                  : "border-transparent hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              {editingId === doc.id ? (
                <div className="w-full rounded-md bg-white px-1.5">
                  <input
                    value={tempTitle}
                    autoFocus
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={() => handleRename(doc.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleRename(doc.id);
                      }
                      if (e.key === "Escape") {
                        setEditingId(null);
                      }
                    }}
                    className="w-full bg-transparent py-0.5 text-sm text-slate-700 outline-none"
                  />
                </div>
              ) : (
                <span
                  onDoubleClick={() => {
                    setEditingId(doc.id);
                    setTempTitle(doc.title);
                  }}
                  onClick={() => onSelect(doc.id)}
                  className="flex-1 cursor-pointer truncate text-sm font-medium text-slate-700"
                  title={doc.title}
                >
                  {doc.title}
                </span>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(null);
                  onDelete(doc.id);
                }}
                className="ml-2 rounded-md px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                aria-label={`Delete ${doc.title}`}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
