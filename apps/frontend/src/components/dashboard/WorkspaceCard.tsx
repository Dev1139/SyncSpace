import { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Clock3,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";

import toast from "react-hot-toast";

import Modal from "../ui/Modal";
import ConfirmModal from "../ui/ConfirmModal";

import {
  deleteWorkspace,
  inviteMember,
  updateWorkspace,
} from "../../services/workspaceApi";

type WorkspaceCardProps = {
  workspace: {
    id: string;

    name: string;

    updatedAt: string;

    _count?: {
      documents: number;

      members: number;
    };

    members?: {
      role: string;

      user: {
        id: string;

        name: string;

        email: string;
      };
    }[];
  };

  onDeleted?: () => void;

  onUpdated?: () => void;
};

export default function WorkspaceCard({
  workspace,
  onDeleted,
  onUpdated,
}: WorkspaceCardProps) {
  const navigate = useNavigate();

  const menuRef = useRef<HTMLDivElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);

  const [renameOpen, setRenameOpen] = useState(false);

  const [inviteOpen, setInviteOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [workspaceName, setWorkspaceName] = useState(workspace.name);

  const [email, setEmail] = useState("");

  const [role, setRole] = useState<"editor" | "viewer">("editor");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleDelete = async () => {
    try {
      setLoading(true);

      await deleteWorkspace(workspace.id);

      toast.success("Workspace deleted");

      setDeleteOpen(false);

      onDeleted?.();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!workspaceName.trim()) {
      toast.error("Workspace name is required");

      return;
    }

    try {
      setLoading(true);

      await updateWorkspace(workspace.id, {
        name: workspaceName,
      });

      toast.success("Workspace updated");

      setRenameOpen(false);

      onUpdated?.();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error("Email is required");

      return;
    }

    try {
      setLoading(true);

      await inviteMember(workspace.id, {
        email,
        role,
      });

      toast.success("Member added to workspace");

      setInviteOpen(false);

      setEmail("");

      setRole("editor");

      onUpdated?.();
    } catch (error: any) {
      toast.error(error?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };
  const owner = workspace.members?.find(
    (member) => member.role === "owner",
  )?.user;

  return (
    <>
      <div className="group flex h-full flex-col rounded-3xl border border-border bg-surface p-5 transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-1 text-xl font-semibold text-text">
              {workspace.name}
            </h2>

            <p className="mt-1 text-sm text-muted">
              Owner: {owner?.name || "Unknown"}
            </p>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-xl p-2 text-subtle opacity-0 transition hover:bg-surface2 hover:text-text group-hover:opacity-100"
            >
              <MoreHorizontal size={18} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-border bg-surface p-2 shadow-2xl">
                <button
                  onClick={() => {
                    setRenameOpen(true);

                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-background"
                >
                  <Pencil size={16} />
                  Rename Workspace
                </button>

                <button
                  onClick={() => {
                    setInviteOpen(true);

                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-background"
                >
                  <UserPlus size={16} />
                  Add Member
                </button>

                <button
                  onClick={() => {
                    setDeleteOpen(true);

                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-300 transition hover:bg-[#2a1620] hover:text-red-200"
                >
                  <Trash2 size={16} />
                  Delete Workspace
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <FileText size={16} />

            <span>{workspace._count?.documents || 0} docs</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted">
            <Users size={16} />

            <span>{workspace._count?.members || 0} members</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-6">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Clock3 size={14} />

            <span>
              Updated {new Date(workspace.updatedAt).toLocaleDateString()}
            </span>
          </div>

          <button
            onClick={() => navigate(`/workspace/${workspace.id}`)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Open
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Rename Modal */}
      <Modal
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="Rename Workspace"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();

            handleRename();
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              Workspace Name
            </label>

            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="Enter workspace name"
              className="slate-input w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="slate-button-primary w-full rounded-xl py-3"
          >
            {loading ? "Updating..." : "Update Workspace"}
          </button>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Add Member"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();

            handleInvite();
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              Member Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter member email"
              className="slate-input w-full"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              Role
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
              className="slate-input w-full"
            >
              <option value="editor">Editor</option>

              <option value="viewer">Viewer</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="slate-button-primary w-full rounded-xl py-3"
          >
            {loading ? "Adding..." : "Add Member"}
          </button>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={loading}
        danger
        title="Delete Workspace"
        description={`Are you sure you want to delete "${workspace.name}"? This action cannot be undone.`}
        confirmText="Delete Workspace"
      />
    </>
  );
}
