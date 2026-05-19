CONFIGURACIÓN DE SISTEMA MULTI-AGENTE: PLANIFICADOR INTERACTIVO DE VIAJES DE LUNA DE MIEL
Este documento sirve como especificación técnica completa e instrucción maestra para un entorno multi-agente (o agente avanzado de edición de archivos como Claude Code). El objetivo es inicializar y desarrollar un repositorio de forma autónoma, respetando las reglas de negocio, la arquitectura y las restricciones técnicas detalladas a continuación.
---
1. CONTEXTO Y VISIÓN DEL PRODUCTO
El objetivo es desarrollar una aplicación web progresiva (PWA), altamente responsiva (diseño optimizado para celulares y escritorio), enfocada en parejas que planean su luna de miel. La aplicación debe permitir explorar destinos de manera visual, interactiva y lúdica, facilitando la toma de decisiones mediante el cálculo de tiempos de viaje y presupuestos multidivisa en tiempo real.
Características Clave del MVP:
Interactividad basada en mapas: Selección de país con visualización de regiones y ciudades principales.
Control de sobrecarga cognitiva: Interfaz limpia que limita la visualización simultánea de atractivos turísticos a un máximo de 2 o 3 pines en el mapa.
Enrutamiento dinámico: Cálculo de tiempos de desplazamiento entre los atractivos seleccionados.
Planificador financiero e itinerarios: Generación automática de propuestas basadas en la cantidad de días disponibles y atractivos de interés, mostrando costos en Peso Chileno (CLP), Dólar (USD) y la moneda local del destino.
---
2. ARQUITECTURA GENERAL DEL SISTEMA
Los agentes deben estructurar el proyecto bajo los siguientes lineamientos tecnológicos:
Framework Principal: Next.js (App Router) con TypeScript.
Estilos: TailwindCSS (Enfoque Mobile-First estricto).
Gestión de Estado Global: Zustand (para coordinar el estado del mapa, pines seleccionados, itinerario y divisas).
Librería de Mapas: Leaflet.js (con React-Leaflet) o Mapbox GL JS `[VERIFICAR]`. Se prefiere Leaflet por no requerir API keys obligatorias para el MVP inicial.
Persistencia Local: LocalStorage para guardar borradores de itinerarios de la pareja.
Mapa de Componentes Críticos y Dependencias:
Módulo	Componente React	Estado Requerido (Zustand)	Dependencia Externa
Mapa	`MapView.tsx`	`activePins`, `focusedCountry`, `routeGeometry`	Leaflet / OpenStreetMap
Atracciones	`AttractionList.tsx`	`selectedAttractions`, `toggleAttraction`	Base de Datos / Mock Data
Planificador	`ItineraryForm.tsx`	`tripDays`, `budgetFilters`, `generatedItinerary`	Algoritmo de enrutamiento
Finanzas	`CostSummary.tsx`	`currencyRates`, `totalCostCLP`	API de Tasas de Cambio `[VERIFICAR]`
---
3. ASIGNACIÓN DE ROLES Y FLUJO MULTI-AGENTE
Para la ejecución de este repositorio, el modelo debe dividir sus procesos de pensamiento en los siguientes 4 agentes virtuales. Cada uno ejecutará sus tareas secuencialmente o en paralelo según corresponda:
Agente 1: Arquitecto de Software (Lead Architect)
Misión: Configurar el boilerplate del proyecto, definir la estructura de carpetas y establecer los contratos de TypeScript (interfaces).
Entregables: `package.json`, `tsconfig.json`, `next.config.js`, y la estructura de directorios en `/src`. Crear los archivos `ARCHITECTURE.md` y `CHANGELOG.md` en la raíz.
Agente 2: Desarrollador Frontend (UI/UX Developer)
Misión: Implementar la interfaz de usuario responsiva. Crear los layouts para mobile y desktop de forma que la navegación sea fluida en ambos dispositivos (por ejemplo, panel inferior deslizable en mobile, panel lateral fijo en desktop).
Entregables: Componentes de interfaz en `/src/components/ui`, layout principal, vistas de navegación y estilos globales.
Agente 3: Especialista Geoespacial (Map & Routing Agent)
Misión: Implementar el visor del mapa, la lógica de georreferenciación de países/regiones y el control de pines activos.
Regla de Oro: Validar que el arreglo `activePins` nunca supere los 3 elementos. Si un usuario selecciona un cuarto atractivo, debe desplazar el primero o alertar al usuario. Implementar el cálculo de rutas y tiempos estimados de desplazamiento.
Entregables: `/src/components/map/MapView.tsx`, hooks de integración con el mapa, utilidades de cálculo de distancias.
Agente 4: Motor Financiero y de Itinerarios (Data & Finance Agent)
Misión: Crear la lógica que recibe los días de estadía y los atractivos seleccionados, distribuyéndolos en un itinerario lógico día por día. Implementar el conversor de divisas dinámico (CLP, USD, Moneda Local).
Entregables: `/src/store/useTravelStore.ts` (Zustand), `/src/utils/itineraryGenerator.ts`, componentes financieros.
---
4. REQUERIMIENTOS TÉCNICOS DETALLADOS (ESPECIFICACIONES DE MÓDULOS)
Módulo de Control de Pines en Mapa
El usuario selecciona un país desde un buscador o menú desplegable. El mapa hace un efecto de `flyTo` o encuadre automático a las coordenadas centrales de ese país con un nivel de zoom adecuado para ver sus regiones.
Cada país tiene una lista de atractivos turísticos clave de luna de miel. Cada atractivo posee coordenadas lat/lng fijas.
Al activar un atractivo desde la lista, se renderiza un marcador personalizado (pin) en el mapa.
Si se seleccionan 2 o 3 atractivos, el mapa debe ajustar automáticamente sus límites (`fitBounds`) para mostrar todos los pines activos en pantalla.
Se debe habilitar un botón "Calcular Ruta" que dibuje una línea (polilínea) conectando los pines activos en un orden lógico y muestre un cuadro flotante con el tiempo total de desplazamiento estimado (en horas y minutos).
Módulo del Optimizador de Itinerarios y Costos
Inputs del usuario: Número de días de viaje (ej. 10 días), selección de atractivos de interés (checkboxes o tarjetas interactivas).
Algoritmo Base: El sistema ordenará las atracciones seleccionadas por cercanía geográfica para asignarlas a los días disponibles, evitando saltos geográficos ineficientes. Si el tiempo de traslado consume más de 5 horas entre dos puntos, se debe sugerir un día de viaje exclusivo o alertar en el itinerario.
Estructura Financiera: Cada atractivo tiene un costo base estimado asociado (monto en moneda local). La aplicación debe contar con un módulo de conversión que multiplique este costo por el número de viajeros (fijo en 2 personas por ser luna de miel) y sume un estimado base diario de alojamiento y alimentación según el estándar del país.
El resumen de costos debe mostrarse en una tarjeta con tres columnas o filas claras:
CLP: Peso Chileno (calculado con tasa de cambio de referencia actualizable).
USD: Dólar Americano.
Moneda Local: Moneda oficial del destino seleccionado.
---
5. SET DE DATOS INICIAL DE PRUEBA (SEED DATA)
Los agentes deben inyectar este set de datos estáticos en `/src/data/destinations.ts` para validar el funcionamiento completo de la aplicación sin depender de llamados externos en la primera fase. Se usarán datos de referencia de Japón, Indonesia y Singapur:
Destino 1: Japón (Moneda Local: JPY - Yen japonés)
Regiones Principales: Kanto, Kansai, Chugoku, Hokkaido.
Atractivo 1: Kioto Tradicional (Templos y Distritos de Geishas). Coordenadas: `[35.0116, 135.7681]`. Costo estimado por pareja: 15,000 JPY/día.
Atractivo 2: Tokio Moderno (Shibuya y Shinjuku). Coordenadas: `[35.6762, 139.6503]`. Costo estimado por pareja: 20,000 JPY/día.
Atractivo 3: Monte Fuji (Cinco Lagos). Coordenadas: `[35.3606, 138.7274]`. Costo estimado por pareja: 18,000 JPY/día.
Tiempos de traslado típicos entre ellos vía Tren Bala (Shinkansen): Tokio a Kioto (~2h 15 min), Tokio a Monte Fuji (~2h).
Destino 2: Indonesia - Bali (Moneda Local: IDR - Rupia indonesia)
Regiones Principales: Ubud, Seminyak, Uluwatu, Islas Nusa.
Atractivo 1: Terrazas de Arroz de Tegallalang (Ubud). Coordenadas: `[-8.4336, 115.2789]`. Costo estimado por pareja: 300,000 IDR/día.
Atractivo 2: Templo de Uluwatu (Acantilados y Atardecer). Coordenadas: `[-8.8291, 115.0849]`. Costo estimado por pareja: 450,000 IDR/día.
Atractivo 3: Playas de Nusa Penida. Coordenadas: `[-8.7278, 115.5444]`. Costo estimado por pareja: 600,000 IDR/día.
Destino 3: Singapur (Moneda Local: SGD - Dólar de Singapur)
Regiones Principales: Marina Bay, Sentosa, Downtown Core.
Atractivo 1: Gardens by the Bay. Coordenadas: `[1.2816, 103.8636]`. Costo estimado por pareja: 70 SGD.
Atractivo 2: Isla Sentosa & Universal Studios. Coordenadas: `[1.2494, 103.8303]`. Costo estimado por pareja: 160 SGD.
Atractivo 3: Marina Bay Sands Skypark. Coordenadas: `[1.2839, 103.8595]`. Costo estimado por pareja: 60 SGD.
---
6. INSTRUCCIONES DE EJECUCIÓN PASO A PASO
Por favor, ejecuta el desarrollo del repositorio siguiendo este orden estricto:
Fase 1: Setup e Infraestructura. Crea la estructura de carpetas, configura TypeScript, instala las dependencias de React, TailwindCSS y Zustand. Escribe el archivo `ARCHITECTURE.md` inicial.
Fase 2: Estado Global y Mock Data. Crea el archivo de datos estáticos (`/src/data/destinations.ts`) y la tienda de Zustand (`/src/store/useTravelStore.ts`) que gestione las variables del mapa, el límite de 3 pines, los días y el cálculo financiero de conversión.
Fase 3: Desarrollo de UI Basada en Componentes. Diseña las vistas. Asegúrate de que el visor de mapas ocupe el 100% de la pantalla en dispositivos móviles con paneles flotantes inferiores colapsables, y que use una distribución de pantalla dividida (50% mapa, 50% controles) en pantallas de escritorio. Texto no justificado. Fuente predeterminada Aptos o alternativa sans-serif.
Fase 4: Motor Cartográfico. Agrega Leaflet.js, renderiza los mapas por país e implementa la regla de limitación de pines. Asegúrate de añadir las políneas entre marcadores activos.
Fase 5: Verificación y Cierre. Genera el archivo `CHANGELOG.md` documentando todas las versiones y cambios aplicados. Revisa que compile sin errores.
Puedes proceder a inicializar el repositorio utilizando este documento como especificación técnica base.
