import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Documentación",
  description:
    "Marco normativo, protocolos y referencias de gestión del riesgo de desastres.",
};

const sections = [
  {
    title: "Marco normativo",
    items: [
      "Ley 1523 de 2012 — Política y gestión del riesgo de desastres en Colombia.",
      "Decreto 2157 de 2017 — Lineamientos para la gestión del riesgo.",
      "Normativa departamental y municipal aplicable al municipio de Ulloa.",
    ],
  },
  {
    title: "Planes y protocolos",
    items: [
      "Plan Municipal de Gestión del Riesgo de Desastres (PMGRD).",
      "Protocolos de respuesta ante emergencias.",
      "Procedimientos de actualización cartográfica.",
    ],
  },
  {
    title: "Metodología cartográfica",
    items: [
      "Proceso de conversión de datos desde File Geodatabase (.gdb).",
      "Criterios de clasificación de amenazas y niveles de riesgo.",
      "Fuentes de información y periodicidad de actualización.",
    ],
  },
];

export default function DocumentacionPage() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6"
    >
      <PageHeader
        title="Documentación"
        description="Referencias normativas, metodológicas y técnicas que sustentan la información publicada en Ulloa en Mapas."
      />

      <div className="space-y-6">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-xl border border-brand-border bg-surface p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-brand-dark">
              {section.title}
            </h2>
            <ul className="mt-4 space-y-2">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-pretty text-sm leading-relaxed text-brand-muted"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-red"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
