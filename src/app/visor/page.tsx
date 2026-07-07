import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { MapViewerTabs } from "@/components/maps/MapViewerTabs";
import { resolveMapItems, viewerMaps } from "@/lib/mapConfig";

export const metadata: Metadata = {
  title: "Visor de mapas",
  description:
    "Mapas interactivos de gestión del riesgo de desastres en Ulloa.",
};

export default function VisorPage() {
  const maps = resolveMapItems(viewerMaps);

  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <PageHeader
        title="Visor de mapas"
        description="Explora los mapas de amenazas, exposición, vulnerabilidad y análisis de riesgo. Selecciona una capa para visualizarla. Solo un mapa se muestra a la vez para optimizar el rendimiento."
      />
      <MapViewerTabs maps={maps} />
    </main>
  );
}
