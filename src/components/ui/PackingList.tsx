"use client";
import { useTravelStore } from "@/store/useTravelStore";

const BASE_ITEMS = [
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

// Items específicos por destino
const DEST_ITEMS: Record<string, { id: string; cat: string; label: string }[]> = {
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
};

export default function PackingList() {
  const { packingItems, togglePackingItem, resetPacking, selectedDestination, tripDays } = useTravelStore();

  const destItems = selectedDestination ? (DEST_ITEMS[selectedDestination.id] ?? []) : [];
  const allItems = [...BASE_ITEMS, ...destItems];

  const categories = [...new Set(allItems.map((i) => i.cat))];
  const checked = allItems.filter((i) => packingItems[i.id]).length;
  const total = allItems.length;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold">Maleta lista</p>
          <span className="text-lg font-bold">{checked}/{total}</span>
        </div>
        <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${(checked / total) * 100}%` }}
          />
        </div>
        {tripDays > 0 && (
          <p className="text-xs opacity-75 mt-1">
            Viaje de {tripDays} días{selectedDestination ? ` a ${selectedDestination.country}` : ""}
          </p>
        )}
      </div>

      {/* Items by category */}
      {categories.map((cat) => (
        <div key={cat} className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{cat}</p>
          {allItems
            .filter((i) => i.cat === cat)
            .map((item) => (
              <button
                key={item.id}
                onClick={() => togglePackingItem(item.id)}
                className="w-full flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    packingItems[item.id]
                      ? "bg-brand-500 border-brand-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {packingItems[item.id] && <span className="text-white text-xs">✓</span>}
                </div>
                <span
                  className={`text-sm transition-colors ${
                    packingItems[item.id] ? "line-through text-gray-400" : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            ))}
        </div>
      ))}

      {/* Reset */}
      {checked > 0 && (
        <button
          onClick={resetPacking}
          className="text-xs text-gray-400 hover:text-red-500 w-full text-center py-2"
        >
          ↺ Limpiar lista
        </button>
      )}
    </div>
  );
}
