import { useState } from "react";

import toast from "react-hot-toast";

import Modal from "../ui/Modal";

import { createWorkspace } from "../../services/workspaceApi";

type CreateWorkspaceModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function CreateWorkspaceModal({
  open,
  onClose,
  onCreated,
}: CreateWorkspaceModalProps) {
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Workspace name is required");

      return;
    }

    try {
      setLoading(true);

      await createWorkspace({
        name,
      });

      toast.success("Workspace created");

      setName("");

      onClose();

      onCreated?.();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Workspace">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-text">
            Workspace Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter workspace name"
            className="slate-input w-full"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="slate-button-primary w-full rounded-xl py-3"
        >
          {loading ? "Creating..." : "Create Workspace"}
        </button>
      </div>
    </Modal>
  );
}
