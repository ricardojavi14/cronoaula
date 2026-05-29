import { useState } from "react";
import { toast } from "sonner";
import { MOMENT_COLORS } from "@/data/constants";

export function useAIAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [inputText, setInputText] = useState("");

  const handleAnalyze = async (
    setMetadata,
    setMoments,
    setExpandedMoments,
    setShowAIPanel,
  ) => {
    if (!inputText.trim()) return toast.error("Pega un texto para analizar");
    setAnalyzing(true);
    try {
      const response = await fetch("/integrations/google-gemini-2-5-pro/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `Eres un experto en planificación pedagógica para docentes de primaria en Perú. 
              Analiza el texto de una sesión de aprendizaje y extrae su estructura completa.
              Identifica: título, área curricular, grado, propósito de aprendizaje, materiales, momentos pedagógicos y sus actividades con duraciones.
              Momentos base: Actividad permanente, Inicio, Desarrollo, Pausa activa, Cierre, Metacognición, Retroalimentación.
              Si no hay tiempos, sugiere tiempos realistas para una sesión de 90 minutos.
              Responde ÚNICAMENTE con JSON válido.`,
            },
            {
              role: "user",
              content: `Analiza esta sesión de aprendizaje y devuelve la estructura JSON:\n\n${inputText}`,
            },
          ],
          json_schema: {
            name: "session_analysis",
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                area: { type: "string" },
                grade: { type: "string" },
                purpose: { type: "string" },
                evidence: { type: "string" },
                materials: { type: "string" },
                notes: { type: "string" },
                moments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      name: { type: "string" },
                      submoments: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            duration: { type: "integer" },
                            description: { type: "string" },
                            teacher_note: { type: "string" },
                          },
                          required: [
                            "name",
                            "duration",
                            "description",
                            "teacher_note",
                          ],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["type", "name", "submoments"],
                    additionalProperties: false,
                  },
                },
              },
              required: [
                "title",
                "area",
                "grade",
                "purpose",
                "evidence",
                "materials",
                "notes",
                "moments",
              ],
              additionalProperties: false,
            },
          },
        }),
      });
      if (!response.ok) throw new Error("Error en la respuesta de IA");
      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      setMetadata((prev) => ({
        ...prev,
        title: result.title || prev.title,
        area: result.area || prev.area,
        grade: result.grade || prev.grade,
        purpose: result.purpose || prev.purpose,
        evidence: result.evidence || prev.evidence,
        materials: result.materials || prev.materials,
        notes: result.notes || prev.notes,
      }));
      setMoments(
        result.moments.map((m, idx) => ({
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
      const expanded = {};
      result.moments.forEach((_, idx) => {
        expanded[idx] = true;
      });
      setExpandedMoments(expanded);
      toast.success("✨ Sesión analizada y cargada correctamente");
      setInputText("");
      setShowAIPanel(false);
    } catch (err) {
      console.error(err);
      toast.error("Error al analizar. Verifica tu texto e intenta de nuevo.");
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    analyzing,
    inputText,
    setInputText,
    handleAnalyze,
  };
}
