import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  FileText,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  X,
} from "lucide-react";

import { Link, useNavigate, useParams } from "react-router-dom";

import toast from "react-hot-toast";

import { getDocuments } from "../services/documentApi";

import { getWorkspace, getWorkspaceMembers } from "../services/workspaceApi";

import PageLoader from "../components/ui/PageLoader";

import Editor from "../components/Editor";

import DocumentActions from "../components/document/DocumentActions";

import { useTheme } from "../context/ThemeContext";

import { useAuth } from "../context/AuthContext";

import CreateDocumentModal from "../components/document/CreateDocumentModal";
import { useWS } from "../context/WebContextProvider";
import { useWorkspace } from "../context/WorkspaceContext";

type Workspace = {
  id: string;

  name: string;

  _count?: {
    members: number;
  };
};

type WorkspaceMember = {
  id: string;

  role: "owner" | "editor" | "viewer";

  user: {
    id: string;

    name: string;

    email: string;

    avatarUrl?: string;
  };
};

type Document = {
  id: string;

  title: string;

  updatedAt: string;
};

export default function WorkspacePage() {
  const navigate = useNavigate();

  const { workspaceId, documentId } = useParams();

  const { user } = useAuth();

  const { theme, toggleTheme } = useTheme();
  const wsContext = useWS();
  const { setCurrentWorkspaceId } = useWorkspace();

  const [loading, setLoading] = useState(true);

  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  const [documents, setDocuments] = useState<Document[]>([]);

  const [members, setMembers] = useState<WorkspaceMember[]>([]);

  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchWorkspaceData = async () => {
    if (!workspaceId) return;

    try {
      setLoading(true);

      const [workspaceRes, documentsRes, membersRes] = await Promise.all([
        getWorkspace(workspaceId),

        getDocuments(workspaceId),

        getWorkspaceMembers(workspaceId),
      ]);

      setWorkspace((workspaceRes as any)?.data);

      setDocuments((documentsRes as any)?.data?.items || []);

      setMembers((membersRes as any)?.data || []);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load workspace");

      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId) {
      setCurrentWorkspaceId(workspaceId);
    }
  }, [workspaceId, setCurrentWorkspaceId]);

  useEffect(() => {
    if (!workspaceId || !wsContext?.ws || !wsContext.addListener) return;
    if (wsContext.ws.readyState !== WebSocket.OPEN) return;

    wsContext.send({
      type: "join-workspace",
      data: {
        workspaceId,
      },
    });
  }, [workspaceId, wsContext?.ws, wsContext?.send]);

  useEffect(() => {
    if (!workspaceId || !wsContext?.addListener || !wsContext.removeListener) {
      return;
    }

    const handler = (msg: any) => {
      if (msg.type === "title-change") {
        const { documentId: changedDocumentId, title } = msg.data || {};

        if (!changedDocumentId || typeof title !== "string") return;

        setDocuments((prev) =>
          prev.map((document) =>
            document.id === changedDocumentId
              ? { ...document, title }
              : document,
          ),
        );
      }

      if (msg.type === "document-created") {
        const document = msg.data;

        if (!document?.id) return;

        setDocuments((prev) => {
          if (prev.some((item) => item.id === document.id)) return prev;
          return [document, ...prev];
        });
      }

      if (msg.type === "document-deleted") {
        const { documentId: deletedDocumentId } = msg.data || {};

        if (!deletedDocumentId) return;

        setDocuments((prev) =>
          prev.filter((document) => document.id !== deletedDocumentId),
        );

        if (documentId === deletedDocumentId) {
          navigate(`/workspace/${workspaceId}`);
        }
      }
    };

    wsContext.addListener(handler);
    return () => wsContext.removeListener(handler);
  }, [
    documentId,
    navigate,
    workspaceId,
    wsContext?.addListener,
    wsContext?.removeListener,
  ]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) =>
      document.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [documents, search]);

  const currentDocument = documents.find(
    (document) => document.id === documentId,
  );

  const currentMember = members.find((member) => member.user.id === user?.id);

  const canManage =
    currentMember?.role === "owner" || currentMember?.role === "editor";

  const canEdit =
    currentMember?.role === "owner" || currentMember?.role === "editor";

  const owner = members.find((member) => member.role === "owner")?.user;

  if (loading) {
    return <PageLoader text="Loading workspace..." />;
  }

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close document sidebar"
          onClick={closeSidebar}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[310px] max-w-[86vw] shrink-0 flex-col border-r border-border bg-surface transition-transform duration-200 lg:static lg:z-auto lg:h-full lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-border p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-sm text-muted transition hover:text-text"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>

            <button
              type="button"
              aria-label="Close document sidebar"
              onClick={closeSidebar}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border text-muted transition hover:bg-surface2 hover:text-text lg:hidden"
            >
              <X size={16} />
            </button>
          </div>

          {workspace && (
            <div className="rounded-3xl border border-border bg-surface2 p-5">
              <h1 className="truncate text-xl font-semibold text-text">
                {workspace.name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
                <p>
                  Owner:{" "}
                  <span className="text-text">{owner?.name || "Unknown"}</span>
                </p>

                <p>{workspace._count?.members || 0} members</p>
              </div>
            </div>
          )}

          {canEdit && (
            <button
              onClick={() => setCreateOpen(true)}
              className="slate-button-primary mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3"
            >
              <Plus size={18} />
              Create Document
            </button>
          )}

          <div className="relative mt-4">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full rounded-2xl border border-border bg-background py-3 pl-11 pr-4 text-sm text-text outline-none transition placeholder:text-subtle focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {filteredDocuments.length === 0 ? (
            <div className="flex h-full items-center justify-center px-4 text-center">
              <p className="text-sm text-muted">No documents found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map((document) => {
                const active = document.id === documentId;

                return (
                  <div
                    key={document.id}
                    className={`group flex items-center justify-between gap-2 rounded-2xl border px-3 py-3 transition ${
                      active
                        ? "border-primary/30 bg-primary/10"
                        : "border-transparent hover:border-border hover:bg-surface2"
                    }`}
                  >
                    <Link
                      to={`/workspace/${workspaceId}/document/${document.id}`}
                      onClick={closeSidebar}
                      className="min-w-0 flex flex-1 items-center gap-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FileText size={16} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text">
                          {document.title}
                        </p>

                        <p className="mt-1 text-xs text-muted">
                          Updated{" "}
                          {new Date(document.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>

                    {canManage && (
                      <DocumentActions
                        documentId={document.id}
                        workspaceId={workspaceId!}
                        currentTitle={document.title}
                        role={currentMember?.role || "viewer"}
                        onRefresh={fetchWorkspaceData}
                        isOpen={openMenuId === document.id}
                        onToggle={() =>
                          setOpenMenuId(
                            openMenuId === document.id ? null : document.id,
                          )
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <button
          type="button"
          aria-label="Open document sidebar"
          onClick={() => setSidebarOpen(true)}
          className="absolute left-4 top-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface text-muted transition hover:bg-surface2 hover:text-text lg:hidden"
        >
          <Menu size={20} />
        </button>

        <button
          onClick={toggleTheme}
          className="absolute right-4 top-4 z-50 rounded-2xl border border-border bg-surface p-3 text-muted transition hover:bg-surface2 hover:text-text md:right-5 md:top-5"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="flex-1 overflow-hidden p-4 sm:p-6 md:p-8">
          {documentId && currentDocument ? (
            <Editor
              documentId={documentId}
              title={currentDocument.title}
              canEdit={canEdit}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="slate-panel max-w-md rounded-3xl p-10 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-subtle">
                  Workspace
                </p>

                <h1 className="mt-4 text-3xl font-bold tracking-tight text-text">
                  Select a document
                </h1>

                <p className="mt-4 text-sm leading-7 text-muted">
                  Choose an existing document from the sidebar or create a new
                  collaborative document to start editing with your team.
                </p>
              </div>
            </div>
          )}

          <CreateDocumentModal
            open={createOpen}
            workspaceId={workspaceId!}
            onClose={() => setCreateOpen(false)}
            onCreated={(newDocument) => {
              setDocuments((prev) => {
                if (prev.some((document) => document.id === newDocument.id)) {
                  return prev;
                }

                return [
                  {
                    ...newDocument,
                    updatedAt: newDocument.updatedAt || new Date().toISOString(),
                  },
                  ...prev,
                ];
              });

              wsContext?.send({
                type: "document-created",
                data: {
                  workspaceId,
                  document: {
                    ...newDocument,
                    updatedAt: newDocument.updatedAt || new Date().toISOString(),
                  },
                },
              });

              navigate(`/workspace/${workspaceId}/document/${newDocument.id}`);
            }}
          />
        </div>
      </main>
    </div>
  );
}
