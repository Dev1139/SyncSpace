import { useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { deleteDocument } from "../../services/documentApi";

import { useNavigate, useParams } from "react-router-dom";

import ConfirmModal from "../ui/ConfirmModal";

import RenameDocumentModal from "./RenameDocumentModal";

type Props = {
  documentId: string;

  workspaceId: string;

  currentTitle: string;

  role: "owner" | "editor" | "viewer";

  isOpen: boolean;

  onToggle: () => void;

  onRefresh?: () => void;
};

export default function DocumentActions({
  documentId,
  workspaceId,
  currentTitle,
  role,
  isOpen,
  onToggle,
  onRefresh,
}: Props) {
  const navigate = useNavigate();

  const { documentId: activeDocumentId } = useParams();

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [renameOpen, setRenameOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        onToggle();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const handleDelete = async () => {
    try {
      setLoading(true);

      await deleteDocument(documentId);

      toast.success("Document deleted");

      onRefresh?.();

      setDeleteOpen(false);

      if (activeDocumentId === documentId) {
        navigate(`/workspace/${workspaceId}`);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div ref={dropdownRef} className="relative">
        <button
          onClick={onToggle}
          className="rounded-lg p-1 text-muted transition hover:bg-background hover:text-text"
        >
          <MoreHorizontal size={16} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-10 z-50 w-44 rounded-2xl border border-border bg-surface p-2 shadow-2xl">
            <button
              onClick={() => {
                setRenameOpen(true);

                onToggle();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-background"
            >
              <Pencil size={15} />
              Rename
            </button>

            {role === "owner" && (
              <button
                onClick={() => {
                  setDeleteOpen(true);

                  onToggle();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-400 transition hover:bg-[#2a1620] hover:text-red-300"
              >
                <Trash2 size={15} />
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      <RenameDocumentModal
        open={renameOpen}
        documentId={documentId}
        currentTitle={currentTitle}
        onClose={() => setRenameOpen(false)}
        onSuccess={onRefresh}
      />

      <ConfirmModal
        open={deleteOpen}
        title="Delete Document"
        description={`Are you sure you want to delete "${currentTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={loading}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
