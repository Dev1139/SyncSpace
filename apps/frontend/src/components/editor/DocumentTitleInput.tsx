import { DEFAULT_DOCUMENT_TITLE } from "../../constants/appConfig";
import { useWorkspace } from "../../context/WorkspaceContext";

type DocumentTitleInputProps = {
  documentId: string;
  localTitle: string;
  setLocalTitle: (value: string) => void;
  send?: (data: unknown) => void;
};

export default function DocumentTitleInput({
  documentId,
  localTitle,
  setLocalTitle,
  send,
}: DocumentTitleInputProps) {
  const { currentWorkspaceId } = useWorkspace();

  return (
    <input
      value={localTitle === DEFAULT_DOCUMENT_TITLE ? "" : localTitle}
      onChange={(e) => {
        const newTitle = e.target.value;

        setLocalTitle(newTitle);

        // Prevent sending if workspace not ready
        if (!currentWorkspaceId) return;

        send?.({
          type: "title-change",
          data: {
            documentId,
            title: newTitle,
            workspaceId: currentWorkspaceId,
          },
        });
      }}
      onBlur={() => {
        if (!localTitle.trim()) {
          setLocalTitle(DEFAULT_DOCUMENT_TITLE);
        }
      }}
      className="w-full max-w-2xl rounded-lg border border-transparent bg-transparent px-2 py-1 text-2xl font-semibold tracking-tight text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-200 focus:bg-white"
      placeholder={DEFAULT_DOCUMENT_TITLE}
    />
  );
}