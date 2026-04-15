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

  if (!editor) return <div>Loading editor...</div>;

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm md:px-5">
          <div className="flex items-center justify-between gap-4">
            <DocumentTitleInput
              documentId={documentId}
              localTitle={localTitle}
              setLocalTitle={setLocalTitle}
              send={send}
            />
            <ActiveUsers users={users} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <Toolbar editor={editor} />

          <div className="mt-4 max-w-none rounded-xl border border-slate-100 bg-slate-50/40 p-4 md:p-6">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
