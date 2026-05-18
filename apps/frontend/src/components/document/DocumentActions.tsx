import { useState } from "react";

import toast from "react-hot-toast";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  deleteDocument,
  updateDocumentTitle,
} from "../../services/documentApi";
import { useNavigate, useParams } from "react-router-dom";

type Props = {
  documentId: string;

  workspaceId: string;

  currentTitle: string;

  onRefresh?: () => void;
};

export default function DocumentActions({
  documentId,
  currentTitle,
  onRefresh,
}: Props) {
  const navigate = useNavigate();

  const { documentId: activeDocumentId } = useParams();

  const [open, setOpen] = useState(false);

  const handleRename = async () => {
    const title = window.prompt("Rename document", currentTitle);

    if (!title?.trim()) return;

    try {
      await updateDocumentTitle(documentId, {
        title,
      });

      toast.success("Document renamed");

      onRefresh?.();
    } catch (error: any) {
      toast.error(error?.message || "Failed to rename document");
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete "${currentTitle}"?`);

    if (!confirmed) return;

    try {
      await deleteDocument(documentId);

      toast.success("Document deleted");

      onRefresh?.();
      if (activeDocumentId === documentId) {
        navigate(`/workspace/${workspaceId}`);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete document");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-1 text-muted transition hover:bg-background hover:text-text"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-44 rounded-2xl border border-border bg-surface p-2 shadow-2xl">
          <button
            onClick={handleRename}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-background"
          >
            <Pencil size={15} />
            Rename
          </button>

          <button
            onClick={handleDelete}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-danger transition hover:bg-danger/10"
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
