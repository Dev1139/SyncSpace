import { EditorContent } from "@tiptap/react";
import Toolbar from "./Toolbar";
import { useWS } from "../context/WebContextProvider";
import ActiveUsers from "./editor/ActiveUsers";
import DocumentTitleInput from "./editor/DocumentTitleInput";
import { useDocumentTitleSync } from "../hooks/useDocumentTitleSync";
import { useCollaborativeEditor } from "../hooks/useCollaborativeEditor";

type Props = {
  documentId: string;
  title: string;
};

export default function Editor({ documentId, title }: Props) {
  const wsContext = useWS();
  const send = wsContext?.send;
  const { editor, users } = useCollaborativeEditor(documentId, wsContext);
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
      <div className="mx-auto w-full max-w-content">
        <div className="mb-4 rounded-lg border border-border bg-surface2 px-4 py-3 shadow-panel">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <DocumentTitleInput
              documentId={documentId}
              localTitle={localTitle}
              setLocalTitle={setLocalTitle}
              send={send}
            />
            <ActiveUsers users={users} />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-gradient-to-b from-surface2 to-void p-3 shadow-panel sm:p-4 md:p-5">
          <Toolbar editor={editor} />

          <div className="mt-4 max-w-none rounded border border-border bg-void/80 p-4 sm:p-5 md:p-8">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
