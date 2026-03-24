# UX/UI Guidelines · Resultados LaLiga · RC Celta
## 1. Concepto general
- Estilo: dashboard oscuro tipo “HUD deportivo” con acentos en celeste RC Celta, aplicado a resultados de LaLiga y foco en el RC Celta.
- Inspiración: identidad corporativa del RC Celta (celeste, rojo, dorado, blanco) en un entorno de datos limpio, legible y accesible.  
- Uso: web de resultados y próximos partidos, con **bloque protagonista** para el RC Celta y resto de equipos en segundo plano.

***
## 2. Paleta de colores
Colores base (adaptar tal cual a tokens CSS):

- **Celeste Celta (primario)**  
  - HEX: `#8AC3EE`  
  - Uso: resaltar el Celta en tablas, elementos activos, highlights de texto, botones principales.

- **Rojo Celta (acento)**  
  - HEX: `#E5254E`  
  - Uso: pequeños detalles de marca (badges, micro-iconos, contadores).

- **Dorado Celta (estatus / énfasis)**  
  - HEX: `#B19221`  
  - Uso: números clave (posición destacada del Celta, puntos, hitos).

- **Fondo oscuro principal**  
  - HEX: `#0B1720`  
  - Uso: fondo de página (body, `<main>`).

- **Fondo de tarjeta / panel**  
  - HEX: `#111F2A`  
  - Uso: cards de partidos, tablas, módulos de información.

- **Texto principal**  
  - HEX: `#F5F8FC`  
  - Uso: nombres de equipo, resultados, encabezados.

- **Texto suave / secundario**  
  - HEX: `#A7B7C7`  
  - Uso: etiquetas, fechas, metadatos (“Última actualización…”).

- **Borde suave / división**  
  - RGBA: `rgba(255, 255, 255, 0.08)`  
  - Uso: bordes de tarjetas, divisores de filas de tabla poco intrusivos.

- **Verde “ok / live” (estado)**  
  - HEX: `#3EE98B`  
  - Uso: indicadores “En juego”, estados correctos, tendencias positivas.

- **Naranja/rojo “alerta / down” (estado)**  
  - HEX: `#FF7F5F`  
  - Uso: partidos aplazados, errores de carga, estados negativos.

Gradientes y fondos:

- Fondo global (body):  
  - `radial-gradient(circle at top, #14283a 0, #050b10 55%, #020509 100%)`
- Cabecera de tarjetas principales:  
  - `linear-gradient(135deg, rgba(138,195,238,0.16), rgba(11,23,32,0.9))`
- Encabezado de tabla:  
  - `linear-gradient(90deg, rgba(138,195,238,0.18), rgba(138,195,238,0.02))`

***
## 3. Tipografía
Familia:

- `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

Jerarquía:

- Títulos / brand (ej. “Resultados LaLiga”, “RC Celta · Próximo partido”):  
  - Peso: 700  
  - Tamaño: 1.1–1.3 rem  
  - Opcional: mayúsculas con `letter-spacing` notable en subtítulos.

- Subtítulos / metadata (ej. “Jornada 27 · Temporada 2025-2026”):  
  - Peso: 400–500  
  - Tamaño: 0.7–0.85 rem  
  - Uso de `letter-spacing: 0.12–0.2em` y mayúsculas.

- Cuerpo de tabla (listados de partidos, posiciones):  
  - Tamaño: ~0.8–0.85 rem  
  - Usar números monoespaciados si es posible (`font-variant-numeric: tabular-nums` o equivalente).

- Valores destacados (ej. resultado principal del Celta):  
  - Tamaño: ~1.4 rem  
  - Peso: 700  
  - Color: dorado `#B19221` o celeste `#8AC3EE` según tipo de highlight.

***
## 4. Componentes UI principales
### 4.1. Contenedor “Dashboard”
- Fondo: panel oscuro tipo cristal.  
- Estilos clave:
  - `border-radius: 24px`
  - `border: 1px solid rgba(255,255,255,0.08)`
  - `backdrop-filter: blur(14px)` (cuando sea viable)
  - Sombras:
    - `0 24px 60px rgba(0,0,0,0.7)`
    - `0 0 0 1px rgba(0,0,0,0.6)`

