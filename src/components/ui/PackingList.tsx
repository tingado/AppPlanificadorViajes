"use client";
import { useState } from "react";
import { useTravelStore } from "@/store/useTravelStore";

export default function PackingList() {
  const { packingList, packedItems, addPackingItem, togglePackedItem, resetPackingList } = useTravelStore();
  const [newItem, setNewItem] = useState("");
  const packed = packedItems.length;
  const total = packingList.length;

  return (
    <div className="space-y-3">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500">{packed}/{total} empacados</p>
        <button onClick={resetPackingList} className="text-xs text-gray-400 hover:text-red-500">Resetear</button>
      </div>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all"
          style={{ width: total > 0 ? `${(packed / total) * 100}%` : '0%' }}
        />
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {packingList.map((item) => {
          const done = packedItems.includes(item);
          return (
            <button
              key={item}
              onClick={() => togglePackedItem(item)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                done ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
              }`}
            >
              <span className="text-base">{done ? '✅' : '⬜'}</span>
              <span className={done ? 'line-through opacity-60' : ''}>{item}</span>
            </button>
          );
        })}
      </div>

      {/* Add item */}
      <div className="flex gap-2">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newItem.trim()) {
              addPackingItem(newItem.trim());
              setNewItem("");
            }
          }}
          placeholder="Agregar ítem…"
          className="flex-1 text-xs rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-400"
        />
        <button
          onClick={() => {
            if (newItem.trim()) {
              addPackingItem(newItem.trim());
              setNewItem("");
            }
          }}
          className="px-3 py-2 bg-brand-500 text-white rounded-lg text-xs font-semibold"
        >+</button>
      </div>
    </div>
  );
}
