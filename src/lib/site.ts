const DEFAULT_SITE_URL = "http://localhost:3000";

function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) {
    return DEFAULT_SITE_URL;
  }
  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    console.warn(
      "[site] NEXT_PUBLIC_SITE_URL no es una URL absoluta válida; se usa el valor por defecto.",
    );
    return DEFAULT_SITE_URL;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    console.warn(
      "[site] NEXT_PUBLIC_SITE_URL debe usar http(s); se usa el valor por defecto.",
    );
    return DEFAULT_SITE_URL;
  }
  return url.origin;
}

export const siteConfig = {
  name: "Ulloa en Mapas",
  description:
    "Portal público de información geográfica para la gestión del riesgo de desastres en Ulloa, Valle del Cauca.",
  locale: "es_CO",
  get url(): string {
    return resolveSiteUrl();
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
