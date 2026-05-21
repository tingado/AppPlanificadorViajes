"use client";
import { useState } from "react";
import { useTravelStore } from "@/store/useTravelStore";
import { ItineraryDay, CurrencyRates } from "@/types";

function fmt(n: number) {
  return new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 }).format(Math.round(n));
}

function generateHTML(destination: string, days: ItineraryDay[], rates: CurrencyRates, code: string): string {
  const localRate = rates[`USD_TO_${code}`] ?? 1;
  const totalUSD = days.reduce((s: number, d: ItineraryDay) => s + d.estimatedCostUSD, 0);
  const totalCLP = totalUSD * rates.USD_TO_CLP;
  const totalLocal = totalUSD * localRate;

  const dayRows = days.map(d => `
    <tr style="background:${d.isTransitDay ? '#fef3c7' : 'white'}">
      <td style="padding:8px;border:1px solid #e5e7eb;font-weight:600">Día ${d.day}</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${d.isTransitDay ? '✈ Traslado' : d.attractions[0]?.name ?? 'Día libre'}${d.flightCostUSD ? `<br><small>Vuelo est. $${fmt(d.flightCostUSD)} USD</small>` : ''}</td>
      <td style="padding:8px;border:1px solid #e5e7eb;text-align:right">${fmt(d.estimatedCostUSD * rates.USD_TO_CLP)} CLP</td>
      <td style="padding:8px;border:1px solid #e5e7eb;text-align:right">$${fmt(d.estimatedCostUSD)} USD</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>Itinerario ${destination}</title>
<style>body{font-family:sans-serif;max-width:800px;margin:40px auto;color:#111}h1{color:#c026d3}table{width:100%;border-collapse:collapse}th{background:#c026d3;color:white;padding:8px;text-align:left}</style>
</head><body>
<h1>🌏 Luna de Miel — ${destination}</h1>
<p>Itinerario de ${days.length} días</p>
<h2>Resumen de costos (2 personas)</h2>
<p><strong>${fmt(totalCLP)} CLP</strong> · $${fmt(totalUSD)} USD · ${fmt(totalLocal)} ${code}</p>
<h2>Detalle por día</h2>
<table><tr><th>Día</th><th>Actividad</th><th>CLP</th><th>USD</th></tr>${dayRows}</table>
<p style="margin-top:40px;color:#888;font-size:12px">Generado con Luna de Miel Planner · Estimaciones aproximadas</p>
</body></html>`;
}

export default function ExportButton() {
  const [open, setOpen] = useState(false);
  const { generatedItinerary, selectedDestination, currencyRates } = useTravelStore();

  if (!selectedDestination || generatedItinerary.length === 0) return null;

  const code = selectedDestination.currencyCode;

  const handlePDF = () => {
    setOpen(false);
    window.print();
  };

  const handleHTML = () => {
    setOpen(false);
    const html = generateHTML(selectedDestination.country, generatedItinerary, currencyRates, code);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `itinerario-${selectedDestination.country.toLowerCase().replace(/\s/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 border border-brand-300 rounded-lg px-3 py-1.5 hover:bg-brand-50"
      >
        ⬇ Exportar
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[140px]">
            <button onClick={handlePDF} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
              🖨 Guardar PDF
            </button>
            <button onClick={handleHTML} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
              📄 Descargar HTML
            </button>
          </div>
        </>
      )}
    </div>
  );
}
