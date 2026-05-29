export async function POST(request) {
  try {
    const { text } = await request.json();
    if (!text || !text.trim()) {
      return Response.json({ error: "No text provided" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_CREATE_APP_URL || "";
    const response = await fetch(
      `${baseUrl}/integrations/google-gemini-2-5-pro/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `Eres un experto en planificación pedagógica para docentes de primaria en Perú. 
              Analiza el texto de una sesión de aprendizaje y extrae su estructura completa.
              Identifica: título, área curricular, grado, propósito de aprendizaje, materiales, evidencia, notas y momentos pedagógicos con sus actividades y duraciones.
              Momentos base: Actividad permanente, Inicio, Desarrollo, Pausa activa, Cierre, Metacognición, Retroalimentación.
              Si no hay tiempos, sugiere tiempos realistas para una sesión de 90 minutos.
              Responde ÚNICAMENTE con JSON válido.`,
            },
            {
              role: "user",
              content: `Analiza esta sesión de aprendizaje:\n\n${text}`,
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
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI API error:", errText);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content in AI response");
    const result = JSON.parse(content);
    return Response.json(result);
  } catch (error) {
    console.error("analyze-session error:", error);
    return Response.json(
      { error: "Failed to analyze session" },
      { status: 500 },
    );
  }
}
