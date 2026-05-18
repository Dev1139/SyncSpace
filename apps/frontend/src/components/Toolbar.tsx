import { useEffect, useState } from "react";
import { Bold, Italic, Heading1, List } from "lucide-react";

export default function Toolbar({ editor }: any) {
  const [, setUpdate] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const update = () => {
      setUpdate((prev) => prev + 1); //  force re-render
    };

    editor.on("selectionUpdate", update);
    editor.on("transaction", update);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor]);

  if (!editor) return null;

  const buttonClass = (isActive: boolean) =>
    `inline-flex h-8 w-8 items-center justify-center rounded border text-sm font-medium transition
   ${
     isActive
       ? "border-primary bg-primary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
       : "border-border2 bg-surface text-muted hover:bg-surface3 hover:text-text"
   }`;

  return (
    <div className="mb-2 flex flex-wrap gap-2 rounded border border-border bg-void p-2">
      <button
        className={buttonClass(editor.isActive("bold"))}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <Bold size={16} />
      </button>

      <button
        className={buttonClass(editor.isActive("italic"))}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <Italic size={16} />
      </button>

      <button
        className={buttonClass(editor.isActive("heading", { level: 1 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="Heading"
      >
        <Heading1 size={16} />
      </button>

      <button
        className={buttonClass(editor.isActive("bulletList"))}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet list"
      >
        <List size={16} />
      </button>
    </div>
  );
}
