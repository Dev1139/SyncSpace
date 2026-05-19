import { EditorContent } from "@tiptap/react";
import Toolbar from "./Toolbar";
import { useWS } from "../context/WebContextProvider";
import ActiveUsers from "./editor/ActiveUsers";
import DocumentTitleInput from "./editor/DocumentTitleInput";
import { useDocumentTitleSync } from "../hooks/useDocumentTitleSync";
import { useCollaborativeEditor } from "../hooks/useCollaborativeEditor";
import EditorStatus from "./editor/EditorStatus";

type Props = {
  documentId: string;
  title: string;
  canEdit: boolean;
};

export default function Editor({ documentId, title, canEdit }: Props) {
  const wsContext = useWS();
  const send = wsContext?.send;
  const { editor, users, saving, connected } = useCollaborativeEditor(
    documentId,
    wsContext,
    canEdit,
  );
  const { localTitle, setLocalTitle } = useDocumentTitleSync(documentId, title);

  if (!editor) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 md:px-10 md:py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-4 rounded-lg border border-border bg-surface2 px-4 py-3 shadow-panel">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <DocumentTitleInput
              documentId={documentId}
              localTitle={localTitle}
              setLocalTitle={setLocalTitle}
              send={send}
              disabled={!canEdit}
            />
            <div className="flex flex-col items-end gap-2">
              <ActiveUsers users={users} />

              <EditorStatus connected={connected} saving={saving} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-gradient-to-b from-surface2 to-void p-3 shadow-panel sm:p-4 md:p-5">
          {canEdit && (
            <div className="rounded-2xl border border-border bg-surface/80 p-2 shadow-sm backdrop-blur">
              <Toolbar editor={editor} />
            </div>
          )}

          <div
            className={`${
              canEdit ? "mt-5" : ""
            } rounded-2xl border border-border bg-void/80 px-6 py-8 shadow-2xl backdrop-blur sm:px-10 sm:py-10 md:px-14 md:py-14`}
          >
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
