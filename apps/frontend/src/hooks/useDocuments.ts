import { useCallback, useEffect, useRef, useState } from "react";
import { WORKSPACE_ID } from "../constants/appConfig";
import {
  createWorkspaceDocument,
  deleteDocumentById,
  fetchWorkspaceDocuments,
  updateDocumentTitleById,
} from "../services/documentApi";
import type { Doc } from "../types/document";

type WSHelpers = {
  send?: (data: unknown) => void;
  ws: WebSocket | null;
  addListener: ((cb: (msg: any) => void) => void) | undefined;
  removeListener: ((cb: (msg: any) => void) => void) | undefined;
};

export const useDocuments = ({
  send,
  ws,
  addListener,
  removeListener,
}: WSHelpers) => {
  const hasFetched = useRef(false);
  const [search, setSearch] = useState("");
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  useEffect(() => {
    if (!ws || !addListener || !removeListener) return;

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
        setSelectedDoc((prev) => (prev === documentId ? null : prev));
      }
    };

    addListener(handler);
    return () => removeListener(handler);
  }, [ws, addListener, removeListener]);

  const fetchDocuments = useCallback(
    async (searchValue = "") => {
      const items = await fetchWorkspaceDocuments(searchValue);

      if (searchValue) {
        setDocuments(items);
      } else {
        setDocuments((prev) => {
          const map = new Map(prev.map((doc) => [doc.id, doc]));
          items.forEach((doc) => {
            map.set(doc.id, doc);
          });
          return Array.from(map.values());
        });
      }

      setSelectedDoc((prevSelected) => {
        if (prevSelected) return prevSelected;
        return items.length > 0 ? items[0].id : null;
      });
    },
    [setDocuments, setSelectedDoc],
  );

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchDocuments(search);
    }, 300);

    return () => clearTimeout(delay);
  }, [search, fetchDocuments]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchDocuments();
  }, [fetchDocuments]);

  const handleCreateDocument = useCallback(async () => {
    const doc = await createWorkspaceDocument();
    if (!doc) return;

    setDocuments((prev) => [doc, ...prev]);
    setSelectedDoc(doc.id);

    send?.({
      type: "document-created",
      data: {
        workspaceId: WORKSPACE_ID,
        document: doc,
      },
    });
  }, [send]);

  const handleDeleteDocument = useCallback(
    async (id: string) => {
      await deleteDocumentById(id);

      setDocuments((prev) => {
        const updated = prev.filter((doc) => doc.id !== id);
        setSelectedDoc((current) => {
          if (current !== id) return current;
          return updated.length > 0 ? updated[0].id : null;
        });
        return updated;
      });

      send?.({
        type: "document-deleted",
        data: {
          workspaceId: WORKSPACE_ID,
          documentId: id,
        },
      });
    },
    [send],
  );

  const handleRenameDocument = useCallback(
    async (id: string, title: string) => {
      if (!title.trim()) return;

      setDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? { ...doc, title } : doc)),
      );

      await updateDocumentTitleById(id, title);

      send?.({
        type: "title-change",
        data: {
          documentId: id,
          title,
          workspaceId: WORKSPACE_ID,
        },
      });
    },
    [send],
  );

  const currentDoc = documents.find((doc) => doc.id === selectedDoc);

  return {
    search,
    setSearch,
    documents,
    selectedDoc,
    setSelectedDoc,
    currentDoc,
    handleCreateDocument,
    handleDeleteDocument,
    handleRenameDocument,
  };
};
