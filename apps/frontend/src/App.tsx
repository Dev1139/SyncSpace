import { useEffect, useRef, useState } from "react";
import Editor from "./components/Editor";
import Sidebar from "./components/Sidebar";
import { useWS } from "./context/WebContextProvider";

type Doc = {
  id: string;
  title: string;
};

function App() {
  const wsContext = useWS();
  const hasFetched = useRef(false);
  const ws = wsContext?.ws;
  const addListener = wsContext?.addListener;
  const removeListener = wsContext?.removeListener;
  const send = wsContext?.send;
  const [search, setSearch] = useState("");

  const [documents, setDocuments] = useState<Doc[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  useEffect(() => {
    if (!ws) return;

    const handler = (msg: any) => {
      if (msg.type === "title-change") {
        const { documentId, title } = msg.data;

        setDocuments((prev) =>
          prev.map((doc) => (doc.id === documentId ? { ...doc, title } : doc)),
        );
      }

      if (msg.type === "document-created") {
        const doc = msg.data;

        setDocuments((prev) => {
          if (prev.find((d) => d.id === doc.id)) return prev;
          return [doc, ...prev];
        });
      }

      if (msg.type === "document-deleted") {
        const { documentId } = msg.data;

        setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));

        if (selectedDoc === documentId) {
          setSelectedDoc(null);
        }
      }
    };

    addListener(handler);

    return () => removeListener(handler);
  }, [ws, addListener, removeListener]);

  // Fetch documents
  const fetchDocuments = async (searchValue = "") => {
    const res = await fetch(
      `http://localhost:3000/document/workspaces/87c3452e-5217-4223-9f0c-24a7800add04/documents?search=${searchValue}`,
      {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MDhjMTI5Ny03ZjRjLTRlZDgtYTczMy00OGEwZmFlODQwNzkiLCJlbWFpbCI6InRlc3R1c2VyMUB0ZXN0LmNvbSIsImlhdCI6MTc3NTU2Njk4NCwiZXhwIjoxNzc1NjUzMzg0fQ.VnoSUt0VvJago6hVYOSWd5KYX6WbD3zSp7Wgfm0rhtE`,
        },
      },
    );

    const data = await res.json();
    const items = data?.data.items || [];

    //  KEY FIX
    if (searchValue) {
      // replace completely for search
      setDocuments(items);
    } else {
      // merge only for normal fetch
      setDocuments((prev) => {
        const map = new Map(prev.map((doc) => [doc.id, doc]));

        items.forEach((doc: any) => {
          map.set(doc.id, doc);
        });

        return Array.from(map.values());
      });
    }

    if (items.length > 0 && !selectedDoc) {
      setSelectedDoc(items[0].id);
    }
  };
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchDocuments(search);
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    if (hasFetched.current) return;

    hasFetched.current = true;
    fetchDocuments();
  }, []);

  const currentDoc = documents.find((doc) => doc.id === selectedDoc);

  const handleCreateDocument = async () => {
    const res = await fetch(
      "http://localhost:3000/document/workspaces/87c3452e-5217-4223-9f0c-24a7800add04/documents",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MDhjMTI5Ny03ZjRjLTRlZDgtYTczMy00OGEwZmFlODQwNzkiLCJlbWFpbCI6InRlc3R1c2VyMUB0ZXN0LmNvbSIsImlhdCI6MTc3NTU2Njk4NCwiZXhwIjoxNzc1NjUzMzg0fQ.VnoSUt0VvJago6hVYOSWd5KYX6WbD3zSp7Wgfm0rhtE`,
        },
        body: JSON.stringify({ title: "Untitled Document" }),
      },
    );

    const response = await res.json();
    console.log("CREATE RESPONSE:", response);

    // handle both formats safely
    const newDoc = response.data || response;

    if (!newDoc?.id) return;

    const doc = {
      id: newDoc.id,
      title: newDoc.title,
    };

    //  INSTANT UI UPDATE
    setDocuments((prev) => [doc, ...prev]);

    //  SELECT NEW DOC
    setSelectedDoc(doc.id);

    send?.({
      type: "document-created",
      data: {
        workspaceId: "87c3452e-5217-4223-9f0c-24a7800add04",
        document: doc,
      },
    });
  };

  const handleDeleteDocument = async (id: string) => {
    await fetch(`http://localhost:3000/document/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MDhjMTI5Ny03ZjRjLTRlZDgtYTczMy00OGEwZmFlODQwNzkiLCJlbWFpbCI6InRlc3R1c2VyMUB0ZXN0LmNvbSIsImlhdCI6MTc3NTU2Njk4NCwiZXhwIjoxNzc1NjUzMzg0fQ.VnoSUt0VvJago6hVYOSWd5KYX6WbD3zSp7Wgfm0rhtE`,
      },
    });

    setDocuments((prev) => {
      const updated = prev.filter((doc) => doc.id !== id);

      if (selectedDoc === id) {
        setSelectedDoc(updated.length > 0 ? updated[0].id : null);
      }

      return updated;
    });

    send?.({
      type: "document-deleted",
      data: {
        workspaceId: "87c3452e-5217-4223-9f0c-24a7800add04",
        documentId: id,
      },
    });
  };

  const handleRenameDocument = async (id: string, title: string) => {
    if (!title.trim()) return;

    //  Optimistic update
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, title } : doc)),
    );

    //  API call
    await fetch(`http://localhost:3000/document/${id}/title`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MDhjMTI5Ny03ZjRjLTRlZDgtYTczMy00OGEwZmFlODQwNzkiLCJlbWFpbCI6InRlc3R1c2VyMUB0ZXN0LmNvbSIsImlhdCI6MTc3NTU2Njk4NCwiZXhwIjoxNzc1NjUzMzg0fQ.VnoSUt0VvJago6hVYOSWd5KYX6WbD3zSp7Wgfm0rhtE`,
      },
      body: JSON.stringify({ title }),
    });

    send?.({
      type: "title-change",
      data: {
        documentId: id,
        title,
        workspaceId: "87c3452e-5217-4223-9f0c-24a7800add04",
      },
    });
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
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

      {/* Editor */}
      <div className="flex-1">
        {selectedDoc ? (
          <Editor documentId={selectedDoc} title={currentDoc?.title || ""} />
        ) : (
          <div className="p-6">Select a document</div>
        )}
      </div>
    </div>
  );
}

export default App;
