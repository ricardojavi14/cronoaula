import { useState, useEffect } from "react";
import { MOMENT_COLORS } from "@/data/constants";
import { MOMENT_TEMPLATES } from "@/data/templates";

export function useSessionState(teacher) {
  const [metadata, setMetadata] = useState({
    title: "",
    area: "Comunicación",
    grade: teacher?.grade || "",
    date: new Date().toISOString().split("T")[0],
    start_time: "08:00",
    end_time: "09:30",
    total_duration: 90,
    purpose: "",
    evidence: "",
    materials: "",
    notes: "",
  });

  const [moments, setMoments] = useState([]);
  const [settings, setSettings] = useState({
    autoAdvance: false,
    font: "inherit",
    fontSize: "base",
    theme: "dark",
  });

  // Load template when area changes
  useEffect(() => {
    if (moments.length === 0 && MOMENT_TEMPLATES[metadata.area]) {
      setMoments(
        MOMENT_TEMPLATES[metadata.area].map((m, idx) => ({
          ...m,
          id: crypto.randomUUID(),
          order_index: idx,
          is_active: true,
          color: MOMENT_COLORS[idx % MOMENT_COLORS.length].hex,
          bgImage: "",
          submoments: m.submoments.map((sm, sidx) => ({
            ...sm,
            id: crypto.randomUUID(),
            order_index: sidx,
            status: "pending",
          })),
        })),
      );
    }
  }, [metadata.area]);

  // Auto-save draft
  useEffect(() => {
    if (metadata.title || moments.length > 0) {
      localStorage.setItem(
        "cronoaula_draft",
        JSON.stringify({ metadata, moments, settings }),
      );
    }
  }, [metadata, moments, settings]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("cronoaula_draft");
    if (savedDraft && !metadata.title && moments.length === 0) {
      try {
        const {
          metadata: dMeta,
          moments: dMoments,
          settings: dSettings,
        } = JSON.parse(savedDraft);
        if (confirm("¿Recuperar la sesión que estabas editando?")) {
          setMetadata(dMeta);
          setMoments(dMoments);
          if (dSettings) setSettings(dSettings);
        } else {
          localStorage.removeItem("cronoaula_draft");
        }
      } catch (err) {}
    }
  }, []);

  return {
    metadata,
    setMetadata,
    moments,
    setMoments,
    settings,
    setSettings,
  };
}
