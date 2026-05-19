import { DEFAULT_DOCUMENT_TITLE } from "../../constants/appConfig";
import { useWorkspace } from "../../context/WorkspaceContext";

type DocumentTitleInputProps = {
  documentId: string;
  localTitle: string;
  setLocalTitle: (value: string) => void;
  send?: (data: unknown) => void;
  disabled?: boolean;
};

export default function DocumentTitleInput({
  documentId,
  localTitle,
  setLocalTitle,
  send,
  disabled = false,
}: DocumentTitleInputProps) {
  const { currentWorkspaceId } = useWorkspace();

  return (
    <input
      disabled={disabled}
      value={localTitle === DEFAULT_DOCUMENT_TITLE ? "" : localTitle}
      onChange={(e) => {
        if (disabled) return;

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
        if (disabled) return;

        if (!localTitle.trim()) {
          setLocalTitle(DEFAULT_DOCUMENT_TITLE);
        }
      }}
      className="w-full max-w-2xl rounded border border-transparent bg-transparent px-2 py-1 text-xl font-semibold text-text outline-none transition placeholder:text-subtle focus:border-primary/50 focus:bg-void focus:ring-2 focus:ring-primary/15 disabled:cursor-default disabled:opacity-100 sm:text-2xl"
      placeholder={DEFAULT_DOCUMENT_TITLE}
    />
  );
}
