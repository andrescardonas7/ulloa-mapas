import type { DocumentItem } from "@/lib/types";

/**
 * Fuente local de documentos. Reemplazar por API o almacenamiento
 * en la nube cuando se defina el backend de archivos.
 */
const documents: DocumentItem[] = [
  {
    id: "metodologia-riesgo",
    title: "Metodología de análisis de riesgo",
    category: "Metodología",
    description:
      "Documento técnico que describe el proceso de identificación y evaluación de amenazas.",
    url: "/documentos/ejemplo-metodologia.pdf",
    sizeLabel: "2.4 MB",
    publishedAt: "2025-11-15",
  },
  {
    id: "plan-contingencia",
    title: "Plan de contingencia municipal",
    category: "Planes",
    description:
      "Protocolos y procedimientos para la respuesta ante emergencias.",
    url: "/documentos/ejemplo-plan-contingencia.pdf",
    sizeLabel: "5.1 MB",
    publishedAt: "2025-10-02",
  },
  {
    id: "datos-abiertos",
    title: "Datos abiertos — capas vectoriales",
    category: "Datos abiertos",
    description:
      "Conjunto de datos geográficos de ejemplo en formato GeoJSON para descarga.",
    url: "/documentos/ejemplo-datos.geojson",
    sizeLabel: "1 KB",
    publishedAt: "2025-12-01",
  },
];

/**
 * Solo se sirven rutas locales bajo /documentos/. Evita que una futura
 * fuente externa (CMS, API) inyecte esquemas peligrosos o redirecciones.
 */
function isSafeDocumentUrl(url: string): boolean {
  return (
    url.startsWith("/documentos/") &&
    !url.includes("..") &&
    !url.startsWith("//")
  );
}

export function getDocuments(): DocumentItem[] {
  return documents
    .filter((doc) => isSafeDocumentUrl(doc.url))
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
}

export function getDocumentCategories(): string[] {
  const categories = new Set(documents.map((doc) => doc.category));
  return Array.from(categories).sort();
}
