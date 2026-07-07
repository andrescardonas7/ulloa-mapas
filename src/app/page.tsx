import Link from "next/link";

import { Hero } from "@/components/home/Hero";

const highlights = [
  {
    title: "Mapas interactivos",
    description:
      "Consulta amenazas, exposición y análisis de riesgo en un visor centralizado.",
    href: "/visor",
    cta: "Ir al visor",
    iconPath:
      "M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z",
  },
  {
    title: "Indicadores y dashboards",
    description:
      "Visualiza estadísticas e indicadores clave para la toma de decisiones.",
    href: "/dashboards",
    cta: "Ver dashboards",
    iconPath:
      "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
  },
  {
    title: "Documentos y datos",
    description:
      "Descarga metodologías, planes y datos abiertos para consulta y análisis.",
    href: "/descargas",
    cta: "Ir a descargas",
    iconPath:
      "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z",
  },
];

export default function HomePage() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6"
    >
      <Hero />

      <section className="mt-12" aria-labelledby="highlights-heading">
        <h2
          id="highlights-heading"
          className="text-balance text-2xl font-bold text-brand-dark"
        >
          ¿Qué puedes hacer aquí?
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item.href}
              className="flex flex-col rounded-xl border border-brand-border bg-surface p-6 shadow-sm transition hover:border-brand-red hover:shadow-md"
            >
              <span
                aria-hidden
                className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand-red-soft text-brand-red"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={item.iconPath}
                  />
                </svg>
              </span>
              <h3 className="text-lg font-semibold text-brand-dark">
                {item.title}
              </h3>
              <p className="mt-2 flex-1 text-pretty text-sm leading-relaxed text-brand-muted">
                {item.description}
              </p>
              <Link
                href={item.href}
                className="mt-4 inline-flex text-sm font-semibold text-brand-red hover:text-brand-red-hover"
              >
                {item.cta} →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section
        className="mt-12 rounded-xl border border-brand-yellow-border bg-brand-yellow-soft p-6"
        aria-labelledby="alert-heading"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-white"
          >
            !
          </span>
          <div>
            <h2
              id="alert-heading"
              className="text-balance text-lg font-semibold text-brand-dark"
            >
              Información importante
            </h2>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-brand-muted">
              Este portal es de carácter informativo. Para emergencias, sigue las
              indicaciones de las autoridades competentes. Los mapas se
              actualizan conforme avanza el proceso de gestión del riesgo en el
              municipio.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
