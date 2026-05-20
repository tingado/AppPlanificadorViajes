# Arquitectura del Sistema — Luna de Miel Planner

## Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | 14.x |
| Lenguaje | TypeScript | 5.x |
| Estilos | TailwindCSS (Mobile-First) | 3.x |
| Estado Global | Zustand (con persistencia LocalStorage) | 4.x |
| Mapas | Leaflet.js (carga dinámica CSR) | 1.9 |
| Tiles | OpenStreetMap (sin API key requerida) | — |

## Estructura de Carpetas

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Layout raíz con metadata PWA
│   ├── page.tsx            # Punto de entrada — switch Mobile/Desktop
│   └── globals.css         # Tailwind + Leaflet CSS
├── components/
│   ├── map/
│   │   └── MapView.tsx     # Visor Leaflet (ssr:false, dynamic import)
│   └── ui/
│       ├── ControlPanel.tsx      # Panel lateral/inferior con tabs
│       ├── DesktopLayout.tsx     # Split 50/50 mapa|controles
│       ├── MobileLayout.tsx      # Toggle pill + panel deslizante
│       ├── DestinationSelector.tsx
│       ├── AttractionList.tsx
│       ├── ItineraryForm.tsx
│       ├── ItineraryView.tsx
│       └── CostSummary.tsx
├── data/
│   └── destinations.ts     # Seed data: Japón, Bali, Singapur
├── store/
│   └── useTravelStore.ts   # Zustand store + LocalStorage persist
├── types/
│   └── index.ts            # Interfaces TypeScript globales
└── utils/
    ├── geo.ts              # Haversine, estimación de tiempos, RouteInfo
    └── itineraryGenerator.ts  # Ordenamiento por proximidad + costos
```

## Reglas de Negocio Críticas

### Control de Pines (MAX 3)
- `useTravelStore.toggleAttraction()` valida que `activePins.length < 3`
- Si se excede el límite, se desplaza el pin más antiguo (FIFO)
- Se activa el estado `pinLimitReached` por 3 segundos para notificar al usuario

### Cálculo de Rutas
- `buildRouteInfo()` en `utils/geo.ts` usa la fórmula de Haversine para distancias
- Velocidad promedio de referencia: 60 km/h (tránsito terrestre mixto)
- Si un segmento supera 5 horas, el generador de itinerarios inserta un "día de traslado"

### Conversión Financiera
- Pivote: USD como moneda intermedia
- Fórmulas: `CLP = local / USD_TO_LOCAL * USD_TO_CLP`
- Las tasas de cambio son editables en tiempo real desde la pestaña "Costos"
- Cálculo fijo para 2 personas (luna de miel)

## Rendering Strategy

- **Mapa:** `dynamic(() => import(...), { ssr: false })` — solo se renderiza en cliente para evitar errores de `window` con Leaflet
- **Layouts:** El switch Mobile/Desktop se hace via CSS (`hidden md:block`) para evitar re-mounts
- **Estado:** Zustand con `persist` middleware escribe en `localStorage` key `travel-planner-store`
