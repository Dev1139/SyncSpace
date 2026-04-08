import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Plugin } from "prosemirror-state";
import * as awarenessProtocol from "y-protocols/awareness";
import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";
import { Editor as TiptapEditor } from "@tiptap/core";
import Toolbar from "./Toolbar";
import { useWS } from "../context/WebContextProvider";
// import { BubbleMenu } from "@tiptap/react";

type Props = {
  documentId: string;
  title: string;
};
// const documentId = "dccdf1f9-04f2-45d9-86c6-8097b06a231d";

function createCursorPlugin(awareness: Awareness) {
  return new Plugin({
    props: {
      decorations(state) {
        const decorations: any[] = [];

        awareness.getStates().forEach((clientState: any, clientId: number) => {
          if (clientId === awareness.clientID) return;
          if (!clientState.cursor || !clientState.user) return;

          const { anchor, head } = clientState.cursor;
          const { name, color } = clientState.user;

          const cursor = document.createElement("span");
          cursor.style.position = "absolute";
          cursor.style.background = color;
          cursor.style.color = "white";
          cursor.style.padding = "2px 6px";
          cursor.style.fontSize = "12px";
          cursor.style.borderRadius = "6px";
          cursor.style.whiteSpace = "nowrap";
          cursor.style.transform = "translateY(-100%)";
          cursor.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";

          const label = document.createElement("div");
          label.textContent = name;
          label.style.position = "absolute";
          label.style.top = "-24px";
          label.style.left = "0";
          label.style.background = color;
          label.style.color = "white";
          label.style.fontSize = "11px";
          label.style.padding = "4px 8px";
          label.style.borderRadius = "8px";
          label.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
          label.style.fontWeight = "500";
          label.style.transform = "translateY(-140%)";
          label.style.pointerEvents = "none";
          label.style.whiteSpace = "nowrap";
          label.style.opacity = "0.95";

          cursor.appendChild(label);

          if (anchor !== head) {
            decorations.push(
              Decoration.inline(
                Math.min(anchor, head),
                Math.max(anchor, head),
                {
                  style: `background-color: ${color}33`,
                },
              ),
            );
          }

          decorations.push(
            Decoration.widget(anchor, cursor, {
              key: `cursor-${clientId}`,
            }),
          );
        });

        return DecorationSet.create(state.doc, decorations);
      },
    },
  });
}

