export interface PackingItem {
  id: string;
  cat: string;
  label: string;
}

export const BASE_PACKING_ITEMS: PackingItem[] = [
  { id: "passport", cat: "Documentos", label: "Pasaporte vigente" },
  { id: "visa", cat: "Documentos", label: "Visa (si aplica)" },
  { id: "insurance", cat: "Documentos", label: "Seguro de viaje" },
  { id: "flights", cat: "Documentos", label: "Tickets de vuelo" },
  { id: "hotel", cat: "Documentos", label: "Reservas de hotel" },
  { id: "phone", cat: "Electrónica", label: "Teléfono + cargador" },
  { id: "adapter", cat: "Electrónica", label: "Adaptador universal" },
  { id: "powerbank", cat: "Electrónica", label: "Power bank" },
  { id: "camera", cat: "Electrónica", label: "Cámara / GoPro" },
  { id: "sunscreen", cat: "Salud", label: "Protector solar FPS50+" },
  { id: "repellent", cat: "Salud", label: "Repelente de insectos" },
  { id: "meds", cat: "Salud", label: "Botiquín básico" },
  { id: "clothes-light", cat: "Ropa", label: "Ropa liviana (tropical)" },
  { id: "shoes", cat: "Ropa", label: "Zapatos cómodos" },
  { id: "swimsuit", cat: "Ropa", label: "Traje de baño" },
  { id: "rain", cat: "Ropa", label: "Poncho / impermeable" },
  { id: "backpack", cat: "Accesorios", label: "Mochila de día" },
  { id: "cash", cat: "Dinero", label: "Efectivo local" },
  { id: "card", cat: "Dinero", label: "Tarjeta internacional" },
  { id: "locks", cat: "Seguridad", label: "Candados para maletas" },
];

