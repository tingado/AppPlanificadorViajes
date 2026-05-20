"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

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

  if (isDesktop === null) return null;

  return (
    <main className="h-screen w-full">
      {isDesktop ? <DesktopLayout /> : <MobileLayout />}
    </main>
  );
}
