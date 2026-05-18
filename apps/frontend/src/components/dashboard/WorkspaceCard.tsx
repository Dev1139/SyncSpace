import { useNavigate } from "react-router-dom";

import { FileText, Users, ArrowRight, Trash2 } from "lucide-react";

import toast from "react-hot-toast";

import { deleteWorkspace } from "../../services/workspaceApi";

type WorkspaceCardProps = {
  workspace: {
    id: string;
    name: string;

    updatedAt: string;

    _count?: {
      documents: number;
      members: number;
    };

    owner?: {
      id?: string;
      name: string;
    };
  };

  onDeleted?: () => void;
};

export default function WorkspaceCard({
  workspace,
  onDeleted,
}: WorkspaceCardProps) {
  const navigate = useNavigate();

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete "${workspace.name}" workspace?`);

    if (!confirmed) return;

    try {
      await deleteWorkspace(workspace.id);

      toast.success("Workspace deleted");

      onDeleted?.();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete workspace");
    }
  };

  return (
    <div className="group rounded-3xl border border-border bg-surface p-5 transition hover:border-primary/30 hover:shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="line-clamp-1 text-xl font-semibold text-text">
            {workspace.name}
          </h2>

          <p className="mt-1 text-sm text-muted">
            Owner: {workspace.owner?.name || "Unknown"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Delete */}
          <button
            onClick={handleDelete}
            className="rounded-xl p-2 text-muted transition hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 size={18} />
          </button>

          {/* Icon */}
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <FileText size={20} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 flex items-center gap-5">
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
      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-muted">
          Updated {new Date(workspace.updatedAt).toLocaleDateString()}
        </p>

        <button
          onClick={() => navigate(`/workspace/${workspace.id}`)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Open
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
