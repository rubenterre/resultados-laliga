## Visión del proyecto

Vamos a crear una web en Astro que muestre:

- Resultados de la **última jornada** de la Liga española de Primera División (LaLiga).  
- El **próximo partido** de cada equipo, con un foco especial en el Real Club Celta de Vigo.  
- Los partidos del Celta de Vigo deben aparecer siempre destacados frente al resto (a nivel visual y de jerarquía de información).

La web se desplegará en **Netlify**, usando **Netlify Functions** programadas (Scheduled Functions) para consultar la API de `football-data.org` cada ~30 minutos y refrescar los datos en un almacenamiento intermedio (por ejemplo, JSON en Netlify, KV, o similar).

***

## Requisitos funcionales

- Mostrar la **última jornada disputada** de LaLiga (Primera División):
  - Listado de partidos: local, visitante, resultado, fecha y estado (Finalizado, En juego, Programado).
  - Orden lógico (por fecha/hora, o por orden de competición/jornada).
- Mostrar el **próximo partido** de:
  - Cada equipo, al menos los que han jugado la última jornada.
  - De forma destacada el próximo partido del **RC Celta de Vigo**.
- Destacar siempre los partidos del **Celta**:
  - En listados globales (por ejemplo, tarjeta con estilo diferenciado, borde de color, iconografía, etc.).
  - En una sección específica “Próximo partido del Celta” y “Último resultado del Celta”.
- Actualizar los datos automáticamente cada ~30 minutos:
  - Mediante una Netlify Scheduled Function que llama a la API de `football-data.org` y persiste la respuesta para que las páginas Astro lean de ahí.
- Posibilidad de navegación por jornadas pasadas (opcional en una segunda fase).

***

## Requisitos técnicos

### Stack principal

- **Framework**: Astro.
- **Backend ligero / API proxy**: Netlify Functions (y Scheduled Functions para el cron).
- **Fuente de datos**: API `football-data.org` (v4, endpoint de competiciones y partidos).
- **Despliegue**: Netlify.

### API `football-data.org`

- Base URL actual recomendada: `https://api.football-data.org/v4`.
- Endpoints relevantes:
  - `/competitions` para listar competiciones y obtener el ID/código de LaLiga (Primera División).
  - `/competitions/{code_or_id}/matches` para obtener partidos de una competición (filtrable por fechas, status, etc.).
- Necesitamos:
  - Identificar el **código/ID** de LaLiga Primera División (ej. `PD` o el ID numérico que indique la doc).
  - Usar filtros de fecha o jornada para:
    - Obtener la **última jornada** concluida.
    - Obtener los **próximos partidos** (status `SCHEDULED` o similar).
- Autenticación:
  - Usar el token de API en cabeceras (`X-Auth-Token`) en las Netlify Functions, nunca en el cliente.

*(Nota: revisar en la implementación real el código/campo exacto para LaLiga y el esquema de respuesta, según la documentación de `/v4`.)*[8][2][1]

***

## Arquitectura de alto nivel

### Flujo de datos

1. **Netlify Scheduled Function (cron ~30 min)**  
   - Se ejecuta cada ~30 minutos con una expresión cron en `netlify.toml` (`schedule = "*/30 * * * *"` o similar).
   - Llama a la API de `football-data.org` para:
     - Obtener partidos de LaLiga de las fechas relevantes (últimos días y próximos días).
   - Procesa la respuesta:
     - Determina cuál ha sido la **última jornada completa** finalizada.
     - Determina los **próximos partidos** de cada equipo, con foco en el Celta.
   - Guarda los datos procesados en un formato simple (por ejemplo `data/laliga-latest.json` o algún almacenamiento tipo KV/DB si usamos uno).

2. **Páginas Astro**  
   - En build o SSR/ISR (dependiendo de la estrategia) leen ese JSON/almacenamiento.
   - Renderizan:
     - Página principal con:
       - Bloque destacado del Celta (último resultado + próximo partido).
       - Listado de todos los partidos de la última jornada.
       - Listado de próximos partidos.
   - La lógica de presentación está separada de la obtención de datos.

