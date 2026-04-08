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
    <div className="w-64 border-r bg-white p-4">
      <h2 className="font-semibold mb-4">Documents</h2>
      <input
        placeholder="Search documents..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="mb-3 w-full px-2 py-1 text-sm rounded bg-gray-100 outline-none focus:bg-white"
      />
      {search && (
        <button
          onClick={() => onSearch("")}
          className="text-xs text-blue-500 mb-2"
        >
          Clear
        </button>
      )}
      <button
        onClick={onCreate}
        className="mb-4 w-full bg-blue-500 text-white px-3 py-2 rounded"
      >
        + New Document
      </button>

      {documents.length === 0 ? (
        <div className="text-sm text-gray-500 mt-2">
          {search ? "No documents found" : "No documents available"}
        </div>
      ) : (
        documents.map((doc) => (
          <div
            key={doc.id}
            className={`p-2 rounded flex justify-between items-center ${
              selectedDoc === doc.id ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
          >
            {editingId === doc.id ? (
              <div className="bg-blue-50 rounded px-1">
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
                  className="bg-transparent outline-none w-full text-sm transition-all duration-150"
                />
              </div>
            ) : (
              <span
                onDoubleClick={() => {
                  setEditingId(doc.id);
                  setTempTitle(doc.title);
                }}
                onClick={() => onSelect(doc.id)}
                className="cursor-pointer flex-1"
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
              className="text-red-500 text-sm ml-2"
            >
              ❌
            </button>
          </div>
        ))
      )}
    </div>
  );
}
