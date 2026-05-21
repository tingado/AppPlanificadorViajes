"use client";
import { useState } from "react";
import { useTravelStore } from "@/store/useTravelStore";
import { Destination } from "@/types";

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

function getSeasonItems(dest: Destination, month: number): { id: string; cat: string; label: string }[] {
  const items: { id: string; cat: string; label: string }[] = [];
  if (dest.avoidMonths?.includes(month)) {
    items.push(
      { id: 'season-rain-jacket', cat: 'Temporada', label: 'Chaqueta impermeable (lluvia intensa)' },
      { id: 'season-waterproof-bag', cat: 'Temporada', label: 'Bolsa impermeable para electrónicos' },
      { id: 'season-quick-dry', cat: 'Temporada', label: 'Ropa de secado rápido' },
    );
  } else if (dest.goodMonths?.includes(month)) {
    if (['japan'].includes(dest.id) && [11,12,1,2].includes(month)) {
      items.push(
        { id: 'season-coat', cat: 'Temporada', label: 'Abrigo para frío (Japón invierno)' },
        { id: 'season-layers', cat: 'Temporada', label: 'Ropa en capas (termal)' },
      );
    }
    if (['bali','thailand','philippines'].includes(dest.id)) {
      items.push(
        { id: 'season-beach', cat: 'Temporada', label: 'Accesorios de playa (temporada seca)' },
      );
    }
  }
  return items;
}

export default function PackingList() {
  const { packingItems, togglePackingItem, resetPacking, selectedDestination, tripDays, tripDate, customPackingItems, addCustomPackingItem, removeCustomPackingItem } = useTravelStore();
  const [newItem, setNewItem] = useState('');

  const checkMonth = tripDate
    ? new Date(tripDate + 'T12:00:00').getMonth() + 1
    : new Date().getMonth() + 1;

  const destItems = selectedDestination ? (DEST_ITEMS[selectedDestination.id] ?? []) : [];
  const seasonItems = selectedDestination ? getSeasonItems(selectedDestination, checkMonth) : [];
  const allItems = [...BASE_ITEMS, ...destItems, ...seasonItems];

  const categories = [...new Set(allItems.map((i) => i.cat))];
  const checked = allItems.filter((i) => packingItems[i.id]).length + customPackingItems.filter(i => packingItems[i.id]).length;
  const total = allItems.length + customPackingItems.length;

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

      {/* Custom items */}
      {customPackingItems.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">✏️ Mis items</p>
          {customPackingItems.map(item => (
            <div key={item.id} className="flex items-center gap-2">
              <button
                onClick={() => togglePackingItem(item.id)}
                className="flex-1 flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${packingItems[item.id] ? 'bg-brand-500 border-brand-500' : 'border-gray-300 dark:border-gray-600'}`}>
                  {packingItems[item.id] && <span className="text-white text-xs">✓</span>}
                </div>
                <span className={`text-sm transition-colors ${packingItems[item.id] ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
                  {item.label}
                </span>
              </button>
              <button
                onClick={() => removeCustomPackingItem(item.id)}
                className="text-gray-300 dark:text-gray-600 hover:text-red-400 text-sm px-1 shrink-0"
                title="Eliminar"
              >✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Add custom item */}
      <form
        onSubmit={e => {
          e.preventDefault();
          const v = newItem.trim();
          if (v) { addCustomPackingItem(v); setNewItem(''); }
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder="Agregar ítem personalizado..."
          className="flex-1 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-400"
        />
        <button
          type="submit"
          disabled={!newItem.trim()}
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 border border-brand-300 dark:border-brand-700 rounded-lg px-3 py-2 hover:bg-brand-50 dark:hover:bg-brand-900/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Añadir
        </button>
      </form>

      {/* Reset */}
      {checked > 0 && (
        <button
          onClick={resetPacking}
          className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 w-full text-center py-2"
        >
          ↺ Limpiar marcas
        </button>
      )}
    </div>
  );
}
