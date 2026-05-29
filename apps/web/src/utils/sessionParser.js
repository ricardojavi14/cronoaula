import { makeId } from "./localStore";

const COLORS = ["#2563EB", "#059669", "#7C3AED", "#D97706", "#DC2626", "#0891B2", "#9333EA", "#CA8A04"];

function clean(text = "") {
  return String(text)
    .replace(/\r/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\u00A0/g, " ")
    .trim();
}

function valueAfter(text, labels) {
  for (const label of labels) {
    const re = new RegExp(`^\\s*${label}\\s*[:：-]\\s*(.+)$`, "im");
    const m = text.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return "";
}

function minutesFrom(text, fallback = 0) {
  const m = String(text || "").match(/(\d{1,3})\s*(minutos|min|m|')/i);
  return m ? parseInt(m[1], 10) : fallback;
}

function splitBlocks(text) {
  const lines = text.split("\n");
  const starts = [];
  lines.forEach((line, idx) => {
    const normalized = line.trim().toUpperCase();
    if (/^MOMENTO\s*\d*/.test(normalized) || /^INICIO\b/.test(normalized) || /^DESARROLLO\b/.test(normalized) || /^CIERRE\b/.test(normalized)) {
      starts.push(idx);
    }
  });
  if (!starts.length) return [];
  return starts.map((start, i) => lines.slice(start, starts[i + 1] || lines.length).join("\n").trim()).filter(Boolean);
}

function extractName(block, idx) {
  const explicit = valueAfter(block, ["NOMBRE", "TITULO DEL MOMENTO", "MOMENTO"]);
  if (explicit) return explicit;
  const first = block.split("\n").find((l) => l.trim())?.trim() || `Momento ${idx + 1}`;
  return first.replace(/^MOMENTO\s*\d*\s*[:.-]?\s*/i, "").trim() || `Momento ${idx + 1}`;
}

function extractActivities(block) {
  const m = block.match(/ACTIVIDADES\s*[:：-]\s*([\s\S]*)/i);
  const raw = (m?.[1] || block)
    .replace(/^MOMENTO\s*\d.*$/im, "")
    .replace(/^NOMBRE\s*[:：-].*$/im, "")
    .replace(/^DURACION\s*[:：-].*$/im, "")
    .replace(/^HORARIO\s*[:：-].*$/im, "")
    .trim();
  return raw || "Actividad importada desde texto.";
}

export function parseSessionText(input) {
  const text = clean(input);
  if (!text) throw new Error("No hay texto para importar");

  const title = valueAfter(text, ["TITULO DE LA SESION", "TITULO", "TÍTULO DE LA SESIÓN", "TÍTULO"]) || "Sesión importada";
  const area = valueAfter(text, ["AREA", "ÁREA"]) || "Comunicación";
  const grade = valueAfter(text, ["GRADO"]) || "";
  const purpose = valueAfter(text, ["PROPOSITO", "PROPÓSITO", "PROPOSITO DE LA SESION", "PROPÓSITO DE LA SESIÓN"]);
  const evidence = valueAfter(text, ["PRODUCTO", "EVIDENCIA", "PRODUCTO DE LA SESION", "PRODUCTO DE LA SESIÓN"]);
  const materials = valueAfter(text, ["MATERIALES", "RECURSOS", "RECURSOS Y MATERIALES"]);
  const total_duration = minutesFrom(valueAfter(text, ["DURACION TOTAL", "DURACIÓN TOTAL", "DURACION", "DURACIÓN"]), minutesFrom(text, 90));

  let moments = splitBlocks(text).map((block, idx) => {
    const duration = minutesFrom(valueAfter(block, ["DURACION", "DURACIÓN"]), minutesFrom(block, 0));
    const name = extractName(block, idx);
    const isCierre = /cierre|metacog/i.test(name);
    const isInicio = /inicio/i.test(name);
    const type = isInicio ? "Inicio" : isCierre ? "Cierre" : "Desarrollo";
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
      submoments: [{
        id: makeId("submoment"),
        name,
        duration: duration || 10,
        description: extractActivities(block),
        teacher_note: "Revisa este bloque importado y ajusta si es necesario.",
        order_index: 0,
        status: "pending",
      }],
    };
  });

  if (!moments.length) {
    moments = [{
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
      submoments: [{ id: makeId("submoment"), name: "Revisar texto importado", duration: total_duration || 30, description: text, teacher_note: "La app no detectó momentos. Divide este texto en Inicio, Desarrollo y Cierre.", order_index: 0, status: "pending" }],
    }];
  }

  const sum = moments.reduce((t, m) => t + m.submoments.reduce((s, sm) => s + (Number(sm.duration) || 0), 0), 0);
  if (sum === 0 && total_duration) {
    const base = Math.max(1, Math.floor(total_duration / moments.length));
    moments = moments.map((m) => ({ ...m, submoments: m.submoments.map((sm) => ({ ...sm, duration: base })) }));
  }

  return {
    title,
    area,
    grade,
    total_duration: total_duration || sum || 90,
    purpose,
    evidence,
    materials,
    notes: "Importado desde texto plano con parser local. Revisa la vista previa antes de guardar.",
    confidence_note: "Importación local completada. Puedes corregir nombres, tiempos y actividades antes de confirmar.",
    moments,
  };
}
