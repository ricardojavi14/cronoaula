import { makeId } from "./localStore.js";

const COLORS = [
  "#2563EB",
  "#059669",
  "#7C3AED",
  "#D97706",
  "#DC2626",
  "#0891B2",
  "#9333EA",
  "#CA8A04",
];

const SECTION_LABELS = [
  "TITULO DE LA SESION",
  "TITULO",
  "AREA",
  "GRADO",
  "DURACION TOTAL",
  "DURACION",
  "PROPOSITO",
  "PRODUCTO",
  "EVIDENCIA",
  "RECURSOS",
  "MATERIALES",
  "CRITERIOS",
  "DUA",
  "EVALUACION",
  "METACOGNICION",
  "MOMENTO",
  "NOMBRE",
  "ACTIVIDADES",
  "SUBMOMENTO",
  "ACTIVIDAD",
  "PASO",
  "HORARIO",
  "TIPO",
];

function clean(text = "") {
  return String(text)
    .replace(/\r/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\u00A0/g, " ")
    .trim();
}

function stripAccents(text = "") {
  return String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeLabel(text = "") {
  return stripAccents(text).trim().toUpperCase();
}

function valueAfter(text, labels) {
  const wanted = labels.map(normalizeLabel);
  for (const line of text.split("\n")) {
    const match = line.match(/^\s*([^:：-]{2,70})\s*[:：-]\s*(.+)$/);
    if (!match) continue;
    const label = normalizeLabel(match[1]);
    if (wanted.some((item) => label === item || label.startsWith(item))) {
      return match[2].trim();
    }
  }
  return "";
}

function sectionValue(text, labels) {
  const wanted = labels.map(normalizeLabel);
  const captured = [];
  let active = false;

  for (const line of text.split("\n")) {
    const match = line.match(/^\s*([^:：-]{2,70})\s*[:：-]\s*(.*)$/);
    if (match) {
      const label = normalizeLabel(match[1]);
      const isKnown = SECTION_LABELS.some((item) => {
        const known = normalizeLabel(item);
        return label === known || label.startsWith(known);
      });
      const isWanted = wanted.some(
        (item) => label === item || label.startsWith(item),
      );

      if (isWanted) {
        active = true;
        captured.length = 0;
        if (match[2]?.trim()) captured.push(match[2].trim());
        continue;
      }

      if (active && isKnown) break;
    }

    if (active) {
      const value = line.trim();
      if (value) captured.push(value);
    }
  }

  return captured.join("\n").trim();
}

function minutesFrom(text, fallback = 0) {
  const m = String(text || "").match(/(\d{1,3})\s*(minutos|min|m|')/i);
  return m ? parseInt(m[1], 10) : fallback;
}

function splitBlocks(text) {
  const lines = text.split("\n");
  const starts = [];
  lines.forEach((line, idx) => {
    const normalized = normalizeLabel(line);
    if (
      /^MOMENTO\s*\d*/.test(normalized) ||
      /^INICIO\b/.test(normalized) ||
      /^DESARROLLO\b/.test(normalized) ||
      /^CIERRE\b/.test(normalized)
    ) {
      starts.push(idx);
    }
  });
  if (!starts.length) return [];
  return starts
    .map((start, i) =>
      lines.slice(start, starts[i + 1] || lines.length).join("\n").trim(),
    )
    .filter(Boolean);
}

function extractName(block, idx) {
  const explicit = valueAfter(block, ["NOMBRE", "TITULO DEL MOMENTO", "MOMENTO"]);
  if (explicit) return explicit;
  const first = block.split("\n").find((l) => l.trim())?.trim();
  return (
    first?.replace(/^MOMENTO\s*\d*\s*[:.-]?\s*/i, "").trim() ||
    `Momento ${idx + 1}`
  );
}

function removeKnownHeaderLines(text) {
  return text
    .split("\n")
    .filter((line) => {
      const match = line.match(/^\s*([^:：-]{2,70})\s*[:：-]/);
      if (!match) return true;
      const label = normalizeLabel(match[1]);
      return ![
        "MOMENTO",
        "NOMBRE",
        "DURACION",
        "HORARIO",
        "TIPO",
      ].some((item) => label === item || label.startsWith(item));
    })
    .join("\n")
    .trim();
}

function extractActivities(block) {
  const activity = sectionValue(block, ["ACTIVIDADES", "ACTIVIDAD"]);
  return removeKnownHeaderLines(activity || block);
}

function splitExplicitSubmoments(block) {
  const lines = block.split("\n");
  const starts = [];
  lines.forEach((line, idx) => {
    const normalized = normalizeLabel(line);
    if (/^(SUBMOMENTO|ACTIVIDAD|PASO)\s*\d+/.test(normalized)) {
      starts.push(idx);
    }
  });

  if (!starts.length) return [];

  return starts
    .map((start, i) =>
      lines.slice(start, starts[i + 1] || lines.length).join("\n").trim(),
    )
    .filter(Boolean)
    .map((chunk, idx) => {
      const first =
        chunk.split("\n").find((line) => line.trim())?.trim() ||
        `Actividad ${idx + 1}`;
      const nameFromHeader = first
        .replace(/^(SUBMOMENTO|ACTIVIDAD|PASO)\s*\d*\s*[:.-]?\s*/i, "")
        .trim();
      const duration = minutesFrom(
        valueAfter(chunk, ["DURACION", "DURACIÓN"]),
        minutesFrom(first, 0),
      );
      const description = extractActivities(chunk);

      return {
        id: makeId("submoment"),
        name: nameFromHeader || `Actividad ${idx + 1}`,
        duration: duration || 5,
        description:
          description || "Revisa y completa esta actividad importada.",
        teacher_note: description || "Submomento importado. Revisa detalles.",
        order_index: idx,
        status: "pending",
      };
    });
}

export function parseSessionText(input) {
  const text = clean(input);
  if (!text) throw new Error("No hay texto para importar");

  const title =
    sectionValue(text, [
      "TITULO DE LA SESION",
      "TÍTULO DE LA SESIÓN",
      "TITULO",
      "TÍTULO",
    ]) || "Sesion importada";
  const area = sectionValue(text, ["AREA", "ÁREA"]) || "Comunicacion";
  const grade = valueAfter(text, ["GRADO"]) || "";
  const purpose = sectionValue(text, [
    "PROPOSITO",
    "PROPÓSITO",
    "PROPOSITO DE LA SESION",
    "PROPÓSITO DE LA SESIÓN",
  ]);
  const product = sectionValue(text, [
    "PRODUCTO",
    "PRODUCTO DE LA SESION",
    "PRODUCTO DE LA SESIÓN",
  ]);
  const evidence = sectionValue(text, ["EVIDENCIA"]) || product;
  const resources = sectionValue(text, ["RECURSOS"]);
  const materials =
    sectionValue(text, ["MATERIALES", "RECURSOS Y MATERIALES"]) || resources;
  const criteria = sectionValue(text, [
    "CRITERIOS",
    "CRITERIOS DE EVALUACION",
    "CRITERIOS DE EVALUACIÓN",
  ]);
  const dua = sectionValue(text, ["DUA", "ADAPTACION DUA", "ADAPTACIÓN DUA"]);
  const evaluation = sectionValue(text, ["EVALUACION", "EVALUACIÓN"]);
  const metacognition = sectionValue(text, [
    "METACOGNICION",
    "METACOGNICIÓN",
  ]);
  const total_duration = minutesFrom(
    sectionValue(text, [
      "DURACION TOTAL",
      "DURACIÓN TOTAL",
      "DURACION",
      "DURACIÓN",
    ]),
    minutesFrom(text, 90),
  );

  let moments = splitBlocks(text).map((block, idx) => {
    const duration = minutesFrom(
      valueAfter(block, ["DURACION", "DURACIÓN"]),
      minutesFrom(block, 0),
    );
    const name = extractName(block, idx);
    const normalizedName = normalizeLabel(name);
    const isCierre = /CIERRE|METACOG/.test(normalizedName);
    const isInicio = /INICIO/.test(normalizedName);
    const type = isInicio ? "Inicio" : isCierre ? "Cierre" : "Desarrollo";
    const explicitSubmoments = splitExplicitSubmoments(block);
    const activities = extractActivities(block);

    return {
      id: makeId("moment"),
      type,
      name,
      order_index: idx,
      is_active: true,
      color: COLORS[idx % COLORS.length],
      bgImage: "",
      bgOpacity: 0.35,
      bgBlur: 0,
      bgOverlay: "dark",
      submoments: explicitSubmoments.length
        ? explicitSubmoments
        : [
            {
              id: makeId("submoment"),
              name: "Actividades del momento",
              duration: duration || 10,
              description:
                activities || "Revisa y completa las actividades del momento.",
              teacher_note:
                activities || "Revisa este bloque importado y ajusta detalles.",
              order_index: 0,
              status: "pending",
            },
          ],
    };
  });

  if (!moments.length) {
    moments = [
      {
        id: makeId("moment"),
        type: "Texto importado",
        name: "Texto importado",
        order_index: 0,
        is_active: true,
        color: COLORS[0],
        bgImage: "",
        bgOpacity: 0.35,
        bgBlur: 0,
        bgOverlay: "dark",
        submoments: [
          {
            id: makeId("submoment"),
            name: "Revisar texto importado",
            duration: total_duration || 30,
            description: text,
            teacher_note:
              "La app no detecto momentos. Divide este texto en Inicio, Desarrollo y Cierre.",
            order_index: 0,
            status: "pending",
          },
        ],
      },
    ];
  }

  const sum = moments.reduce(
    (total, moment) =>
      total +
      moment.submoments.reduce(
        (subtotal, submoment) => subtotal + (Number(submoment.duration) || 0),
        0,
      ),
    0,
  );

  if (sum === 0 && total_duration) {
    const base = Math.max(1, Math.floor(total_duration / moments.length));
    moments = moments.map((moment) => ({
      ...moment,
      submoments: moment.submoments.map((submoment) => ({
        ...submoment,
        duration: base,
      })),
    }));
  }

  return {
    title,
    area,
    grade,
    total_duration: total_duration || sum || 90,
    purpose,
    evidence,
    materials,
    criteria,
    dua,
    evaluation,
    metacognition,
    notes: [
      criteria && `Criterios: ${criteria}`,
      dua && `DUA: ${dua}`,
      evaluation && `Evaluacion: ${evaluation}`,
      metacognition && `Metacognicion: ${metacognition}`,
      "Importado desde texto plano con parser local. Revisa la vista previa antes de guardar.",
    ]
      .filter(Boolean)
      .join("\n\n"),
    confidence_note:
      "Importacion local completada. Puedes corregir nombres, tiempos y actividades antes de confirmar.",
    moments,
  };
}
