import type { DocumentItem } from "@/lib/types";

interface DocumentCardProps {
  document: DocumentItem;
}

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
  }).format(new Date(isoDate));
}

export function DocumentCard({ document }: DocumentCardProps) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-brand-border bg-surface p-5 shadow-sm transition hover:border-brand-red hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-brand-red-soft px-2.5 py-1 text-xs font-semibold text-brand-red-text">
          {document.category}
        </span>
        <span className="text-xs text-brand-muted">{document.sizeLabel}</span>
      </div>
      <h2 className="mt-3 text-lg font-semibold text-brand-dark">
        {document.title}
      </h2>
      <p className="mt-2 flex-1 text-pretty text-sm leading-relaxed text-brand-muted">
        {document.description}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-brand-border pt-4">
        <time className="text-xs text-brand-muted" dateTime={document.publishedAt}>
          {formatDate(document.publishedAt)}
        </time>
        <a
          href={document.url}
          className="inline-flex items-center rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-red-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
          download
        >
          Descargar
        </a>
      </div>
    </article>
  );
}
