

PROMPT ESTRUCTURADO: Portal Web de Gestión del Riesgo de Desastres: Nombre Ulloa en Mapas.

## 📋 CONTEXTO GENERAL

### Objetivo del Proyecto
Crear un **portal web público** de acceso libre donde los ciudadanos, funcionarios y estudiantes puedan visualizar capas de información geográfica relacionadas con la **gestión del riesgo de desastres** y planeación en el municipio de Ulloa, Valle del Cauca.

---

## 🏗️ ARQUITECTURA TÉCNICA DECIDIDA



## 📦 DATOS DE ORIGEN

### Fuente de datos
- **Formato original:** File Geodatabase (.gdb) de Esri
- **Contenido:** Capas vectoriales de gestión del riesgo de desastres

### Proceso de conversión requerido
La plataforma CARTO cloud-native actual **no soporta importación directa de .gdb**. Se requiere convertir cada feature class a formato individual (GeoPackage recomendado o GeoJSON):

```bash
# Listar capas dentro del .gdb
ogrinfo "mi_geodatabase.gdb"

# Convertir cada capa a GeoPackage individual
ogr2ogr -f "GPKG" salida_capa.gpkg "mi_geodatabase.gdb" "nombre_feature_class"
```
--


## 🌐 ESTRUCTURA DEL SITIO WEB

### Páginas del portal

| Página | Contenido | Mapa embebido |
|---|---|---|
| **Inicio** | Introducción al riesgo de desastres en Cartago, noticias, alertas vigentes | No |
| **Visor de mapas** | Iframe con el mapa maestro (todas las capas, widgets interactivos) | Mapa maestro |
| **Amenazas** | Descripción de cada amenaza, metodología, iframe con mapa de amenazas | Mapa de amenazas |
| **Exposición y vulnerabilidad** | Estadísticas de población expuesta, infraestructura crítica | Mapa de exposición |
| **Análisis de riesgo** | Zonificación de riesgo, mapas de intersección | Mapa de análisis |
| **Dashboards** | Indicadores, gráficos, estadísticas (un iframe por página) | Mapa dashboard |
| **Descargas** | Documentos, PDFs, metodología, datos abiertos | No |
| **Documentación** | Marco normativo, planes de contingencia, protocolos | No |
| **Contacto** | Formulario para reportar eventos o riesgos | No |

### Reglas de diseño del sitio
- **Un iframe por página visible** (nunca múltiples mapas simultáneos)
- Si se usan tabs, disparar resize del iframe al activar el tab
- Estilo neutro: quitar branding de CARTO del iframe
- Diseño responsive (móvil, tablet, desktop)
- Navegación clara con menú principal

---

## 🎨 PALETA DE COLORES SUGERIDA PARA RIESGO

| Categoría | Color | Hex |
|---|---|---|
| Riesgo alto | Rojo | #d7301f |
| Riesgo medio | Naranja | #fc8d59 |
| Riesgo bajo | Amarillo | #fee08b |
| Sin riesgo | Verde | #91cf60 |
| Infraestructura crítica | Azul | #2d5f8a |
| Áreas protegidas | Verde oscuro | #1a9850 |
| Cuerpos de agua | Azul claro | #91bfdb |
| Zonas urbanas | Gris | #525252 |

---

## ⚠️ CONSIDERACIONES TÉCNICAS

### Rendimiento
- **Un iframe por página**: múltiples iframes simultáneos consumen RAM excesiva por los vector tiles
- **Dynamic Tiling**: CARTO genera tiles on-the-fly desde el data warehouse, sin pre-procesamiento
- Si el dataset es muy grande, considerar simplificación de geometrías antes de importar

### Limitaciones del embedding con iframe
- No se puede manipular el mapa con JavaScript desde el sitio (excepto vía URL parameters)
- El estilo de widgets y popups está limitado a lo que Builder permite
- Si CARTO tiene downtime, los mapas embebidos no cargan (SLA 99.9% en enterprise)

### Optimización de datos
- Reducir campos de texto al mínimo necesario
- Usar enteros en lugar de decimales cuando sea posible
- Eliminar feature classes innecesarias antes de importar
- Publicar en Web Mercator (EPSG:3857) para evitar reproyecciones

### Seguridad
- El acceso es público libre (sin autenticación de usuarios)
- Las queries no van directas al data warehouse: pasan por los APIs de CARTO
- No exponer API keys en el código fuente del sitio

---

## 📐 CRITERIOS DE ÉXITO

- [ ] Portal web desplegado y accesible públicamente
- [ ] Mapa maestro con todas las capas de riesgo cargadas y visibles
- [ ] Widgets interactivos funcionando (filtros, conteos, histogramas)
- [ ] Popups mostrando atributos relevantes al hacer clic
- [ ] Sitio responsive (móvil, tablet, desktop)
- [ ] Sección de descargas con documentación
- [ ] Formulario de contacto funcional
- [ ] Tiempo de carga del mapa < 3 segundos
- [ ] Sin branding visible de CARTO en los mapas embebidos
- [ ] Navegación clara entre secciones del portal

---

## 🔗 RECURSOS Y REFERENCIAS

- **CARTO Builder:** app.carto.com
- **Documentación CARTO:** docs.carto.com
- **GDAL ogr2ogr:** gdal.org/en/stable/programs/ogr2ogr.html
- **CARTO Academy:** academy.carto.com
- **CARTO Embedding docs:** docs.carto.com/carto-user-manual/maps/sharing-and-collaboration/embedding-maps
- **CARTO Customization:** docs.carto.com/carto-user-manual/settings/customizations/customizing-appearance-and-branding
