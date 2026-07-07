import Link from "next/link";

export function Hero() {
  return (
    <section className="rounded-2xl border border-brand-dark bg-brand-dark px-6 py-12 text-white shadow-sm sm:px-10 sm:py-16">
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase text-slate-100">
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-brand-sky"
          />
          Gestión del riesgo de desastres
        </p>
        <h1 className="mt-5 max-w-3xl text-balance text-4xl font-bold leading-tight text-white sm:text-5xl">
          Conoce el riesgo de{" "}
          <span className="text-brand-sky">tu municipio</span>
        </h1>
        <p className="mt-5 text-pretty text-lg leading-relaxed text-slate-200">
          Ulloa en Mapas reúne mapas, indicadores y documentos para que
          ciudadanos, funcionarios y estudiantes consulten información
          geográfica sobre amenazas, exposición y análisis de riesgo en Ulloa,
          Valle del Cauca.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/visor"
            className="inline-flex items-center justify-center rounded-xl bg-brand-red px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-red-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Explorar mapas
          </Link>
          <Link
            href="/descargas"
            className="inline-flex items-center justify-center rounded-xl border border-slate-500 bg-transparent px-6 py-3.5 text-sm font-semibold text-slate-100 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Ver documentos
          </Link>
        </div>
      </div>
    </section>
  );
}
