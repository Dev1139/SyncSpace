type Doc = {
  id: string;
  title: string;
};

type Props = {
  documents: Doc[];
  selectedDoc: string | null;
  onSelect: (id: string) => void;
  onTitleUpdate: (id: string, title: string) => void;
};

export default function Sidebar({ documents, selectedDoc, onSelect }: Props) {
  return (
    <div className="w-64 border-r bg-white p-4">
      <h2 className="font-semibold mb-4">Documents</h2>

      {documents.map((doc) => (
        <div
          key={doc.id}
          onClick={() => onSelect(doc.id)}
          className={`p-2 rounded cursor-pointer ${
            selectedDoc === doc.id ? "bg-blue-100" : "hover:bg-gray-100"
          }`}
        >
          {doc.title}
        </div>
      ))}
    </div>
  );
}
