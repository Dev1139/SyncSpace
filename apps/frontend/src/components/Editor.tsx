import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Plugin } from "prosemirror-state";
import * as awarenessProtocol from "y-protocols/awareness";
import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";

const documentId = "e0e1e19a-50c2-4410-8c07-46f1450c4cce";

function createCursorPlugin(awareness: Awareness) {
  return new Plugin({
    props: {
      decorations(state) {
        const decorations: any[] = [];

        awareness.getStates().forEach((clientState: any, clientId: number) => {
          console.log("CLIENT STATE:", clientState);
          if (clientId === awareness.clientID) return;
          if (!clientState.cursor || !clientState.user) return;

          const { anchor, head } = clientState.cursor;
          const { name, color } = clientState.user;

          const cursor = document.createElement("span");
          cursor.style.borderLeft = `2px solid ${color}`;
          cursor.style.pointerEvents = "none";
          cursor.style.zIndex = "10";
          cursor.style.marginLeft = "-1px";
          cursor.style.height = "100%";
          cursor.style.display = "inline-block";
          cursor.style.position = "relative";
          cursor.style.transition = "all 0.1s ease";

          const label = document.createElement("div");
          label.textContent = name;
          label.style.position = "absolute";
          label.style.top = "-24px";
          label.style.whiteSpace = "nowrap";
          label.style.left = "0";
          label.style.background = color;
          label.style.color = "white";
          label.style.fontSize = "10px";
          label.style.padding = "2px 4px";
          label.style.borderRadius = "4px";

          cursor.appendChild(label);
          if (anchor !== head) {
            decorations.push(
              Decoration.inline(
                Math.min(anchor, head),
                Math.max(anchor, head),
                {
                  style: `background-color: ${color}33; transition: all 0.1s ease;`
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

export default function Editor() {
  const ydocRef = useRef(new Y.Doc());
  const ydoc = ydocRef.current;
  const awarenessRef = useRef(new Awareness(ydoc));
  const awareness = awarenessRef.current;

  const wsRef = useRef<WebSocket | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Collaboration.configure({
        document: ydoc,
      }),
    ],
    editorProps: {
      attributes: {
        class: "editor",
      },
    },
    onCreate({ editor }) {
      editor.registerPlugin(createCursorPlugin(awareness));
    },
  });

  useEffect(() => {
    if (!editor) return;
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

    const ws = new WebSocket("ws://127.0.0.1:3001");
    wsRef.current = ws;

    const handleAwarenessUpdate = ({ added, updated, removed }: any) => {
      if (editor) {
        editor.view.dispatch(editor.state.tr); // FORCED RE-RENDER
      }
      const changedClients = added.concat(updated).concat(removed);

      const update = awarenessProtocol.encodeAwarenessUpdate(
        awareness,
        changedClients,
      );

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
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

    awareness.on("update", handleAwarenessUpdate);

    ws.onopen = () => {
      console.log("Connected");

      ws.send(
        JSON.stringify({
          type: "join-document",
          data: documentId,
        }),
      );
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "sync" || msg.type === "doc-update") {
        const update = new Uint8Array(msg.update);
        Y.applyUpdate(ydoc, update);
      }

      if (msg.type === "awareness-update") {
        const update = new Uint8Array(msg.update);
        awarenessProtocol.applyAwarenessUpdate(awareness, update, ws);
      }
    };
    console.log("AWARENESS STATES:", awareness.getStates());

    ydoc.on("update", (update: Uint8Array) => {
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
    });

    return () => {
      editor.off("selectionUpdate", updateCursor);
      awareness.off("update", handleAwarenessUpdate); // 🔥 IMPORTANT
      ws.close();
    };
  }, [editor]);

  if (!editor) {
    return <div style={{ color: "white" }}>Loading editor...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ color: "white" }}>Editor</h2>

      <div
        style={{
          border: "2px solid red",
          minHeight: "200px",
          padding: "10px",
          background: "white",
          color: "black",
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
