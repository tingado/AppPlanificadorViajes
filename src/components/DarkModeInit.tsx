"use client";
import { useEffect } from "react";
import { useTravelStore } from "@/store/useTravelStore";

export default function DarkModeInit() {
  const { darkMode } = useTravelStore();
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);
  return null;
}
