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
import { useAuth } from "../context/AuthContext";

type PresenceUser = {
  id?: string;
  clientId: number;
  name: string;
  color: string;
};

export const useCollaborativeEditor = (
  documentId: string,
  wsContext: WSContextType | null,
  canEdit = true,
) => {
  const ws = wsContext?.ws;
  const addListener = wsContext?.addListener;
  const removeListener = wsContext?.removeListener;
  const send = wsContext?.send;

  const { user } = useAuth();

  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [editor, setEditor] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const ydocRef = useRef<Y.Doc | null>(null);
  const activeDocumentIdRef = useRef<string | null>(null);
  const awarenessRef = useRef<Awareness | null>(null);
  const { currentWorkspaceId } = useWorkspace();
  const connected = ws?.readyState === WebSocket.OPEN;

  useEffect(() => {
    if (!connected) {
      setUsers([]);
    }
  }, [connected]);

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
        awarenessProtocol.applyAwarenessUpdate(
          awarenessRef.current,
          update,
          ws,
        );
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
      editable: canEdit,
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
  }, [documentId, canEdit]);

  useEffect(() => {
    editor?.setEditable(canEdit);
  }, [editor, canEdit]);

  useEffect(() => {
    if (!editor || !documentId) return;
    const ydoc = ydocRef.current;
    if (!ydoc) return;

    const awareness = new Awareness(ydoc);
    awarenessRef.current = awareness;
    (editor as any).registerPlugin(createCursorPlugin(awareness));

    const userColor =
      "#" +
      (
        (user?.id || "syncspace")
          .split("")
          .reduce((acc, char) => char.charCodeAt(0) + acc, 0) % 16777215
      )
        .toString(16)
        .padStart(6, "0");

    awareness.setLocalStateField("user", {
      id: user?.id,
      name: user?.name || "Anonymous",
      email: user?.email,
      color: userColor,
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
      if (!canEdit) return;
      setSaving(true);
      send?.({
        type: "doc-update",
        data: {
          documentId,
          update: Array.from(update),
        },
      });
      setTimeout(() => {
        setSaving(false);
      }, 500);
    };

    ydoc.on("update", updateHandler);

    const awarenessHandler = ({ added, updated, removed }: any) => {
      const changed = added.concat(updated).concat(removed);
      const userMap = new Map<string, PresenceUser>();

      awareness.getStates().forEach((state: any, clientId) => {
        if (!state.user) return;

        const key = state.user.id || String(clientId);

        userMap.set(key, {
          id: state.user.id,
          clientId,
          name: state.user.name,
          color: state.user.color,
        });
      });

      const userList = Array.from(userMap.values());
      setUsers(userList);

      const update = awarenessProtocol.encodeAwarenessUpdate(
        awareness,
        changed,
      );
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
      awareness.setLocalState(null);
      editor.off("selectionUpdate", updateCursor);
      ydoc.off("update", updateHandler);
      awareness.off("update", awarenessHandler);
      awareness.destroy();
      ydoc.destroy();
      setUsers([]);
    };
  }, [canEdit, editor, documentId, send, user?.email, user?.id, user?.name]);

  return {
    editor,
    users,
    saving,
    connected,
  };
};
