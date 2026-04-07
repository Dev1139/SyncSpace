import { useEffect, useState } from "react";
import Editor from "./components/Editor";

function App() {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  // 🔥 TEMP: auto set document ID
  useEffect(() => {
    setSelectedDoc("dccdf1f9-04f2-45d9-86c6-8097b06a231d"); // 👈 your doc id
  }, []);

  return (
    <>
      {selectedDoc ? (
        <Editor documentId={selectedDoc} />
      ) : (
        <div>Loading document...</div>
      )}
    </>
  );
}

export default App;