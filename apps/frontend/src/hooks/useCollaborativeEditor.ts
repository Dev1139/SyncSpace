import { useEffect, useRef, useState } from "react";
import * as awarenessProtocol from "y-protocols/awareness";
import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import { Editor as TiptapEditor } from "@tiptap/core";
import { createCursorPlugin } from "../components/editor/createCursorPlugin";
import type { WSContextType } from "../context/WebContextProvider";
import { useWorkspace } from "../context/WorkspaceContext";

type PresenceUser = {
  name: string;
  color: string;
};

export const useCollaborativeEditor = (
  documentId: string,
  wsContext: WSContextType | null,
) => {
  const ws = wsContext?.ws;
  const addListener = wsContext?.addListener;
  const removeListener = wsContext?.removeListener;
  const send = wsContext?.send;

  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [editor, setEditor] = useState<any>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const activeDocumentIdRef = useRef<string | null>(null);
  const awarenessRef = useRef<Awareness | null>(null);
  const { currentWorkspaceId } = useWorkspace();

  useEffect(() => {
    if (!ws || !addListener || !removeListener) return;

    const handler = (msg: any) => {
      if (msg.documentId && msg.documentId !== activeDocumentIdRef.current) {
        return;
      }

      if (msg.type === "sync" || msg.type === "doc-update") {
        if (!ydocRef.current) return;

        const update = new Uint8Array(msg.update);
        Y.applyUpdate(ydocRef.current, update, "remote");
      }

      if (msg.type === "awareness-update" && awarenessRef.current) {
        const update = new Uint8Array(msg.update);
        awarenessProtocol.applyAwarenessUpdate(awarenessRef.current, update, ws);
      }
    };

    addListener(handler);
    return () => removeListener(handler);
  }, [ws, addListener, removeListener]);

  useEffect(() => {
    if (!ws || !documentId || !send || !currentWorkspaceId || !editor) return;
    if (activeDocumentIdRef.current !== documentId) return;

    send({
      type: "join-document",
      data: {
        documentId,
        workspaceId: currentWorkspaceId,
      },
    });
  }, [ws, documentId, send, currentWorkspaceId, editor]);

  useEffect(() => {
    if (!documentId) return;

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;
    activeDocumentIdRef.current = documentId;
    awarenessRef.current = null;
    setUsers([]);

    const newEditor = new TiptapEditor({
      extensions: [
        StarterKit.configure({
          undoRedo: false,
        }),
        Collaboration.configure({
          document: ydoc,
          field: "content",
        }),
      ],
    });

    setEditor(newEditor);

    return () => {
      newEditor.destroy();

      if (activeDocumentIdRef.current === documentId) {
        ydocRef.current = null;
      }
    };
  }, [documentId]);

  useEffect(() => {
    if (!editor || !documentId) return;
    const ydoc = ydocRef.current;
    if (!ydoc) return;

    const awareness = new Awareness(ydoc);
    awarenessRef.current = awareness;
    (editor as any).registerPlugin(createCursorPlugin(awareness));

    awareness.setLocalStateField("user", {
      name: "User " + Math.floor(Math.random() * 100),
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    });

    const updateCursor = () => {
      const { from, to } = editor.state.selection;
      awareness.setLocalStateField("cursor", {
        anchor: from,
        head: to,
      });
    };

    editor.on("selectionUpdate", updateCursor);
    updateCursor();

    const updateHandler = (update: Uint8Array, origin: any) => {
      if (origin === "remote") return;
      send?.({
        type: "doc-update",
        data: {
          documentId,
          update: Array.from(update),
        },
      });
    };

    ydoc.on("update", updateHandler);

    const awarenessHandler = ({ added, updated, removed }: any) => {
      const changed = added.concat(updated).concat(removed);
      const states = Array.from(awareness.getStates().values());
      const userList = states.map((s: any) => s.user).filter(Boolean);
      setUsers(userList);

      const update = awarenessProtocol.encodeAwarenessUpdate(awareness, changed);
      send?.({
        type: "awareness-update",
        data: {
          documentId,
          update: Array.from(update),
        },
      });
    };

    awareness.on("update", awarenessHandler);

    return () => {
      editor.off("selectionUpdate", updateCursor);
      ydoc.off("update", updateHandler);
      awareness.off("update", awarenessHandler);
      awareness.destroy();
      ydoc.destroy();
    };
  }, [editor, documentId, send]);

  return {
    editor,
    users,
  };
};
