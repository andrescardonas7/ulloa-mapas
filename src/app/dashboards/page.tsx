import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { MapViewerTabs } from "@/components/maps/MapViewerTabs";
import { dashboardMaps, resolveMapItems } from "@/lib/mapConfig";

export const metadata: Metadata = {
  title: "Dashboards",
  description: "Indicadores y estadísticas de gestión del riesgo en Ulloa.",
};

export default function DashboardsPage() {
  const maps = resolveMapItems(dashboardMaps);

  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <PageHeader
        title="Dashboards"
        description="Indicadores, gráficos y estadísticas del municipio. Los dashboards se embeben desde la plataforma GIS configurada (ArcGIS Online, CARTO o QGIS Server)."
      />
      <MapViewerTabs
        maps={maps}
        emptyMessage="Configura las URLs de los dashboards en .env.local para visualizarlos aquí."
      />
    </main>
  );
}
