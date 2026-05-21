"use client";
import { Attraction } from "@/types";
import { useTravelStore } from "@/store/useTravelStore";

interface Props {
  attraction: Attraction;
  onClose: () => void;
}

export default function AttractionModal({ attraction, onClose }: Props) {
  const { activePins, toggleAttraction } = useTravelStore();
  const isActive = activePins.some(p => p.id === attraction.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-10 w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        {attraction.imageUrl && (
          <img
            src={attraction.imageUrl}
            alt={attraction.name}
            className="w-full h-48 object-cover"
          />
        )}
        {!attraction.imageUrl && (
          <div className="w-full h-24 bg-gradient-to-br from-brand-500 to-purple-600" />
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center text-sm hover:bg-black/60"
        >✕</button>

        {/* Content */}
        <div className="p-5 space-y-3 bg-white dark:bg-gray-800">
          <div>
            <span className="inline-block text-xs font-medium text-brand-500 uppercase tracking-wide bg-brand-50 dark:bg-brand-900/30 rounded-full px-2 py-0.5 mb-1">
              {attraction.region}
            </span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{attraction.name}</h2>
            {attraction.rating && (
              <div className="flex items-center gap-1 mt-1">
                {[1,2,3,4,5].map(star => (
                  <span key={star} className={`text-sm ${star <= Math.round(attraction.rating!) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-600'}`}>★</span>
                ))}
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-0.5">{attraction.rating}/5</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{attraction.description}</p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              💰 ~${attraction.costPerCouplePerDay} USD/día · 2 personas
            </span>
            <button
              onClick={() => toggleAttraction(attraction)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 hover:bg-red-100'
                  : 'bg-brand-500 text-white hover:bg-brand-600'
              }`}
            >
              {isActive ? '✕ Quitar pin' : '📍 Agregar pin'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
