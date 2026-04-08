import { useEffect, useState } from "react";
import Editor from "./components/Editor";
import Sidebar from "./components/Sidebar";
import { useWS } from "./context/WebContextProvider";

type Doc = {
  id: string;
  title: string;
};

function App() {
  const ws = useWS();
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const handleTitleUpdate = (id: string, title: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, title } : doc)),
    );
  };

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "title-change") {
        const { documentId, title } = msg.data;

        setDocuments((prev) =>
          prev.map((doc) => (doc.id === documentId ? { ...doc, title } : doc)),
        );
      }
    };
  }, [ws]);

  useEffect(() => {
    if (!ws || documents.length === 0) return;

    documents.forEach((doc) => {
      ws.send(
        JSON.stringify({
          type: "join-document",
          data: doc.id,
        }),
      );
    });
  }, [ws, documents]);

  // Fetch documents
  useEffect(() => {
    fetch(
      "http://localhost:3000/document/workspaces/87c3452e-5217-4223-9f0c-24a7800add04/documents",
      {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MDhjMTI5Ny03ZjRjLTRlZDgtYTczMy00OGEwZmFlODQwNzkiLCJlbWFpbCI6InRlc3R1c2VyMUB0ZXN0LmNvbSIsImlhdCI6MTc3NTU2Njk4NCwiZXhwIjoxNzc1NjUzMzg0fQ.VnoSUt0VvJago6hVYOSWd5KYX6WbD3zSp7Wgfm0rhtE`,
        },
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data?.success) {
          console.error("API Error : ", data.message);
        }
        const items = data?.data.items || [];

        setDocuments(items);

        if (items.length > 0) {
          setSelectedDoc(items[0].id);
        }
      });
  }, []);

  const currentDoc = documents.find((doc) => doc.id === selectedDoc);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        documents={documents}
        selectedDoc={selectedDoc}
        onSelect={setSelectedDoc}
        onTitleUpdate={handleTitleUpdate}
      />

      {/* Editor */}
      <div className="flex-1">
        {selectedDoc ? (
          <Editor key={selectedDoc} documentId={selectedDoc} title={currentDoc?.title || ""}/>
        ) : (
          <div className="p-6">Select a document</div>
        )}
      </div>
    </div>
  );
}

export default App;
