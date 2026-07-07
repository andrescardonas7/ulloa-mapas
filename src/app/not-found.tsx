import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6"
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-red">
        404
      </p>
      <h1 className="mt-3 text-balance text-3xl font-bold text-brand-dark">
        Página no encontrada
      </h1>
      <p className="mt-4 text-pretty text-brand-muted">
        La ruta que buscas no existe o fue movida. Revisa la URL o usa el menú
        principal para continuar.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-lg bg-brand-red px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-red-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
