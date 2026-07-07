const DEFAULT_SITE_URL = "http://localhost:3000";

export const siteConfig = {
  name: "Ulloa en Mapas",
  description:
    "Portal público de información geográfica para la gestión del riesgo de desastres en Ulloa, Valle del Cauca.",
  locale: "es_CO",
  get url(): string {
    const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (configured) {
      return configured.replace(/\/$/, "");
    }
    return DEFAULT_SITE_URL;
  },
} as const;

export const publicRoutes = [
  "/",
  "/visor",
  "/dashboards",
  "/descargas",
  "/documentacion",
  "/acerca-de",
] as const;
