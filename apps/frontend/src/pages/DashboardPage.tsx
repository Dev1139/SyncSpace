import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import { Plus } from "lucide-react";

import { getWorkspaces } from "../services/workspaceApi";

import PageContainer from "../components/ui/PageContainer";
import PageLoader from "../components/ui/PageLoader";
import EmptyState from "../components/ui/EmptyState";

import WorkspaceCard from "../components/dashboard/WorkspaceCard";
import CreateWorkspaceModal from "../components/dashboard/CreateWorkspaceModal";
import DashboardTopbar from "../components/dashboard/DashboardTopbar";
import ProfileDropdown from "../components/dashboard/ProfileDropdown";

type Workspace = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;

  _count?: {
    documents: number;
    members: number;
  };

  owner?: {
    name: string;
  };
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);

      const res: any = await getWorkspaces();

      setWorkspaces(res?.data?.items || []);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Loading state
  if (loading) {
    return (
      <PageContainer>
        <PageLoader text="Loading workspaces..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-[1500px]">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <DashboardTopbar />

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="slate-button-primary flex h-12 items-center justify-center gap-2 rounded-2xl px-5"
            >
              <Plus size={18} />

              <span>Create Workspace</span>
            </button>

            <ProfileDropdown />
          </div>
        </div>

        {/* Empty State */}
        {workspaces.length === 0 ? (
          <div className="mt-20">
            <EmptyState
              title="No workspaces yet"
              description="Create your first workspace to start collaborating with your team."
              action={
                <button
                  onClick={() => setModalOpen(true)}
                  className="slate-button-primary rounded-2xl px-5 py-3"
                >
                  Create Workspace
                </button>
              }
            />
          </div>
        ) : (
          /* Workspace Grid */
          <div className="mt-10 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {workspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                onDeleted={fetchWorkspaces}
              />
            ))}
          </div>
        )}

        {/* Create Workspace Modal */}
        <CreateWorkspaceModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={fetchWorkspaces}
        />
      </div>
    </PageContainer>
  );
}
