"use client";
import { useEffect } from "react";
import { useTravelStore } from "@/store/useTravelStore";

export default function StoreHydration() {
  useEffect(() => {
    useTravelStore.persist.rehydrate();
  }, []);
  return null;
}
