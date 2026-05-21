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
};
