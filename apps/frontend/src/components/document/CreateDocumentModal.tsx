import { useState } from "react";

import toast from "react-hot-toast";

import Modal from "../ui/Modal";

import { createDocument } from "../../services/documentApi";

type Props = {
  open: boolean;

  workspaceId: string;

  onClose: () => void;

  onCreated: (document: { id: string; title: string; updatedAt?: string }) => void;
};

export default function CreateDocumentModal({
  open,
  workspaceId,
  onClose,
  onCreated,
}: Props) {
  const [title, setTitle] = useState("");

  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Document title is required");

      return;
    }

    try {
      setLoading(true);

      const response: any = await createDocument(workspaceId, {
        title,
      });

      const newDocument = response?.data;

      toast.success("Document created");

      setTitle("");

      onClose();

      onCreated(newDocument);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Document">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-text">
            Document Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && title.trim()) {
                handleCreate();
              }
            }}
            placeholder="Enter document title"
            className="slate-input w-full"
            autoFocus
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="slate-button-primary w-full rounded-xl py-3"
        >
          {loading ? "Creating..." : "Create Document"}
        </button>
      </div>
    </Modal>
  );
}
