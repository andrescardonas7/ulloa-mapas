import type { Metadata } from "next";

import { DocumentList } from "@/components/documents/DocumentList";
import { PageHeader } from "@/components/layout/PageHeader";
import { getDocumentCategories, getDocuments } from "@/lib/documents";

export const metadata: Metadata = {
  title: "Descargas",
  description:
    "Documentos, metodologías y datos abiertos de gestión del riesgo en Ulloa.",
};

export default function DescargasPage() {
  const documents = getDocuments();
  const categories = getDocumentCategories();

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6"
    >
      <PageHeader
        title="Descargas"
        description="Consulta y descarga documentos técnicos, planes, metodologías y datos abiertos relacionados con la gestión del riesgo de desastres."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <span
            key={category}
            className="rounded-full bg-brand-red-soft px-3 py-1 text-xs font-medium text-brand-red-text"
          >
            {category}
          </span>
        ))}
      </div>

      <DocumentList documents={documents} />

      <p className="mt-8 text-pretty text-sm text-brand-muted">
        Los archivos de ejemplo se reemplazarán cuando se defina el
        almacenamiento definitivo de documentos.
      </p>
    </main>
  );
}
