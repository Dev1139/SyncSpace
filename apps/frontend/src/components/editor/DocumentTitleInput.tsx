import { DEFAULT_DOCUMENT_TITLE, WORKSPACE_ID } from "../../constants/appConfig";

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
  return (
    <input
      value={localTitle === DEFAULT_DOCUMENT_TITLE ? "" : localTitle}
      onChange={(e) => {
        const newTitle = e.target.value;
        setLocalTitle(newTitle);

        send?.({
          type: "title-change",
          data: {
            documentId,
            title: newTitle,
            workspaceId: WORKSPACE_ID,
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
