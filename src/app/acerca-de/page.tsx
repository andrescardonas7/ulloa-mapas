import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Acerca de",
  description:
    "Qué es Ulloa en Mapas, su propósito y alcance como portal de gestión del riesgo.",
};

const features = [
  "Acceso público y libre a mapas de gestión del riesgo.",
  "Visualización de amenazas, exposición y análisis de riesgo.",
  "Descarga de documentos técnicos y datos abiertos.",
  "Diseño responsive para móvil, tablet y escritorio.",
];

export default function AcercaDePage() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6"
    >
      <PageHeader
        title="Acerca de Ulloa en Mapas"
        description="Portal web público de información geográfica para la gestión del riesgo de desastres en el municipio de Ulloa, Valle del Cauca."
      />

      <div className="space-y-6">
        <section className="rounded-xl border border-brand-border bg-surface p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-dark">¿Qué es?</h2>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-brand-muted">
            Ulloa en Mapas es una plataforma que centraliza la información
            geográfica relacionada con la gestión del riesgo de desastres. Está
            dirigida a ciudadanos, funcionarios públicos, estudiantes e
            investigadores que necesiten consultar mapas, indicadores y
            documentación del municipio.
          </p>
        </section>

        <section className="rounded-xl border border-brand-border bg-surface p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-dark">Propósito</h2>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-brand-muted">
            Facilitar el acceso a información territorial para la prevención,
            el conocimiento del riesgo y la planeación. Los mapas se publican
            desde plataformas GIS (ArcGIS Online, CARTO o QGIS Server) y se
            integran en este portal mediante visores embebidos.
          </p>
        </section>

        <section className="rounded-xl border border-brand-border bg-surface p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-dark">
            Características
          </h2>
          <ul className="mt-4 space-y-2">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-pretty text-sm leading-relaxed text-brand-muted"
              >
                <span
                  aria-hidden
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-red"
                />
                {feature}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-brand-red-soft bg-brand-red-soft p-6">
          <h2 className="text-xl font-semibold text-brand-dark">
            Empieza a explorar
          </h2>
          <p className="mt-3 text-pretty text-sm text-brand-muted">
            Consulta los mapas interactivos o descarga la documentación
            disponible.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/visor"
              className="rounded-xl bg-brand-red px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-red-hover"
            >
              Ir al visor
            </Link>
            <Link
              href="/descargas"
              className="rounded-xl border border-brand-red bg-surface px-4 py-2.5 text-sm font-semibold text-brand-red transition hover:bg-white"
            >
              Ver descargas
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
