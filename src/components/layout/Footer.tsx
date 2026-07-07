import Link from "next/link";

import { mainNavItems } from "@/lib/navigation";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t-4 border-brand-red bg-slate-100 text-brand-dark">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2">
        <div>
          <p className="flex items-center gap-2 text-lg font-bold text-brand-dark">
            <span
              aria-hidden
              className="flex size-8 items-center justify-center rounded-lg bg-brand-red text-xs font-bold text-white"
            >
              UM
            </span>
            Ulloa en Mapas
          </p>
          <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-brand-muted">
            Portal público de información geográfica para la gestión del riesgo
            de desastres en el municipio de Ulloa, Valle del Cauca.
          </p>
          <p className="mt-3 text-pretty text-xs text-brand-muted">
            Este portal es informativo. En caso de emergencia, sigue las
            indicaciones de las autoridades competentes.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase text-brand-red-text">
            Navegación
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {mainNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-medium text-brand-dark transition hover:text-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-border bg-surface px-4 py-4 text-center text-xs text-brand-muted sm:px-6">
        © {currentYear} Ulloa en Mapas. Acceso público y libre.
      </div>
    </footer>
  );
}