export const DEST_PACKING_ITEMS: Record<string, PackingItem[]> = {
  japan: [
    { id: "jp-ic-card", cat: "Japón", label: "IC Card (transporte)" },
    { id: "jp-pocket-wifi", cat: "Japón", label: "Pocket WiFi reservado" },
    { id: "jp-onsen", cat: "Japón", label: "Ropa para onsen (toalla)" },
  ],
  bali: [
    { id: "bali-sarong", cat: "Bali", label: "Sarong para templos" },
    { id: "bali-deet", cat: "Bali", label: "DEET (dengue zona)" },
  ],
  thailand: [
    { id: "th-temple", cat: "Tailandia", label: "Ropa cubriente para templos" },
    { id: "th-flip", cat: "Tailandia", label: "Sandalias para templos" },
  ],
  vietnam: [
    { id: "vn-cash", cat: "Vietnam", label: "Dólares en efectivo" },
    { id: "vn-sim", cat: "Vietnam", label: "SIM local (Viettel)" },
  ],
  singapore: [
    { id: "sg-ez-link", cat: "Singapur", label: "EZ-Link card (transporte)" },
    { id: "sg-clothes", cat: "Singapur", label: "Ropa fresca (calor húmedo)" },
  ],
  philippines: [
    { id: "ph-cash", cat: "Filipinas", label: "Pesos filipinos en efectivo" },
    { id: "ph-sunscreen", cat: "Filipinas", label: "Protector solar (islas)" },
    { id: "ph-snorkel", cat: "Filipinas", label: "Snorkel / máscara buceo" },
  ],
  maldives: [
    { id: "mv-usd-cash", cat: "Maldivas", label: "USD en efectivo (propinas y extras)" },
    { id: "mv-reef-sunscreen", cat: "Maldivas", label: "Protector solar coral-safe (obligatorio)" },
    { id: "mv-mask-fins", cat: "Maldivas", label: "Máscara + aletas de snorkeling" },
    { id: "mv-rash-guard", cat: "Maldivas", label: "Lycra / rash guard anti-UV" },
    { id: "mv-waterproof-bag", cat: "Maldivas", label: "Bolsa seca impermeable" },
    { id: "mv-gopro", cat: "Maldivas", label: "GoPro / cámara subacuática" },
    { id: "mv-modest-clothes", cat: "Maldivas", label: "Ropa cubriente para isla local (Malé)" },
  ],
  greece: [
    { id: "gr-euros", cat: "Grecia", label: "Euros en efectivo (tabernas locales)" },
    { id: "gr-ferry-tickets", cat: "Grecia", label: "Pasajes de ferry inter-islas reservados" },
    { id: "gr-walking-shoes", cat: "Grecia", label: "Zapatos para adoquines (no sandalias planas)" },
    { id: "gr-hat", cat: "Grecia", label: "Sombrero de sol (calor extremo Jul-Ago)" },
    { id: "gr-light-scarf", cat: "Grecia", label: "Pañuelo/chal para visitas a iglesias" },
  ],
  morocco: [
    { id: "ma-dirhams", cat: "Marruecos", label: "Dirhams marroquíes en efectivo (souks)" },
    { id: "ma-modest-clothes", cat: "Marruecos", label: "Ropa respetuosa (hombros + rodillas cubiertos)" },
    { id: "ma-scarf-women", cat: "Marruecos", label: "Pañuelo para cabeza (mezquitas y mercados)" },
    { id: "ma-sandals-flip", cat: "Marruecos", label: "Sandalias cómodas para medinas" },
    { id: "ma-daypack-safe", cat: "Marruecos", label: "Mochila anti-robo / bolso cruzado" },
    { id: "ma-stomach-meds", cat: "Marruecos", label: "Medicamentos estomacales (cambio de agua)" },
  ],
  italy: [
    { id: "it-euros", cat: "Italia", label: "Euros en efectivo (tips y mercados)" },
    { id: "it-tickets", cat: "Italia", label: "Entradas pre-compradas (Coliseo, Uffizi, Vaticano)" },
    { id: "it-shoulders", cat: "Italia", label: "Pañuelo para hombros (iglesias y basílicas)" },
    { id: "it-walking-shoes", cat: "Italia", label: "Zapatos cómodos para adoquines (sin tacones)" },
    { id: "it-trenitalia", cat: "Italia", label: "Reservas Trenitalia Frecciarossa confirmadas" },
  ],
  france: [
    { id: "fr-euros", cat: "Francia", label: "Euros en efectivo (mercados y boulangeries)" },
    { id: "fr-eiffel-ticket", cat: "Francia", label: "Entradas Torre Eiffel reservadas online con anticipación" },
    { id: "fr-museum-pass", cat: "Francia", label: "Museum Pass Paris (2/4/6 días)" },
    { id: "fr-navigo", cat: "Francia", label: "Navigo Easy (tarjeta metro París)" },
    { id: "fr-scarf", cat: "Francia", label: "Pañuelo/chal (elegante en restaurantes)" },
  ],
  croatia: [
    { id: "cr-euros", cat: "Croacia", label: "Euros en efectivo (taxis y mercados locales)" },
    { id: "cr-ferry", cat: "Croacia", label: "Pasajes de ferri inter-islas reservados" },
    { id: "cr-reef-shoes", cat: "Croacia", label: "Escarpines para playas de guijarros" },
    { id: "cr-walls-ticket", cat: "Croacia", label: "Entradas murallas de Dubrovnik reservadas" },
    { id: "cr-sunscreen", cat: "Croacia", label: "Protector solar (sol mediterráneo intenso)" },
  ],
  mexico: [
    { id: "mx-reef-sunscreen", cat: "México", label: "Protector solar libre de oxibenzona (arrecifes protegidos)" },
    { id: "mx-pesos", cat: "México", label: "Pesos mexicanos en efectivo (cenotes y mercados)" },
    { id: "mx-snorkel", cat: "México", label: "Snorkel / máscara de buceo" },
    { id: "mx-rash-guard", cat: "México", label: "Lycra anti-UV para snorkel en cenotes" },
    { id: "mx-stomach-meds", cat: "México", label: "Bismuto y probióticos (agua local)" },
    { id: "mx-deet", cat: "México", label: "Repelente DEET (zona de dengue)" },
  ],
  portugal: [
    { id: "pt-euros", cat: "Portugal", label: "Euros en efectivo (tascos y mercados)" },
    { id: "pt-tram-pass", cat: "Portugal", label: "Pase de tram Lisboa (comprar en kiosco oficial)" },
    { id: "pt-sintra-tickets", cat: "Portugal", label: "Entradas Palácio da Pena y Quinta da Regaleira reservadas" },
    { id: "pt-comfy-shoes", cat: "Portugal", label: "Zapatos muy cómodos (Lisboa tiene muchas subidas)" },
    { id: "pt-car-rental", cat: "Portugal", label: "Auto alquilado para el Algarve y Sintra" },
  ],
};
