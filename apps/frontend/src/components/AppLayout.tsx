import { useState } from "react";
import Editor from "./Editor";
import Sidebar from "./Sidebar";
import { useWS } from "../context/WebContextProvider";
import { useDocuments } from "../hooks/useDocuments";
import { useWorkspace } from "../context/WorkspaceContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { LogOut, Menu, Moon, Sun } from "lucide-react";

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const wsContext = useWS();
  const ws = wsContext?.ws;
  const addListener = wsContext?.addListener;
  const send = wsContext?.send;
  const removeListener = wsContext?.removeListener;
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { workspaces, currentWorkspaceId } = useWorkspace();
  const currentWorkspace = workspaces.find(
    (workspace) => workspace.id === currentWorkspaceId,
  );
  const workspaceName = currentWorkspace?.name || "Workspace";

  const {
    search,
    setSearch,
    documents,
    selectedDoc,
    setSelectedDoc,
    currentDoc,
    handleCreateDocument,
    handleDeleteDocument,
    handleRenameDocument,
  } = useDocuments({
    send,
    ws: ws ?? null,
    addListener,
    removeListener,
  });

  const handleSelectDocument = (id: string) => {
    setSelectedDoc(id);
  };

  return (
    <div className="relative flex h-screen bg-background text-text">
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-void/70 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close document list"
        />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-[min(82vw,300px)] shrink-0 border-r border-border bg-surface transition-transform duration-200 md:static md:z-auto md:w-[260px] md:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar
          documents={documents}
          selectedDoc={selectedDoc}
          onSelect={handleSelectDocument}
          onCreate={handleCreateDocument}
          onDelete={handleDeleteDocument}
          onRename={handleRenameDocument}
          onSearch={setSearch}
          search={search}
          workspaceName={workspaceName}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-14 items-center justify-between gap-3 border-b border-border bg-void/70 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-muted">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded border border-border2 text-muted transition hover:bg-surface3 hover:text-text md:hidden"
              aria-label="Open document list"
            >
              <Menu size={18} />
            </button>
            <span className="shrink-0 font-semibold text-text">SyncSpace</span>
            {currentDoc?.title && (
              <>
                <span className="shrink-0 text-subtle">/</span>
                <span className="truncate">{workspaceName}</span>
                <span className="shrink-0 text-subtle">/</span>
                <span className="truncate">{currentDoc.title}</span>
              </>
            )}
            {!currentDoc?.title && (
              <>
                <span className="shrink-0 text-subtle">/</span>
                <span className="truncate">{workspaceName}</span>
              </>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden text-sm text-muted sm:block">
              {documents.length} {documents.length === 1 ? "document" : "documents"}
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded border border-border2 text-muted transition hover:bg-surface3 hover:text-text"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-9 w-9 items-center justify-center rounded border border-border2 text-muted transition hover:bg-danger/10 hover:text-danger"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-background">
          {selectedDoc ? (
            <Editor documentId={selectedDoc} title={currentDoc?.title || ""} />
          ) : (
            <div className="h-full flex items-center justify-center px-6 text-center text-muted">
              <div className="slate-panel max-w-sm rounded-lg p-8">
                <p className="text-xs font-bold uppercase tracking-[0.05em] text-subtle">
                  Workspace
                </p>
                <h1 className="mt-3 text-2xl font-semibold text-text">
                  Select a document
                </h1>
                <p className="mt-2 text-sm leading-6">
                  Choose a file from the sidebar or create a fresh one to start editing.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
