export default function LoadingPage() {
  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-16 sm:px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="size-10 animate-spin rounded-full border-4 border-brand-border border-t-brand-red"
          role="status"
          aria-label="Cargando"
        />
        <p className="text-sm text-brand-muted">Cargando contenido…</p>
      </div>
    </main>
  );
}
