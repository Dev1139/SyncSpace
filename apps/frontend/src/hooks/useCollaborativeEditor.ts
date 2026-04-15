import { useEffect, useRef, useState } from "react";
import * as awarenessProtocol from "y-protocols/awareness";
import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import { Editor as TiptapEditor } from "@tiptap/core";
import { WORKSPACE_ID } from "../constants/appConfig";
import { createCursorPlugin } from "../components/editor/createCursorPlugin";
import type { WSContextType } from "../context/WebContextProvider";

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
  const ydocRef = useRef<Y.Doc>(new Y.Doc());
  const awarenessRef = useRef<Awareness | null>(null);

  useEffect(() => {
    if (!ws || !addListener || !removeListener) return;

    const handler = (msg: any) => {
      if (msg.type === "sync" || msg.type === "doc-update") {
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
    if (!ws || !documentId || !send) return;

    send({
      type: "join-document",
      data: {
        documentId,
        workspaceId: WORKSPACE_ID,
      },
    });
  }, [ws, documentId, send]);

  useEffect(() => {
    if (!documentId) return;

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const newEditor = new TiptapEditor({
      extensions: [
        StarterKit,
        Collaboration.configure({
          document: ydoc,
          field: "content",
        }),
      ],
    });

    setEditor(newEditor);

    return () => {
      newEditor.destroy();
    };
  }, [documentId]);

  useEffect(() => {
    if (!editor || !documentId) return;

    const awareness = new Awareness(ydocRef.current);
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

    ydocRef.current.on("update", updateHandler);

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
      ydocRef.current.off("update", updateHandler);
      awareness.off("update", awarenessHandler);
    };
  }, [editor, documentId, send]);

  return {
    editor,
    users,
  };
};