export default function Editor({ documentId, title }: Props) {
  const wsContext = useWS();

  const ws = wsContext?.ws;
  const addListener = wsContext?.addListener;
  const removeListener = wsContext?.removeListener;

  const [localTitle, setLocalTitle] = useState("Untitled Document");

  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  const [users, setUsers] = useState<any[]>([]);
  const ydocRef = useRef<Y.Doc>(new Y.Doc());
  const documentIdRef = useRef(documentId);

  const awarenessRef = useRef<Awareness | null>(null);

  const [editor, setEditor] = useState<any>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!ws) return;

    const handler = (msg: any) => {
      // 🔥 INITIAL LOAD
      if (msg.type === "sync") {
        const update = new Uint8Array(msg.update);
        Y.applyUpdate(ydocRef.current, update, "remote");
      }

      // 🔥 REALTIME UPDATE
      if (msg.type === "doc-update") {
        const update = new Uint8Array(msg.update);
        Y.applyUpdate(ydocRef.current, update, "remote");
      }

      // 🔥 AWARENESS
      if (msg.type === "awareness-update") {
        const update = new Uint8Array(msg.update);

        awarenessProtocol.applyAwarenessUpdate(
          awarenessRef.current!,
          update,
          ws,
        );
      }
    };

    addListener(handler);

    return () => removeListener(handler);
  }, [ws]);

  useEffect(() => {
    documentIdRef.current = documentId;
  }, [documentId]);

  useEffect(() => {
    if (!ws || !documentId) return;

    ws.send(
      JSON.stringify({
        type: "join-document",
        data: documentId,
      }),
    );
  }, [ws, documentId]);

  useEffect(() => {
    if (!documentId) return;

    const fetchTitle = async () => {
      const res = await fetch(`http://localhost:3000/document/${documentId}`, {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MDhjMTI5Ny03ZjRjLTRlZDgtYTczMy00OGEwZmFlODQwNzkiLCJlbWFpbCI6InRlc3R1c2VyMUB0ZXN0LmNvbSIsImlhdCI6MTc3NTU2Njk4NCwiZXhwIjoxNzc1NjUzMzg0fQ.VnoSUt0VvJago6hVYOSWd5KYX6WbD3zSp7Wgfm0rhtE`,
        },
      });
      const data = await res.json();
      console.log("Fetched Doc: ", data);
      setLocalTitle(data.data.title || "Untitled Document");
      isFirstLoad.current = true;
    };

    fetchTitle();
  }, [documentId]);

  useEffect(() => {
    if (!documentId) return;

    if (!title || title.trim() === "") return;

    // skip first load (VERY IMPORTANT)
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    const timeout = setTimeout(async () => {
      await fetch(`http://localhost:3000/document/${documentId}/title`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MDhjMTI5Ny03ZjRjLTRlZDgtYTczMy00OGEwZmFlODQwNzkiLCJlbWFpbCI6InRlc3R1c2VyMUB0ZXN0LmNvbSIsImlhdCI6MTc3NTU2Njk4NCwiZXhwIjoxNzc1NjUzMzg0fQ.VnoSUt0VvJago6hVYOSWd5KYX6WbD3zSp7Wgfm0rhtE`,
        },
        body: JSON.stringify({ title }),
      });
    }, 800);

    return () => clearTimeout(timeout);
  }, [title]);

  useEffect(() => {
    if (editor) return;

    const newEditor = new TiptapEditor({
      extensions: [
        StarterKit.configure({ history: false }),
        Collaboration.configure({
          document: ydocRef.current, // temporary fix
          field: "content",
        }),
      ],
      onCreate() {},
    });

    setEditor(newEditor);
  }, []);

  useEffect(() => {
    if (!editor || !documentId) return;

    console.log("Switching document:", documentId);

    // 🔥 CLEAN OLD CONNECTION

    // 🔥 CREATE NEW Y.Doc
    const ydoc = ydocRef.current;
    ydocRef.current = ydoc;

    const awareness = new Awareness(ydoc);
    (editor as any).registerPlugin(createCursorPlugin(awareness));
    awarenessRef.current = awareness;

    // 👤 user identity
    awareness.setLocalStateField("user", {
      name: "User " + Math.floor(Math.random() * 100),
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    });

    // 🧠 cursor tracking
    const updateCursor = () => {
      const { from, to } = editor.state.selection;

      awareness.setLocalStateField("cursor", {
        anchor: from,
        head: to,
      });
    };

    editor.on("selectionUpdate", updateCursor);
    updateCursor();

    // 📤 SEND DOC UPDATES
    const updateHandler = (update: Uint8Array, origin: any) => {
      if (origin === "remote") return;

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "doc-update",
            data: {
              documentId,
              update: Array.from(update),
            },
          }),
        );
      }
    };

    ydoc.on("update", updateHandler);

    // 📤 SEND AWARENESS
    const awarenessHandler = ({ added, updated, removed }: any) => {
      const changed = added.concat(updated).concat(removed);
      const states = Array.from(awareness.getStates().values());

      const userList = states.map((s: any) => s.user).filter(Boolean);

      setUsers(userList);

      const update = awarenessProtocol.encodeAwarenessUpdate(
        awareness,
        changed,
      );

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "awareness-update",
            data: {
              documentId,
              update: Array.from(update),
            },
          }),
        );
      }
    };

    awareness.on("update", awarenessHandler);

    // 🧹 CLEANUP
    return () => {
      editor.off("selectionUpdate", updateCursor);
      ydoc.off("update", updateHandler);
      awareness.off("update", awarenessHandler);
    };
  }, [editor, documentId]);

  if (!editor) return <div>Loading editor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="flex items-center justify-between mb-4">
        <input
          value={localTitle === "Untitled Document" ? "" : localTitle}
          onChange={(e) => {
            const newTitle = e.target.value;
            setLocalTitle(newTitle);

            ws?.send(
              JSON.stringify({
                type: "title-change",
                data: {
                  documentId,
                  title: newTitle,
                },
              }),
            );
          }}
          onBlur={() => {
            if (!title.trim()) {
              setLocalTitle("Untitled Document");
            }
          }}
          className="text-xl font-semibold outline-none border-none bg-transparent"
          placeholder="Untitled Document"
        />

        <div className="flex gap-2">
          {users.map((user, index) => (
            <div
              key={index}
              className="text-white text-xs px-3 py-1 rounded-full"
              style={{ backgroundColor: user.color }}
            >
              {user.name}
            </div>
          ))}
        </div>
      </div>
      {/* Editor Card */}
      <div className="bg-white border rounded-lg shadow-sm p-6">
        {/* Toolbar */}
        <Toolbar editor={editor} />

        {/* Editor */}
        <div className="mt-4 prose prose-lg max-w-none">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