Uso: contenedor principal de la página (cabecera + bloques de contenido).
### 4.2. Cabecera de la página
Elementos:

- **Brand badge RC Celta simplificado**:  
  - Contenedor aprox. 32x48 px, borde redondeado 18px.  
  - Fondo: gradiente celeste → blanco.  
  - Borde claro alrededor.  
  - Pequeño círculo en rojo `#E5254E` a modo de “corona”.

- **Texto de marca**:  
  - Línea 1 (submarca): “Dashboard · LaLiga”, tamaño ~0.78 rem, mayúsculas, tracking alto.  
  - Línea 2 (principal): “RC Celta · Última jornada”, peso 700.

- **Estado / metadata**:  
  - Pill con indicador de estado (verde) y texto tipo “Temporada 2025-2026 · LALIGA EA SPORTS”.  
  - Fecha/hora de última actualización en texto pequeño (0.7 rem).
### 4.3. Bloque destacado RC Celta
- Card en la parte superior de la página dedicada al Celta.  
- Contenido mínimo:
  - Último resultado del Celta (marcador grande, rival, jornada, fecha).  
  - Próximo partido del Celta (rival, fecha, hora, estadio/condición local-visitante).
- Estilo:
  - Borde y acentos en celeste.  
  - Tipografía de marcador en tamaño grande (~1.4 rem) y peso 700.  
  - Badge “Celta” o similar siempre visible.
### 4.4. Lista / tabla de partidos
- Presentación tipo tabla o lista de cards, con fondo de tarjeta `#111F2A`.  
- Encabezado con degradado celeste suave y texto en gris suave.  
- Filas alternas con ligera variación de fondo para legibilidad.  
- Hover (en desktop):  
  - Ligero `translateY(-1px)`  
  - Fondo con celeste semitransparente.

Columna de equipo:

- Pequeño dot o pseudo-escudo a la izquierda (círculo ~18 px, gradiente celeste, o `<img>` redondo).  
- Nombre de equipo con peso medio (500).  
- Para el RC Celta:
  - `is_celta = true` →  
    - Texto en celeste, ligero glow.  
    - Badge especial (ej. “Celta”) con borde celeste.

Estados del partido:

- “Finalizado”: texto neutro, posible icono check suave.  
- “En juego”: usar verde `#3EE98B` + pill “LIVE”.  
- “Programado”: texto secundario más claro.

***
## 5. Micro-interacciones y comportamiento
- Actualización de datos (web):  
  - La UI debe reflejar estados de carga y error de forma clara.  
  - Spinner o skeletons sobre fondo oscuro mientras carga.

- Estados de error:  
  - Mensaje en naranja/rojo `#FF7F5F` cuando falle la obtención de datos.  
  - Metadata de actualización cambia a “Error al actualizar datos”.

- Feedback al usuario:  
  - Evitar animaciones agresivas; micro-transiciones suaves en hover y cambios de estado.

***
## 6. Accesibilidad y layout
- Contraste:  
  - Asegurar contraste suficiente entre texto principal y fondo oscuro (mínimo WCAG AA).
- Semántica:  
  - Uso de `<main>`, `<section>`, `<header>`, `<article>`, `<time>` para estructurar resultados y partidos.  
- Orden de lectura:  
  - El bloque del Celta va primero en el DOM, seguido de la jornada completa y después próximos partidos.

- Responsivo:  
  - Mobile-first: tarjetas apiladas en columna.  
  - En escritorio: grid para tarjetas y tabla con buena anchura de columnas.

***
## 7. Uso como guía en OpenCode
- Estas guidelines deben respetarse al generar HTML/CSS/Astro:  
  - Usar siempre la paleta de color indicada y la jerarquía tipográfica definida.  
  - El RC Celta debe aparecer visualmente priorizado (bloque propio y realce en listas).  
- Al crear nuevos componentes (tarjetas extra, filtros, etc.), mantener el estilo de dashboard oscuro con acentos celestes y bordes suaves.