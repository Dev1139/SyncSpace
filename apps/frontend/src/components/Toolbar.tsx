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
    `inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-sm font-medium transition
   ${
     isActive
      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
   }`;

  return (
    <div className="mb-2 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
      {/* Bold */}
      <button
        className={buttonClass(editor.isActive("bold"))}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={16} />
      </button>

      {/* Italic */}
      <button
        className={buttonClass(editor.isActive("italic"))}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={16} />
      </button>

      {/* Heading */}
      <button
        className={buttonClass(editor.isActive("heading", { level: 1 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 size={16} />
      </button>

      {/* Bullet List */}
      <button
        className={buttonClass(editor.isActive("bulletList"))}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={16} />
      </button>
    </div>
  );
}
