"use client";

import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {

  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6"
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-red">
        Error inesperado
      </p>
      <h1 className="mt-3 text-balance text-3xl font-bold text-brand-dark">
        Algo salió mal
      </h1>
      <p className="mt-4 text-pretty text-brand-muted">
        No pudimos cargar esta página. Puedes intentar de nuevo o volver al
        inicio del portal.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-brand-red px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-red-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="rounded-lg border border-brand-border bg-surface px-5 py-2.5 text-sm font-semibold text-brand-dark transition hover:border-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
