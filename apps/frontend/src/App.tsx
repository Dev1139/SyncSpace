import Editor from "./components/Editor";
import Sidebar from "./components/Sidebar";
import { useWS } from "./context/WebContextProvider";
import { useDocuments } from "./hooks/useDocuments";

function App() {
  const wsContext = useWS();
  const ws = wsContext?.ws;
  const addListener = wsContext?.addListener;
  const send = wsContext?.send;
  const removeListener = wsContext?.removeListener;
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

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800">
      <Sidebar
        documents={documents}
        selectedDoc={selectedDoc}
        onSelect={setSelectedDoc}
        onCreate={handleCreateDocument}
        onDelete={handleDeleteDocument}
        onRename={handleRenameDocument}
        onSearch={setSearch}
        search={search}
      />

      <div className="flex-1 min-w-0">
        {selectedDoc ? (
          <Editor documentId={selectedDoc} title={currentDoc?.title || ""} />
        ) : (
          <div className="h-full grid place-items-center p-6">
            <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
              <p className="text-lg font-semibold text-slate-700">
                Select a document
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Choose one from the sidebar or create a new one.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
