import type { MapConfig, MapViewItem } from "@/lib/types";

/**
 * Solo se aceptan URLs https absolutas como origen de iframe.
 * Bloquea esquemas peligrosos (javascript:, data:) y http en producción.
 */
function isValidEmbedUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol === "https:") {
    return true;
  }
  // Permitir http solo en desarrollo (p. ej. QGIS Server local).
  return url.protocol === "http:" && process.env.NODE_ENV !== "production";
}

export function getMapUrl(envKey: string): string | null {
  const url = process.env[envKey]?.trim();
  if (!url) {
    return null;
  }
  if (!isValidEmbedUrl(url)) {
    console.warn(
      `[mapConfig] URL inválida en ${envKey}: se ignora. Usa una URL https absoluta.`,
    );
    return null;
  }
  return url;
}

export function resolveMapItems(maps: MapConfig[]): MapViewItem[] {
  return maps.map((map) => ({
    ...map,
    src: getMapUrl(map.envKey),
  }));
}

export const viewerMaps: MapConfig[] = [
  {
    id: "maestro",
    title: "Mapa maestro",
    description:
      "Vista general con todas las capas de gestión del riesgo en Ulloa.",
    envKey: "NEXT_PUBLIC_MAP_URL_MAESTRO",
  },
  {
    id: "amenazas",
    title: "Amenazas",
    description:
      "Capas de amenazas naturales y antrópicas identificadas en el municipio.",
    envKey: "NEXT_PUBLIC_MAP_URL_AMENAZAS",
  },
  {
    id: "exposicion",
    title: "Exposición y vulnerabilidad",
    description:
      "Población expuesta, infraestructura crítica y factores de vulnerabilidad.",
    envKey: "NEXT_PUBLIC_MAP_URL_EXPOSICION",
  },
  {
    id: "analisis",
    title: "Análisis de riesgo",
    description: "Zonificación de riesgo e intersección de amenazas y exposición.",
    envKey: "NEXT_PUBLIC_MAP_URL_ANALISIS",
  },
];

export const dashboardMaps: MapConfig[] = [
  {
    id: "indicadores",
    title: "Indicadores de riesgo",
    description: "Dashboard con indicadores y estadísticas del municipio.",
    envKey: "NEXT_PUBLIC_MAP_URL_DASHBOARD_INDICADORES",
  },
  {
    id: "estadisticas",
    title: "Estadísticas",
    description: "Gráficos y conteos por categoría de riesgo.",
    envKey: "NEXT_PUBLIC_MAP_URL_DASHBOARD_ESTADISTICAS",
  },
];
