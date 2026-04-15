import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Awareness } from "y-protocols/awareness";

export function createCursorPlugin(awareness: Awareness) {
  return new Plugin({
    props: {
      decorations(state) {
        const decorations: Decoration[] = [];

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
              Decoration.inline(Math.min(anchor, head), Math.max(anchor, head), {
                style: `background-color: ${color}33`,
              }),
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
