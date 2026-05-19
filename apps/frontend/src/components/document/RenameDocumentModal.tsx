import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import Modal from "../ui/Modal";

import { updateDocumentTitle } from "../../services/documentApi";

type Props = {
  open: boolean;

  documentId: string;

  currentTitle: string;

  onClose: () => void;

  onSuccess?: (title: string) => void;
};

export default function RenameDocumentModal({
  open,
  documentId,
  currentTitle,
  onClose,
  onSuccess,
}: Props) {
  const [title, setTitle] = useState(currentTitle);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle]);

  const handleRename = async () => {
    if (!title.trim()) {
      toast.error("Title is required");

      return;
    }

    try {
      setLoading(true);

      const nextTitle = title.trim();

      await updateDocumentTitle(documentId, {
        title: nextTitle,
      });

      toast.success("Document renamed");

      onSuccess?.(nextTitle);

      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Failed to rename document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Rename Document">
      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && title.trim()) {
              handleRename();
            }
          }}
          placeholder="Document title"
          className="slate-input w-full"
          autoFocus
        />

        <button
          onClick={handleRename}
          disabled={loading}
          className="slate-button-primary w-full rounded-xl py-3"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </Modal>
  );
}
