import React from "react";

export default function Toolbar({ editor }: any) {
  if (!editor) return null;

  return (
    <div style={{
      borderBottom: "1px solid #ccc",
      padding: "8px",
      display: "flex",
      gap: "8px",
      background: "#f5f5f5"
    }}>
      <button onClick={() => editor.chain().focus().toggleBold().run()} className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-sm font-medium">
        Bold
      </button>

      <button className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-sm font-medium" onClick={() => editor.chain().focus().toggleItalic().run()}>
        Italic
      </button>

      <button className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-sm font-medium" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        H1
      </button>

      <button className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-sm font-medium" onClick={() => editor.chain().focus().toggleBulletList().run()}>
        • List
      </button>
    </div>
  );
}