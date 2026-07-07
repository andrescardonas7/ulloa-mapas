# Ulloa en Mapas — Portal Web de Gestión del Riesgo de Desastres

## Contexto general

### Objetivo del proyecto

Crear un **portal web público** de acceso libre donde los ciudadanos, funcionarios y estudiantes puedan visualizar capas de información geográfica relacionadas con la **gestión del riesgo de desastres** y planeación en el municipio de Ulloa, Valle del Cauca.

---

## Arquitectura técnica

### Stack del sitio web

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 16 (App Router) + React 19 + TypeScript |
| Estilos | Tailwind CSS 4 |
| Mapas | Embed vía iframe (proveedor configurable) |
| Documentos | Fuente local de ejemplo (`src/lib/documents.ts`); almacenamiento definitivo pendiente de decidir |
| Despliegue | Vercel (recomendado) |

### Plataforma GIS (flexible)

El sitio **no está acoplado a un solo proveedor**. Los mapas se embeben desde cualquiera de estas plataformas:

| Proveedor | Uso típico | URL de embed |
|-----------|------------|--------------|
| **ArcGIS Online** | Web Maps / Web Apps | URL de embed de ArcGIS Experience Builder o Web AppBuilder |
| **CARTO** | CARTO Builder | URL de embed desde Sharing & Collaboration |
| **QGIS Server / QGIS Cloud** | Servicios WMS/WFS publicados | URL del visor web o iframe del proyecto |

Las URLs se configuran en `.env.local` (ver `.env.local.example`). Añadir un mapa nuevo = agregar entrada en `src/lib/mapConfig.ts` + variable de entorno.

---

## Datos de origen

### Fuente de datos

- **Formato original:** File Geodatabase (.gdb) de Esri
- **Contenido:** Capas vectoriales de gestión del riesgo de desastres

### Proceso de conversión requerido

CARTO y la mayoría de plataformas cloud **no soportan importación directa de .gdb**. Se requiere convertir cada feature class a formato individual (GeoPackage recomendado o GeoJSON):

```bash
# Listar capas dentro del .gdb
ogrinfo "mi_geodatabase.gdb"

# Convertir cada capa a GeoPackage individual
ogr2ogr -f "GPKG" salida_capa.gpkg "mi_geodatabase.gdb" "nombre_feature_class"
```

Este paso aplica independientemente del proveedor GIS elegido para publicar los mapas.

---

## Estructura del sitio web

### Páginas del portal

| Página | Ruta | Contenido | Mapa embebido |
|--------|------|-----------|---------------|
| **Inicio** | `/` | Introducción, CTA, alertas informativas | No |
| **Visor** | `/visor` | Todos los mapas (maestro, amenazas, exposición, análisis) en tabs | Sí (uno a la vez) |
| **Dashboards** | `/dashboards` | Indicadores, gráficos, estadísticas | Sí (uno a la vez) |
| **Descargas** | `/descargas` | Documentos, PDFs, metodología, datos abiertos | No |
| **Documentación** | `/documentacion` | Marco normativo, planes de contingencia, protocolos | No |
| **Acerca de** | `/acerca-de` | Qué es Ulloa en Mapas, propósito y alcance | No |

### Páginas excluidas (por ahora)

| Página | Motivo |
|--------|--------|
| **Contacto** | Requiere backend (email, antispam, moderación) para ser útil. Un formulario sin backend genera falsas expectativas en temas de emergencia. Se puede añadir en una fase posterior. |

### Reglas de diseño del sitio

- **Un iframe visible a la vez** (nunca múltiples mapas simultáneos)
- Si se usan tabs, disparar resize del iframe al activar el tab
- Quitar branding del proveedor GIS en el iframe cuando sea posible
- Diseño responsive (móvil, tablet, desktop)
- Navegación clara con menú principal

---

## Paleta de colores

| Uso | Color | Hex |
|-----|-------|-----|
| Primario / riesgo alto | Rojo | `#D91424` |
| Acento / agua / UI secundaria | Azul cielo | `#84C1D9` |
| Seguro / sin riesgo | Verde | `#088C29` |
| Alerta / precaución | Amarillo | `#FDDC08` |
| Texto y fondos oscuros | Negro | `#0D0D0D` |
| Riesgo medio | Ámbar | `#E8A317` |

Implementadas como variables CSS en `src/app/globals.css` (`--brand-red`, `--brand-sky`, etc.).

---

## Consideraciones técnicas

### Rendimiento

- **Un iframe visible a la vez**: múltiples iframes simultáneos consumen RAM excesiva
- Si el dataset es muy grande, considerar simplificación de geometrías antes de importar
- CARTO: dynamic tiling on-the-fly; ArcGIS: tiles precalculados; QGIS: depende de la configuración del servidor

### Limitaciones del embedding con iframe

- No se puede manipular el mapa con JavaScript desde el sitio (excepto vía URL parameters del proveedor)
- El estilo de widgets y popups está limitado a lo que cada plataforma permite
- Si el proveedor GIS tiene downtime, los mapas embebidos no cargan

### Optimización de datos

- Reducir campos de texto al mínimo necesario
- Usar enteros en lugar de decimales cuando sea posible
- Eliminar feature classes innecesarias antes de importar
- Publicar en Web Mercator (EPSG:3857) para evitar reproyecciones

### Seguridad

- El acceso es público libre (sin autenticación de usuarios)
- No exponer API keys en el código fuente del sitio
- Las URLs de embed son públicas por naturaleza; no incluir tokens sensibles en ellas

### Gestión de documentos (pendiente)

El almacenamiento definitivo de archivos (Supabase, Google Drive, carpeta estática en `/public`, etc.) **aún no está definido**. La página de Descargas usa datos de ejemplo en `src/lib/documents.ts` y está preparada para conectar una fuente externa sin rediseñar la interfaz.

---

## Criterios de éxito

- [ ] Portal web desplegado y accesible públicamente
- [ ] Visor con mapas de riesgo cargados y visibles
- [ ] Widgets interactivos funcionando (filtros, conteos, histogramas)
- [ ] Popups mostrando atributos relevantes al hacer clic
- [ ] Sitio responsive (móvil, tablet, desktop)
- [ ] Sección de descargas con documentación
- [ ] Tiempo de carga del mapa < 3 segundos
- [ ] Sin branding visible del proveedor GIS en los mapas embebidos
- [ ] Navegación clara entre secciones del portal

---

## Recursos y referencias

### Plataformas GIS

- **ArcGIS Online:** arcgis.com
- **CARTO Builder:** app.carto.com
- **QGIS:** qgis.org

### Documentación

- **CARTO docs:** docs.carto.com
- **CARTO Embedding:** docs.carto.com/carto-user-manual/maps/sharing-and-collaboration/embedding-maps
- **ArcGIS embed:** doc.arcgis.com/en/arcgis-online/share-maps-maps/embed-maps.htm
- **GDAL ogr2ogr:** gdal.org/en/stable/programs/ogr2ogr.html

### Proyecto

- **Código:** `src/` en la raíz del repositorio
- **Configuración de mapas:** `src/lib/mapConfig.ts` + `.env.local`
- **Documentos de ejemplo:** `src/lib/documents.ts`
