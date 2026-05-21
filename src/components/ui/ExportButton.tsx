"use client";
import { useState } from "react";
import { useTravelStore } from "@/store/useTravelStore";
import { Destination, ItineraryDay, CurrencyRates } from "@/types";
import { BASE_PACKING_ITEMS, DEST_PACKING_ITEMS } from "@/data/packingData";

function fmt(n: number) {
  return new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 }).format(Math.round(n));
}

function generateHTML(
  dest: Destination,
  days: ItineraryDay[],
  rates: CurrencyRates,
  tripDate: string | null,
  dayNotes: Record<number, string>,
  packingChecked: Record<string, boolean>,
  allPackingItems: { id: string; cat: string; label: string }[],
  intlFlightUSD: number
): string {
  const destination = dest.country;
  const flag = dest.flag ?? '🌍';
  const code = dest.currencyCode;
  const localRate = rates[`USD_TO_${code}`] ?? 1;
  const visaFeeUSD = (dest.visaFeePerPersonUSD ?? 0) * 2;
  const destinationUSD = days.reduce((s: number, d: ItineraryDay) => s + d.estimatedCostUSD, 0);
  const totalUSD = destinationUSD + intlFlightUSD + visaFeeUSD;
  const totalCLP = totalUSD * rates.USD_TO_CLP;
  const totalLocal = totalUSD * localRate;

  const startDate = tripDate ? new Date(tripDate + 'T12:00:00') : null;

  const dayRows = days.map(d => {
    const dayDate = startDate
      ? (() => { const dt = new Date(startDate); dt.setDate(dt.getDate() + d.day - 1); return dt.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }); })()
      : '';
    const attractionNames = d.attractions.length > 0
      ? d.attractions.map(a => a.name).join(', ')
      : d.isTransitDay ? '✈ Traslado' : 'Día libre';
    const flightNote = d.flightCostUSD ? `<br><small style="color:#d97706">Vuelo est. $${fmt(d.flightCostUSD)} USD</small>` : '';
    const generatedNote = d.notes && !d.isTransitDay ? `<br><small style="color:#6b7280">${d.notes}</small>` : '';
    const userNote = dayNotes[d.day] ? `<br><small style="color:#7c3aed;font-style:italic">"${dayNotes[d.day]}"</small>` : '';
    return `
    <tr style="background:${d.isTransitDay ? '#fef3c7' : 'white'}">
      <td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;white-space:nowrap">
        Día ${d.day}${dayDate ? `<br><small style="color:#9ca3af">${dayDate}</small>` : ''}
      </td>
      <td style="padding:8px;border:1px solid #e5e7eb">${attractionNames}${flightNote}${generatedNote}${userNote}</td>
      <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;white-space:nowrap">${fmt(d.estimatedCostUSD * rates.USD_TO_CLP)} CLP</td>
      <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;white-space:nowrap">$${fmt(d.estimatedCostUSD)} USD</td>
    </tr>`;
  }).join('');

  const activityDays = days.filter(d => !d.isTransitDay && d.attractions.length > 0).length;
  const freeDays = days.filter(d => !d.isTransitDay && d.attractions.length === 0).length;
  const transitDays = days.filter(d => d.isTransitDay).length;

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>Itinerario ${destination}</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:900px;margin:40px auto;color:#111;padding:0 20px}
  h1{color:#c026d3;margin-bottom:4px}
  .subtitle{color:#6b7280;margin-bottom:24px}
  .summary{background:linear-gradient(135deg,#c026d3,#7c3aed);color:white;border-radius:12px;padding:20px;margin-bottom:24px}
  .summary h2{margin:0 0 8px;font-size:14px;opacity:0.8;text-transform:uppercase;letter-spacing:0.05em}
  .amounts{display:flex;gap:24px;flex-wrap:wrap}
  .amount{text-align:center}
  .amount .value{font-size:22px;font-weight:700}
  .amount .label{font-size:12px;opacity:0.75}
  .stats{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
  .stat{background:rgba(255,255,255,0.2);border-radius:20px;padding:2px 10px;font-size:11px}
  table{width:100%;border-collapse:collapse;font-size:14px}
  th{background:#c026d3;color:white;padding:10px;text-align:left}
  tr:hover{background:#f9fafb}
  .footer{margin-top:40px;color:#9ca3af;font-size:12px;text-align:center;border-top:1px solid #e5e7eb;padding-top:16px}
</style>
</head><body>
<h1>${flag} Luna de Miel — ${destination}</h1>
<p class="subtitle">Itinerario de ${days.length} días · Generado con Luna de Miel Planner</p>

<div class="summary">
  <h2>Resumen de costos · 2 personas</h2>
  <div class="amounts">
    <div class="amount"><div class="value">${fmt(totalCLP)}</div><div class="label">CLP</div></div>
    <div class="amount"><div class="value">$${fmt(totalUSD)}</div><div class="label">USD</div></div>
    ${code !== 'CLP' ? `<div class="amount"><div class="value">${fmt(totalLocal)}</div><div class="label">${code}</div></div>` : ''}
  </div>
  <p style="font-size:12px;opacity:0.7;margin-top:8px">~$${fmt(totalUSD / 2)} USD por persona</p>
  <div class="stats">
    ${activityDays > 0 ? `<span class="stat">${activityDays} días de actividad</span>` : ''}
    ${freeDays > 0 ? `<span class="stat">${freeDays} días libres</span>` : ''}
    ${transitDays > 0 ? `<span class="stat">${transitDays} traslados</span>` : ''}
  </div>
</div>

${(dest.visaInfo || dest.travelTips?.length) ? `
<div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:24px">
  <h2 style="color:#374151;font-size:15px;margin-top:0">ℹ️ Información del destino</h2>
  ${dest.visaInfo ? `<p style="margin:6px 0;font-size:13px"><strong>🛂 Visa:</strong> ${dest.visaInfo}</p>` : ''}
  ${dest.climate ? `<p style="margin:6px 0;font-size:13px"><strong>🌡️ Clima:</strong> ${dest.climate}</p>` : ''}
  ${dest.bestMonths ? `<p style="margin:6px 0;font-size:13px"><strong>📅 Mejor época:</strong> ${dest.bestMonths}</p>` : ''}
  ${dest.romanticHighlights?.length ? `<div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:8px;padding:10px;margin:8px 0"><p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#e11d48;text-transform:uppercase;letter-spacing:0.05em">💑 Experiencias románticas imperdibles</p>${dest.romanticHighlights.map(h => `<p style="margin:3px 0;font-size:13px;color:#be123c">${h}</p>`).join('')}</div>` : ''}
  ${dest.travelTips?.length ? `<p style="margin:8px 0 4px;font-size:13px"><strong>💡 Tips de viaje:</strong></p><ul style="margin:0;padding-left:18px;font-size:13px">${dest.travelTips.map(t => `<li style="margin:3px 0">${t}</li>`).join('')}</ul>` : ''}
  ${dest.freeDayHints?.length ? `<p style="margin:8px 0 4px;font-size:13px"><strong>🌅 Ideas para días libres:</strong></p><ul style="margin:0;padding-left:18px;font-size:13px">${dest.freeDayHints.map(h => `<li style="margin:3px 0">${h}</li>`).join('')}</ul>` : ''}
</div>` : ''}

<h2 style="color:#374151;font-size:16px">Detalle por día</h2>
<table>
  <tr><th>Día</th><th>Actividad</th><th>CLP</th><th>USD</th></tr>
  ${dayRows}
  <tr style="background:#fef9c3"><td colspan="2" style="padding:8px;border:1px solid #e5e7eb;font-weight:600">🛫 Vuelo Santiago → ${dest.country} (ida+vuelta, 2 pax)</td><td style="padding:8px;border:1px solid #e5e7eb;text-align:right">${fmt(intlFlightUSD * rates.USD_TO_CLP)} CLP</td><td style="padding:8px;border:1px solid #e5e7eb;text-align:right">$${fmt(intlFlightUSD)} USD</td></tr>
  ${visaFeeUSD > 0 ? `<tr style="background:#fef3c7"><td colspan="2" style="padding:8px;border:1px solid #e5e7eb;font-weight:600">🛂 Visa (${dest.country}) · 2 personas</td><td style="padding:8px;border:1px solid #e5e7eb;text-align:right">${fmt(visaFeeUSD * rates.USD_TO_CLP)} CLP</td><td style="padding:8px;border:1px solid #e5e7eb;text-align:right">$${fmt(visaFeeUSD)} USD</td></tr>` : ''}
  <tr style="background:#f3e8ff;font-weight:700">
    <td colspan="2" style="padding:10px;border:1px solid #e5e7eb">📊 TOTAL (2 personas)</td>
    <td style="padding:10px;border:1px solid #e5e7eb;text-align:right;color:#7c3aed">${fmt(totalUSD * rates.USD_TO_CLP)} CLP</td>
    <td style="padding:10px;border:1px solid #e5e7eb;text-align:right;color:#7c3aed">$${fmt(totalUSD)} USD</td>
  </tr>
</table>

${allPackingItems.length > 0 ? `
<h2 style="color:#374151;font-size:16px;margin-top:32px">🧳 Lista de equipaje</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;font-size:13px">
  ${(() => {
    const cats = [...new Set(allPackingItems.map(i => i.cat))];
    return cats.map(cat => `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:10px">
        <p style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 6px">${cat}</p>
        ${allPackingItems.filter(i => i.cat === cat).map(item => `
          <div style="display:flex;align-items:center;gap:6px;margin:3px 0">
            <span style="width:14px;height:14px;border-radius:50%;border:2px solid ${packingChecked[item.id] ? '#c026d3' : '#d1d5db'};background:${packingChecked[item.id] ? '#c026d3' : 'white'};display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">
              ${packingChecked[item.id] ? '<span style="color:white;font-size:9px;font-weight:700">✓</span>' : ''}
            </span>
            <span style="color:${packingChecked[item.id] ? '#9ca3af' : '#374151'};text-decoration:${packingChecked[item.id] ? 'line-through' : 'none'}">${item.label}</span>
          </div>`).join('')}
      </div>`).join('');
  })()}
</div>` : ''}

<div class="footer">Generado con Luna de Miel Planner · Estimaciones aproximadas · Precios referenciales</div>
</body></html>`;
}

export default function ExportButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { generatedItinerary, selectedDestination, currencyRates, tripDate, dayNotes, packingItems, customPackingItems, budgetOverrides } = useTravelStore();

  if (!selectedDestination || generatedItinerary.length === 0) return null;

  const code = selectedDestination.currencyCode;
  const intlFlightUSD = budgetOverrides.internationalFlightUSD ?? selectedDestination.estimatedFlightFromChileUSD ?? 3500;

  const handlePDF = () => {
    setOpen(false);
    document.body.classList.add('printing');
    window.print();
    window.addEventListener('afterprint', () => {
      document.body.classList.remove('printing');
    }, { once: true });
  };

  const handleHTML = () => {
    setOpen(false);
    const destItems = DEST_PACKING_ITEMS[selectedDestination.id] ?? [];
    const customItems = customPackingItems.map(i => ({ id: i.id, cat: '✏️ Mis items', label: i.label }));
    const allItems = [...BASE_PACKING_ITEMS, ...destItems, ...customItems];
    const html = generateHTML(
      selectedDestination,
      generatedItinerary,
      currencyRates,
      tripDate,
      dayNotes,
      packingItems,
      allItems,
      intlFlightUSD
    );
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `itinerario-${selectedDestination.country.toLowerCase().replace(/\s/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildShareText = () => {
    const totalUSD = generatedItinerary.reduce((s, d) => s + d.estimatedCostUSD, 0) + intlFlightUSD;
    return `✈️ Luna de Miel — ${selectedDestination.flag ?? ''} ${selectedDestination.country} · ${generatedItinerary.length} días\n\n` +
      generatedItinerary.map(d => {
        const names = d.isTransitDay ? '✈ Traslado' : d.attractions.map(a => a.name).join(' + ') || 'Día libre';
        return `Día ${d.day}: ${names}`;
      }).join('\n') +
      `\n\n💰 Total estimado: ~$${fmt(totalUSD)} USD (2 personas)`;
  };

  const handleShare = async () => {
    setOpen(false);
    const text = buildShareText();
    if (navigator.share) {
      await navigator.share({ title: `Itinerario ${selectedDestination.country}`, text });
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    setOpen(false);
    const text = buildShareText();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 border border-brand-300 dark:border-brand-700 rounded-lg px-3 py-1.5 hover:bg-brand-50 dark:hover:bg-brand-900/20"
      >
        ⬇ Exportar
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-[140px]">
            <button onClick={handlePDF} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
              🖨 Guardar PDF
            </button>
            <button onClick={handleHTML} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
              📄 Descargar HTML
            </button>
            <button onClick={handleShare} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
              {copied ? '✅ Copiado!' : '🔗 Compartir'}
            </button>
            <button onClick={handleWhatsApp} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-green-600 dark:text-green-400">
              💬 WhatsApp
            </button>
          </div>
        </>
      )}
    </div>
  );
}
