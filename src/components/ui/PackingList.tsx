"use client";
import { useState } from "react";
import { useTravelStore } from "@/store/useTravelStore";
import { Destination } from "@/types";
import { BASE_PACKING_ITEMS, DEST_PACKING_ITEMS } from "@/data/packingData";

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
  const { packingItems, togglePackingItem, markAllPacking, resetPacking, selectedDestination, tripDays, tripDate, customPackingItems, addCustomPackingItem, removeCustomPackingItem } = useTravelStore();
  const [newItem, setNewItem] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const checkMonth = tripDate
    ? new Date(tripDate + 'T12:00:00').getMonth() + 1
    : new Date().getMonth() + 1;

  const destItems = selectedDestination ? (DEST_PACKING_ITEMS[selectedDestination.id] ?? []) : [];
  const seasonItems = selectedDestination ? getSeasonItems(selectedDestination, checkMonth) : [];
  const allItems = [...BASE_PACKING_ITEMS, ...destItems, ...seasonItems];

  const categories = [...new Set(allItems.map((i) => i.cat))];
  const checked = allItems.filter((i) => packingItems[i.id]).length + customPackingItems.filter(i => packingItems[i.id]).length;
  const total = allItems.length + customPackingItems.length;
  const allChecked = checked === total && total > 0;

  const visibleItems = activeCategory
    ? allItems.filter(i => i.cat === activeCategory)
    : allItems;
  const visibleCategories = activeCategory ? [activeCategory] : categories;

  const handleMarkAll = () => {
    const allIds = [...allItems.map(i => i.id), ...customPackingItems.map(i => i.id)];
    markAllPacking(allIds);
  };

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold">
            {allChecked ? '🎉 ¡Maleta lista!' : 'Maleta lista'}
          </p>
          <span className="text-lg font-bold">{checked}/{total}</span>
        </div>
        <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: total > 0 ? `${(checked / total) * 100}%` : '0%' }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          {tripDays > 0 && (
            <p className="text-xs opacity-75">
              Viaje de {tripDays} días{selectedDestination ? ` a ${selectedDestination.country}` : ""}
            </p>
          )}
          {!allChecked && total > 0 && (
            <button
              onClick={handleMarkAll}
              className="text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-full px-3 py-1 transition-colors ml-auto"
            >
              ✓ Marcar todo
            </button>
          )}
        </div>
      </div>

      {/* Category filter chips */}
      {categories.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${!activeCategory ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >
            Todas
          </button>
          {categories.map(cat => {
            const catItems = allItems.filter(i => i.cat === cat);
            const catChecked = catItems.filter(i => packingItems[i.id]).length;
            const catDone = catChecked === catItems.length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors flex items-center gap-1 ${activeCategory === cat ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              >
                {catDone && <span className="text-[10px]">✓</span>}
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Items by category */}
      {visibleCategories.map((cat) => (
        <div key={cat} className="space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{cat}</p>
            {(() => {
              const catItems = allItems.filter(i => i.cat === cat);
              const catChecked = catItems.filter(i => packingItems[i.id]).length;
              return (
                <span className="text-[10px] text-gray-400 dark:text-gray-500">{catChecked}/{catItems.length}</span>
              );
            })()}
          </div>
          {visibleItems
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
      {(!activeCategory || activeCategory === '✏️ Mis items') && customPackingItems.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">✏️ Mis items</p>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              {customPackingItems.filter(i => packingItems[i.id]).length}/{customPackingItems.length}
            </span>
          </div>
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
