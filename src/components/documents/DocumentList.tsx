import type { DocumentItem } from "@/lib/types";

import { DocumentCard } from "@/components/documents/DocumentCard";

interface DocumentListProps {
  documents: DocumentItem[];
}

export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
        No hay documentos disponibles por el momento.
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {documents.map((document) => (
        <li key={document.id}>
          <DocumentCard document={document} />
        </li>
      ))}
    </ul>
  );
}
