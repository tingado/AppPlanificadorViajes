# Changelog — Luna de Miel Planner

## [0.1.0] — 2026-05-20

### Fase 1: Setup e Infraestructura
- Inicialización de proyecto Next.js 14 con App Router y TypeScript estricto
- Configuración de TailwindCSS con paleta de marca (violeta/fuchsia) y fuente Aptos
- Configuración de `next.config.js` con `transpilePackages` para Leaflet
- Creación de estructura de carpetas: `app/`, `components/`, `data/`, `store/`, `types/`, `utils/`
- Archivo `ARCHITECTURE.md` documentando stack, estructura y reglas de negocio

### Fase 2: Estado Global y Mock Data
- `src/data/destinations.ts`: Seed data de Japón, Bali e Indonesia con coordenadas, costos y descripciones
- `src/types/index.ts`: Interfaces TypeScript (`Destination`, `Attraction`, `ItineraryDay`, `CurrencyRates`, `RouteInfo`)
- `src/store/useTravelStore.ts`: Zustand store con persistencia en LocalStorage
  - Gestión de destino activo, pines (máx. 3), ruta, itinerario y tasas de cambio
  - Lógica FIFO para reemplazar el pin más antiguo al exceder el límite

### Fase 3: Desarrollo de UI
- `DesktopLayout.tsx`: Vista dividida 50% mapa / 50% controles para pantallas ≥ `md`
- `MobileLayout.tsx`: Toggle pill + panel inferior deslizante para móviles
- `ControlPanel.tsx`: Panel con tabs (Atractivos / Itinerario / Costos) + selector de destino
- `DestinationSelector.tsx`: Dropdown con banderas de emoji para Japón, Indonesia, Singapur
- `AttractionList.tsx`: Tarjetas seleccionables con numeración de pin, descripción y costo
- `ItineraryForm.tsx`: Slider de días (2–21) + botón de generación de itinerario
- `ItineraryView.tsx`: Tarjetas día a día con días de tránsito diferenciados y resumen financiero
- `CostSummary.tsx`: Tabla de costos CLP / USD / moneda local con tasas editables

### Fase 4: Motor Cartográfico
- `src/components/map/MapView.tsx`: Integración de Leaflet.js con carga dinámica (SSR deshabilitado)
  - `flyTo` animado al seleccionar destino
  - Marcadores numerados con color por índice de pin
  - `fitBounds` automático al activar múltiples pines
  - Polilínea discontinua entre pines activos al calcular ruta
  - Overlay con distancia total y tiempo estimado de desplazamiento
- `src/utils/geo.ts`: Fórmula de Haversine, estimación de horas y formato de duración
- `src/utils/itineraryGenerator.ts`: Ordenamiento greedy por proximidad geográfica + lógica de días de tránsito

### Fase 5: Verificación y Cierre
- Build de producción exitoso sin errores TypeScript
- Configuración de PWA (`manifest.json`, viewport theme color)
- CSS de Leaflet importado desde `globals.css` para compatibilidad con bundler
- Generación de `CHANGELOG.md`
