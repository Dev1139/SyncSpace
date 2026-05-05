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
          cursor.style.width = "2px";
          cursor.style.height = "1.35em";
          cursor.style.background = color;
          cursor.style.color = "white";
          cursor.style.padding = "0";
          cursor.style.fontSize = "12px";
          cursor.style.borderRadius = "9999px";
          cursor.style.whiteSpace = "nowrap";
          cursor.style.transform = "translateY(-10%)";
          cursor.style.boxShadow = "0 0 0 1px rgba(2,6,23,0.3)";

          const label = document.createElement("div");
          label.textContent = name;
          label.style.position = "absolute";
          label.style.top = "-22px";
          label.style.left = "0";
          label.style.background = color;
          label.style.color = "#051424";
          label.style.fontSize = "11px";
          label.style.padding = "3px 7px";
          label.style.borderRadius = "4px";
          label.style.boxShadow = "0 12px 24px rgba(2,6,23,0.45)";
          label.style.fontWeight = "700";
          label.style.transform = "translateY(-100%)";
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
