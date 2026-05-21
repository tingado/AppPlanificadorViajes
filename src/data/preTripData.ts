export interface PreTripItem {
  id: string;
  cat: string;
  label: string;
}

export const PRE_TRIP_ITEMS: PreTripItem[] = [
  // Documentos
  { id: "pt-passport", cat: "📋 Documentos", label: "Pasaporte vigente (+6 meses de vencimiento)" },
  { id: "pt-visa", cat: "📋 Documentos", label: "Visa tramitada (si aplica para el destino)" },
  { id: "pt-insurance", cat: "📋 Documentos", label: "Seguro de viaje contratado" },
  { id: "pt-vaccines", cat: "📋 Documentos", label: "Vacunas al día (consultar requerimientos)" },
  { id: "pt-copies", cat: "📋 Documentos", label: "Fotocopias de documentos en la nube" },
  // Logística
  { id: "pt-flights", cat: "✈️ Logística", label: "Vuelo internacional reservado y confirmado" },
  { id: "pt-return", cat: "✈️ Logística", label: "Vuelo de regreso confirmado" },
  { id: "pt-hotel-first", cat: "✈️ Logística", label: "Alojamiento primera noche confirmado" },
  { id: "pt-transfers", cat: "✈️ Logística", label: "Traslados aeropuerto reservados" },
  { id: "pt-inter-transport", cat: "✈️ Logística", label: "Transportes inter-destino reservados (ferry, tren)" },
  // Finanzas
  { id: "pt-card-intl", cat: "💳 Finanzas", label: "Tarjeta internacional habilitada para el exterior" },
  { id: "pt-bank-notif", cat: "💳 Finanzas", label: "Banco notificado sobre fechas y destinos" },
  { id: "pt-cash", cat: "💳 Finanzas", label: "Efectivo en moneda local preparado" },
  { id: "pt-budget-saved", cat: "💳 Finanzas", label: "Meta de ahorro del viaje alcanzada" },
  // Tech
  { id: "pt-sim", cat: "📱 Tech", label: "SIM/eSIM internacional o plan roaming activado" },
  { id: "pt-maps", cat: "📱 Tech", label: "Mapas offline descargados (Google Maps, Maps.me)" },
  { id: "pt-apps", cat: "📱 Tech", label: "Traductor offline y apps del destino instaladas" },
  { id: "pt-cloud", cat: "📱 Tech", label: "Respaldo de fotos en la nube activado" },
  { id: "pt-emergency", cat: "📱 Tech", label: "Números de emergencia guardados (seguro, embajada)" },
];