3. **Cliente (navegador)**  
   - Idealmente, JS mínimo.  
   - Si se necesita actualización más frecuente en cliente, se podría añadir un endpoint serverless que devuelva el JSON fresco, pero el core es estático/SSR.

***

## Organización del proyecto

### Estructura sugerida

- `/src/components`
  - `MatchCard.astro` – Componente genérico para mostrar un partido.
  - `MatchCardCelta.astro` – Variante o wrapper que aplica estilos de “partido destacado del Celta”.
  - `MatchList.astro` – Lista de partidos por jornada.
  - `CeltaHighlight.astro` – Sección específica para Celta (último y próximo partido).
  - `Layout.astro` – Layout base con cabecera, pie, etc.
- `/src/pages`
  - `index.astro` – Home con última jornada + próximos partidos + Celta destacado.
  - `jornada/[matchday].astro` (futuro) – Página por jornada.
- `/netlify/functions`
  - `fetch-laliga.js/ts` – Function normal para exponer JSON si se necesita.
  - `cron-update-laliga.js/ts` – Scheduled Function que se ejecuta cada ~30 min y actualiza los datos.
- `/data` (o similar, según estrategia)
  - `laliga-latest.json` – Datos cacheados por la función (última jornada, próximos partidos, especial Celta).

***

## Criterios de diseño y UX

- **Jerarquía clara**:
  - Primer bloque: “Seguimiento RC Celta de Vigo” con:
    - Último resultado (marcador, rival, jornada, fecha).
    - Próximo partido (fecha, hora, estadio, competición).
  - Segundo bloque: “Última jornada LaLiga” con grid/lista de partidos.
  - Tercer bloque (opcional): “Próximos partidos de LaLiga”.
- **Destacado del Celta**:
  - Color de acento coherente con su identidad (celeste) aplicado a bordes, fondos y tipografía del bloque.
  - Icono/escudo del Celta (cuidar licencias/marcas; idealmente usar recursos permitidos o simplificar a símbolo genérico).
- **Accesibilidad**:
  - Semántica correcta (`<main>`, `<section>`, `<header>`, `<article>`, `<time>`, etc.).
  - Contraste suficiente para el bloque destacado del Celta.
  - Lectura clara del marcador para lectores de pantalla (por ejemplo, `Celta 2, Real Madrid 1` leído correctamente).
  - Orden lógico en DOM que respete la prioridad de contenido, no solo el layout visual.
- **Responsivo**:
  - Mobile-first: lista vertical en móviles, grid en escritorio.
  - Evitar tablas densas si no son necesarias; usar tarjetas accesibles.

***

## Criterios de calidad del código

- **Arquitectura limpia**:
  - Separación clara entre:
    - Capa de obtención/procesamiento de datos (Netlify Functions).
    - Capa de presentación (componentes Astro).
  - Tipado si usamos TypeScript para definir tipos `Match`, `Team`, `Competition`, etc.
- **Mantenibilidad**:
  - Componentes pequeños y reutilizables (tarjetas, listas, layout).
  - No acoplar la lógica al formato bruto de la API; trabajar con modelos intermedios mapeados.
- **Rendimiento**:
  - Minimizar JavaScript en cliente (aprovechar el enfoque de Astro).
  - Cargar solo las fuentes y assets necesarios.
  - Optimizar imágenes (escudos, si se usan) y servir formatos modernos.
- **SEO básico**:
  - Títulos y meta descripciones coherentes (“Resultados última jornada LaLiga”, “Partidos RC Celta de Vigo”).
  - Uso de etiquetas `<title>`, `<meta name="description">` y encabezados `<h1>`, `<h2>` bien estructurados.

***

## Integración con OpenCode

- Este `context.md` servirá como referencia para:
  - Mantener el foco en **Astro + Netlify + football-data.org**.
  - Recordar que el Celta es el equipo prioritario a nivel de diseño e información.
  - Guía de estructura de carpetas, arquitectura y estándares de calidad.
- Al pedir cambios o nuevas features a OpenCode:
  - Referenciar explícitamente secciones de este contexto (por ejemplo: “según la estructura de `/src/components` del context.md…”).
  - Mantener siempre la separación de responsabilidades y la priorización de accesibilidad.