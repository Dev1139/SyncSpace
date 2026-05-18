import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import toast from "react-hot-toast";

import { FileText, Plus } from "lucide-react";

import { getWorkspace } from "../services/workspaceApi";

import { getDocuments, createDocument } from "../services/documentApi";

import PageLoader from "../components/ui/PageLoader";
import EmptyState from "../components/ui/EmptyState";
import Editor from "../components/Editor";

type Workspace = {
  id: string;
  name: string;
};

type Document = {
  id: string;
  title: string;
  updatedAt: string;
};

export default function WorkspacePage() {
  const navigate = useNavigate();

  const { workspaceId, documentId } = useParams();

  const [loading, setLoading] = useState(true);

  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  const [documents, setDocuments] = useState<Document[]>([]);

  const fetchWorkspaceData = async () => {
    if (!workspaceId) return;

    try {
      setLoading(true);

      const [workspaceRes, documentsRes] = await Promise.all([
        getWorkspace(workspaceId),

        getDocuments(workspaceId),
      ]);

      setWorkspace((workspaceRes as any)?.data);

      setDocuments((documentsRes as any)?.data?.items || []);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load workspace");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, [workspaceId]);

  const handleCreateDocument = async () => {
    if (!workspaceId) return;

    try {
      const res: any = await createDocument(workspaceId, {
        title: "Untitled Document",
      });

      toast.success("Document created");

      navigate(`/workspace/${workspaceId}/document/${res?.data?.id}`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create document");
    }
  };

  // Loading
  if (loading) {
    return <PageLoader text="Loading workspace..." />;
  }

  return (
    <div className="flex h-screen bg-background text-text">
      {/* Sidebar */}
      <aside className="flex w-[320px] flex-col border-r border-border bg-surface">
        {/* Header */}
        <div className="border-b border-border p-5">
          <h1 className="line-clamp-1 text-xl font-bold">{workspace?.name}</h1>

          <p className="mt-1 text-sm text-muted">Workspace Documents</p>

          <button
            onClick={handleCreateDocument}
            className="slate-button-primary mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3"
          >
            <Plus size={18} />
            Create Document
          </button>
        </div>

        {/* Documents */}
        <div className="flex-1 overflow-y-auto p-3">
          {documents.length === 0 ? (
            <EmptyState
              title="No documents yet"
              description="Create your first collaborative document."
            />
          ) : (
            <div className="space-y-2">
              {documents.map((document) => (
                <button
                  key={document.id}
                  onClick={() =>
                    navigate(
                      `/workspace/${workspaceId}/document/${document.id}`,
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-left transition hover:border-border hover:bg-background"
                >
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                    <FileText size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {document.title}
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      Updated{" "}
                      {new Date(document.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {documentId ? (
          <Editor documentId={documentId} title="Untitled Document" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <FileText size={30} />
              </div>

              <h2 className="text-2xl font-bold">Select a document</h2>

              <p className="mt-3 max-w-md leading-7 text-muted">
                Open an existing document or create a new collaborative document
                to start editing.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
