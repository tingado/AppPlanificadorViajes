"use client";

import dynamic from "next/dynamic";

const MobileLayout = dynamic(() => import("@/components/ui/MobileLayout"), { ssr: false });
const DesktopLayout = dynamic(() => import("@/components/ui/DesktopLayout"), { ssr: false });

export default function Home() {
  return (
    <main className="h-screen w-full">
      {/* Show DesktopLayout on md+ screens, MobileLayout below */}
      <div className="hidden md:block h-full">
        <DesktopLayout />
      </div>
      <div className="block md:hidden h-full">
        <MobileLayout />
      </div>
    </main>
  );
}
