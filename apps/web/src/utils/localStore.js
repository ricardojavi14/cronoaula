export const CA_SESSIONS_KEY = "cronoaula_sessions";
export const CA_TEACHER_KEY = "cronoaula_teacher";
export const CA_OBS_KEY = "cronoaula_observations";

export function makeId(prefix = "ca") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function readJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`No se pudo leer ${key}`, error);
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getTeacher() {
  return readJson(CA_TEACHER_KEY, {
    id: "local-teacher",
    name: "Docente",
    institution: "",
    defaultGrade: "",
    defaultArea: "Comunicacion",
    defaultDuration: 90,
    classroomContext: "",
    grade: "",
    school: "",
  });
}

export function saveTeacher(teacher) {
  writeJson(CA_TEACHER_KEY, teacher);
  return teacher;
}

export function getSessions() {
  return readJson(CA_SESSIONS_KEY, []);
}

export function getSession(id) {
  return getSessions().find((s) => String(s.id) === String(id)) || null;
}

export function saveSession(session) {
  const now = new Date().toISOString();
  const sessions = getSessions();
  const normalized = {
    ...session,
    id: session.id || makeId("session"),
    created_at: session.created_at || now,
    last_modified: now,
    moments: (session.moments || []).map((m, mi) => ({
      ...m,
      id: m.id || makeId("moment"),
      order_index: mi,
      submoments: (m.submoments || []).map((sm, si) => ({
        ...sm,
        id: sm.id || makeId("submoment"),
        order_index: si,
        status: sm.status || "pending",
      })),
    })),
  };
  const idx = sessions.findIndex((s) => String(s.id) === String(normalized.id));
  const next = idx >= 0 ? sessions.map((s, i) => (i === idx ? normalized : s)) : [normalized, ...sessions];
  writeJson(CA_SESSIONS_KEY, next);
  return normalized;
}

export function deleteSession(id) {
  writeJson(CA_SESSIONS_KEY, getSessions().filter((s) => String(s.id) !== String(id)));
}

export function duplicateSession(session) {
  const copy = {
    ...session,
    id: makeId("session"),
    title: `${session.title || "Sesión"} (copia)`,
    created_at: undefined,
    last_modified: undefined,
    moments: (session.moments || []).map((m) => ({
      ...m,
      id: makeId("moment"),
      submoments: (m.submoments || []).map((sm) => ({ ...sm, id: makeId("submoment"), status: "pending" })),
    })),
  };
  return saveSession(copy);
}

export function addObservation(sessionId, text) {
  const observations = readJson(CA_OBS_KEY, []);
  const obs = { id: makeId("obs"), session_id: sessionId, text, created_at: new Date().toISOString() };
  writeJson(CA_OBS_KEY, [obs, ...observations]);
  return obs;
}

export function updateSubmomentStatus(sessionId, submomentId, status) {
  const session = getSession(sessionId);
  if (!session) return null;
  const moments = session.moments.map((m) => ({
    ...m,
    submoments: m.submoments.map((sm) => sm.id === submomentId ? { ...sm, status } : sm),
  }));
  return saveSession({ ...session, moments });
}
