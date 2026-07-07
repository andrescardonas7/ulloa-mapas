import Link from "next/link";

import { Hero } from "@/components/home/Hero";

const highlights = [
  {
    title: "Mapas interactivos",
    description:
      "Consulta amenazas, exposición y análisis de riesgo en un visor centralizado.",
    href: "/visor",
    cta: "Ir al visor",
  },
  {
    title: "Indicadores y dashboards",
    description:
      "Visualiza estadísticas e indicadores clave para la toma de decisiones.",
    href: "/dashboards",
    cta: "Ver dashboards",
  },
  {
    title: "Documentos y datos",
    description:
      "Descarga metodologías, planes y datos abiertos para consulta y análisis.",
    href: "/descargas",
    cta: "Ir a descargas",
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
