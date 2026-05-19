import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Awareness } from "y-protocols/awareness";

export function createCursorPlugin(awareness: Awareness) {
  return new Plugin({
    props: {
      decorations(state) {
        const decorations: Decoration[] = [];
        const renderedUsers = new Set<string>();

        awareness.getStates().forEach((clientState: any, clientId: number) => {
          if (clientId === awareness.clientID) return;
          if (!clientState.cursor || !clientState.user) return;
          const presenceKey = clientState.user.id || String(clientId);

          if (renderedUsers.has(presenceKey)) return;

          renderedUsers.add(presenceKey);

          const { anchor, head } = clientState.cursor;
          const { name, color } = clientState.user;
          const safeAnchor = Math.max(0, Math.min(anchor, state.doc.content.size));
          const safeHead = Math.max(0, Math.min(head, state.doc.content.size));

          if (!Number.isFinite(safeAnchor) || !Number.isFinite(safeHead)) {
            return;
          }

          const cursor = document.createElement("span");
          cursor.style.position = "absolute";
          cursor.style.width = "2px";
          cursor.style.height = "1.2em";
          cursor.style.background = color;
          cursor.style.color = "white";
          cursor.style.padding = "0";
          cursor.style.fontSize = "10px";
          cursor.style.borderRadius = "9999px";
          cursor.style.whiteSpace = "nowrap";
          cursor.style.transform = "translateY(2px)";
          cursor.style.boxShadow = "0 0 0 1px rgba(2,6,23,0.3)";

          const label = document.createElement("div");
          label.textContent = name;
          label.style.position = "absolute";
          label.style.top = "-16px";
          label.style.left = "2px";
          label.style.background = color;
          label.style.color = "#051424";
          label.style.fontSize = "10px";
          label.style.lineHeight = "1";
          label.style.padding = "2px 5px";
          label.style.borderRadius = "4px";
          label.style.boxShadow = "0 12px 24px rgba(2,6,23,0.45)";
          label.style.fontWeight = "600";
          label.style.pointerEvents = "none";
          label.style.whiteSpace = "nowrap";
          label.style.opacity = "0.92";
          cursor.appendChild(label);

          if (safeAnchor !== safeHead) {
            decorations.push(
              Decoration.inline(
                Math.min(safeAnchor, safeHead),
                Math.max(safeAnchor, safeHead),
                {
                  style: `background-color: ${color}33`,
                },
              ),
            );
          }

          decorations.push(
            Decoration.widget(safeAnchor, cursor, {
              key: `cursor-${clientId}`,
            }),
          );
        });

        return DecorationSet.create(state.doc, decorations);
      },
    },
  });
}
