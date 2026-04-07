import { useEffect, useState } from "react";
import Editor from "./components/Editor";
import Sidebar from "./components/Sidebar";

type Doc = {
  id: string;
  title: string;
};

function App() {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const handleTitleUpdate = (id: string, title: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, title } : doc)),
    );
  };

  // 🔥 Fetch documents
  useEffect(() => {
    fetch(
      "http://localhost:3000/document/workspaces/d8779cef-4ebf-47f3-9b1a-17d5aaa9fea1/documents",
      {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGQ5MTZmZi04NmM1LTRlMmQtODdjOS1iYmQwY2Q1MmZjZjciLCJlbWFpbCI6InVzZXJBQHRlc3QuY29tIiwiaWF0IjoxNzc1NDc0Nzk5LCJleHAiOjE3NzU1NjExOTl9.UdwYjNAeSPo2BcTdffI-xyfSigW8DYoRMs_u-GThO_Q`,
        },
      },
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("looking into data ", data);
        setDocuments(data.data.items);

        if (data.data.length > 0) {
          setSelectedDoc(data.data.items[0].id);
        }
      });
  }, []);

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:3001");
    ws.onopen = () => {
      console.log("Parent WS connected");

      // 🔥 JOIN ALL DOCUMENTS
      documents.forEach((doc) => {
        ws.send(
          JSON.stringify({
            type: "join-document",
            data: doc.id,
          }),
        );
      });
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "title-change") {
        const { documentId, title } = msg.data;

        // 🔥 THIS updates sidebar instantly
        setDocuments((prev) =>
          prev.map((doc) => (doc.id === documentId ? { ...doc, title } : doc)),
        );
      }
    };

    return () => {
      ws.close();
    };
  }, [documents]);

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
          <Editor key={selectedDoc} documentId={selectedDoc} />
        ) : (
          <div className="p-6">Select a document</div>
        )}
      </div>
    </div>
  );
}

export default App;
