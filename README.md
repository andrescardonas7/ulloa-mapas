# Ulloa en Mapas

Portal web público de información geográfica para la gestión del riesgo de desastres en el municipio de Ulloa, Valle del Cauca.

## Stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4

## Requisitos

- Node.js 20+
- pnpm 10+

## Instalación

```bash
pnpm install
cp .env.local.example .env.local
```

Edita `.env.local` con las URLs de embed de tus mapas (ArcGIS Online, CARTO o QGIS Server) y, en producción, la URL pública del sitio (`NEXT_PUBLIC_SITE_URL`).

## Desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Build

```bash
pnpm build
pnpm start
```

## Verificación local

Antes de abrir un PR o desplegar:

```bash
pnpm verify
```

Ejecuta lint, comprobación de tipos (`tsc`) y build de producción.

## Estructura del sitio

| Ruta | Contenido |
|------|-----------|
| `/` | Inicio con CTA |
| `/visor` | Todos los mapas embebidos (tabs) |
| `/dashboards` | Indicadores y estadísticas |
| `/descargas` | Documentos descargables |
| `/documentacion` | Marco normativo y referencias |
| `/acerca-de` | Qué es Ulloa en Mapas |

## Configurar mapas

1. Publica tu mapa en ArcGIS Online, CARTO Builder o QGIS Server/Cloud.
2. Obtén la URL de embed (iframe).
3. Añádela en `.env.local` usando las variables definidas en `.env.local.example`.
4. Para agregar un nuevo mapa al visor, edita `src/lib/mapConfig.ts`.

## Documentos

Los documentos de descarga se gestionan en `src/lib/documents.ts` (datos locales de ejemplo). Cuando definas el almacenamiento definitivo (carpeta estática, Supabase, Google Drive, etc.), reemplaza esa fuente sin cambiar la interfaz de la página.

## Documentación del proyecto

Ver [docs/ulloa-en-mapas.md](docs/ulloa-en-mapas.md) para arquitectura, paleta de colores y criterios de éxito.
