"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTravelStore, destinations } from "@/store/useTravelStore";

const MobileLayout = dynamic(() => import("@/components/ui/MobileLayout"), { ssr: false });
const DesktopLayout = dynamic(() => import("@/components/ui/DesktopLayout"), { ssr: false });

export default function Home() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const destId = params.get('dest');
    const days = params.get('days');
    const pins = params.get('pins');

    if (destId) {
      const { setSelectedDestination, setTripDays, toggleAttraction, generateItineraryAction } = useTravelStore.getState();
      const dest = destinations.find(d => d.id === destId);
      if (dest) {
        setSelectedDestination(dest);
        if (days) setTripDays(Number(days));
        if (pins) {
          const pinIds = pins.split(',').filter(Boolean);
          pinIds.forEach(pinId => {
            const attraction = dest.attractions.find(a => a.id === pinId);
            if (attraction) toggleAttraction(attraction);
          });
          if (pinIds.length > 0) {
            // Auto-generate after state settles so the itinerary is ready on first view
            setTimeout(() => generateItineraryAction(), 50);
          }
        }
      }
    }
  }, []); // Solo al montar

  if (isDesktop === null) return null;

  return (
    <main className="h-screen w-full">
      {isDesktop ? <DesktopLayout /> : <MobileLayout />}
    </main>
  );
}
