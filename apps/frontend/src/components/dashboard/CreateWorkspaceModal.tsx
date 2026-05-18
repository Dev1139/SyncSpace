import { useEffect, useRef, useState } from "react";

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

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setName("");
    }
  }, [open]);

  // Autofocus
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

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
      <form
        onSubmit={(e) => {
          e.preventDefault();

          handleCreate();
        }}
        className="space-y-5"
      >
        {/* Description */}
        <p className="text-sm leading-6 text-muted">
          Create a collaborative workspace to organize documents, projects, and
          team members.
        </p>

        {/* Input */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text">
            Workspace Name
          </label>

          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter workspace name"
            className="slate-input w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium text-text transition hover:bg-surface2"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="slate-button-primary rounded-xl px-5 py-3"
          >
            {loading ? "Creating..." : "Create Workspace"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
