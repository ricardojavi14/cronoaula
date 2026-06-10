"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Save,
  Clock,
  Wand2,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  X,
  Upload,
  RefreshCw,
  Copy,
  Check,
  ArrowLeft,
  Layers,
  BookOpen,
  Zap,
  RotateCcw,
  FileText,
} from "lucide-react";
import { useTeacher } from "../client-layout";
import { MOMENT_TEMPLATES } from "@/data/templates";
import { toast } from "sonner";
import { saveSession } from "@/utils/localStore";
import { parseSessionText } from "@/utils/sessionParser";

const MC = [
  "#2563EB",
  "#059669",
  "#7C3AED",
  "#D97706",
  "#DC2626",
  "#0891B2",
  "#9333EA",
  "#CA8A04",
  "#BE185D",
  "#0F766E",
];
const AREAS = [
  "Comunicación",
  "Matemática",
  "Personal Social",
  "Ciencia y Tecnología",
  "Arte y Cultura",
  "Educación Física",
  "Tutoría",
  "Educación Religiosa",
  "Plan Lector",
];
const inp =
  "w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 shadow-sm";
const ta = inp + " resize-none";

function F({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function calcMomentsTotal(list = []) {
  return list.reduce((total, moment) => {
    const subs = Array.isArray(moment.submoments) ? moment.submoments : [];
    const subTotal = subs.reduce((sum, sm) => sum + (Number(sm.duration) || 0), 0);
    return total + (subTotal || Number(moment.duration) || 0);
  }, 0);
}

function textIncludes(value, pattern) {
  return String(value || "").toLowerCase().includes(pattern);
}

function sessionText(meta = {}, moments = []) {
  return [
    meta.purpose,
    meta.evidence,
    meta.materials,
    meta.notes,
    meta.criteria,
    meta.dua,
    meta.evaluation,
    meta.metacognition,
    ...moments.flatMap((m) => [
      m.name,
      m.type,
      ...(m.submoments || []).flatMap((sm) => [
        sm.name,
        sm.description,
        sm.teacher_note,
      ]),
    ]),
  ].join(" ");
}

function analyzeSession(meta = {}, moments = []) {
  const totalDuration = Number(meta.total_duration) || 0;
  const used = calcMomentsTotal(moments);
  const diff = used - totalDuration;
  const allText = sessionText(meta, moments).toLowerCase();
  const hasMoment = (pattern) =>
    moments.some((m) => textIncludes(`${m.name} ${m.type}`, pattern));
  const cierre = moments.find((m) =>
    textIncludes(`${m.name} ${m.type}`, "cierre"),
  );
  const cierreDuration = cierre ? calcMomentsTotal([cierre]) : 0;

  const flags = {
    inicio: hasMoment("inicio"),
    desarrollo: hasMoment("desarrollo"),
    cierre: Boolean(cierre),
    purpose: Boolean(String(meta.purpose || "").trim()),
    evidence: Boolean(String(meta.evidence || "").trim()),
    metacognition:
      Boolean(String(meta.metacognition || "").trim()) ||
      textIncludes(allText, "metacog"),
    dua: Boolean(String(meta.dua || "").trim()) || textIncludes(allText, "dua"),
  };

  const recommendations = [];
  if (flags.inicio && flags.desarrollo && flags.cierre) {
    recommendations.push("Tu sesion tiene estructura completa.");
  }
  if (!flags.cierre) {
    recommendations.push("Agrega un cierre para consolidar aprendizajes.");
  }
  if (!flags.purpose) {
    recommendations.push("No se detecto proposito de aprendizaje.");
  }
  if (!flags.evidence) {
    recommendations.push("No se detecto evidencia o producto.");
  }
  if (!flags.dua) {
    recommendations.push("No se detecto adaptacion DUA.");
  }
  if (flags.cierre && cierreDuration > 0 && cierreDuration < 5) {
    recommendations.push(
      "El cierre es muy breve; considera ampliarlo si haras metacognicion.",
    );
  }
  if (diff === 0 && totalDuration > 0 && used > 0) {
    recommendations.push("El tiempo esta completo.");
  } else if (diff < 0) {
    recommendations.push(
      `Faltan ${Math.abs(diff)} min; agrega actividades o redistribuye tiempos.`,
    );
  } else if (diff > 0) {
    recommendations.push(
      `Sobran ${diff} min; reduce actividades o aumenta la duracion total.`,
    );
  }

  return {
    totalDuration,
    used,
    diff,
    flags,
    recommendations,
    momentCount: moments.length,
    canSave: Boolean(String(meta.title || "").trim()) && moments.length > 0,
  };
}

function tpl2m(tpl) {
  return tpl.map((m, i) => ({
    ...m,
    id: crypto.randomUUID(),
    order_index: i,
    is_active: true,
    color: MC[i % MC.length],
    bgImage: "",
    submoments: (m.submoments || []).map((sm, si) => ({
      ...sm,
      id: crypto.randomUUID(),
      order_index: si,
      status: "pending",
    })),
  }));
}

export default function CreateSessionPage() {
  const { teacher } = useTeacher();
  const [tab, setTab] = useState("simple");
  const [saving, setSaving] = useState(false);
  const [cpFor, setCpFor] = useState(null);
  const [exp, setExp] = useState({});
  const fRef = useRef(null);
  const [meta, setMeta] = useState({
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
    criteria: "",
    dua: "",
    evaluation: "",
    metacognition: "",
    notes: "",
  });
  const [moments, setMoments] = useState([]);
  const [iStep, setIStep] = useState("paste");
  const [iTxt, setITxt] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [prev, setPrev] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("tab") === "import") setTab("import");
    }
  }, []);

  useEffect(() => {
    if (moments.length === 0 && MOMENT_TEMPLATES[meta.area]) {
      setMoments(tpl2m(MOMENT_TEMPLATES[meta.area]));
    }
  }, [meta.area]);

  useEffect(() => {
    if (typeof window !== "undefined" && (meta.title || moments.length > 0))
      localStorage.setItem(
        "cronoaula_draft",
        JSON.stringify({ meta, moments }),
      );
  }, [meta, moments]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const s = localStorage.getItem("cronoaula_draft");
    if (s && !meta.title && moments.length === 0) {
      try {
        const { meta: dm, moments: dmo } = JSON.parse(s);
        if (confirm("¿Recuperar la sesión que estabas editando?")) {
          setMeta(dm);
          setMoments(dmo);
        } else localStorage.removeItem("cronoaula_draft");
      } catch (e) {}
    }
  }, []);

  const total = calcMomentsTotal(moments);
  const previewTotal = prev ? calcMomentsTotal(prev.moments) : 0;
  const isPreviewing = tab === "import" && iStep === "preview" && prev;
  const activeMeta = isPreviewing ? { ...meta, ...prev } : meta;
  const activeMoments = isPreviewing ? prev.moments || [] : moments;
  const review = analyzeSession(activeMeta, activeMoments);
  const activeDuration = isPreviewing
    ? Number(prev.total_duration) || 0
    : Number(meta.total_duration) || 0;
  const activeTotal = isPreviewing ? previewTotal : total;
  const timeDiff = activeTotal - activeDuration;

  const redis = () => {
    if (!total) return;
    const f = meta.total_duration / total;
    setMoments((p) =>
      p.map((m) => ({
        ...m,
        submoments: m.submoments.map((sm) => ({
          ...sm,
          duration: Math.max(1, Math.round((Number(sm.duration) || 0) * f)),
        })),
      })),
    );
    toast.success("Tiempos redistribuidos");
  };

  const addM = () => {
    const i = moments.length;
    setMoments((p) => [
      ...p,
      {
        id: crypto.randomUUID(),
        type: "Desarrollo",
        name: "Nuevo momento",
        order_index: i,
        is_active: true,
        color: MC[i % MC.length],
        bgImage: "",
        submoments: [],
      },
    ]);
    setExp((e) => ({ ...e, [i]: true }));
  };
  const remM = (i) => setMoments((p) => p.filter((_, idx) => idx !== i));
  const dupM = (i) => {
    const c = {
      ...moments[i],
      id: crypto.randomUUID(),
      name: moments[i].name + " (copia)",
      submoments: moments[i].submoments.map((sm) => ({
        ...sm,
        id: crypto.randomUUID(),
      })),
    };
    setMoments((p) => [...p, c]);
  };
  const updM = (i, f, v) =>
    setMoments((p) => p.map((m, idx) => (idx === i ? { ...m, [f]: v } : m)));
  const addS = (mi) =>
    setMoments((p) =>
      p.map((m, i) =>
        i !== mi
          ? m
          : {
              ...m,
              submoments: [
                ...m.submoments,
                {
                  id: crypto.randomUUID(),
                  name: "Nueva actividad",
                  duration: 5,
                  description: "",
                  teacher_note: "",
                  order_index: m.submoments.length,
                  status: "pending",
                },
              ],
            },
      ),
    );
  const remS = (mi, si) =>
    setMoments((p) =>
      p.map((m, i) =>
        i !== mi
          ? m
          : { ...m, submoments: m.submoments.filter((_, idx) => idx !== si) },
      ),
    );
  const updS = (mi, si, f, v) =>
    setMoments((p) =>
      p.map((m, i) =>
        i !== mi
          ? m
          : {
              ...m,
              submoments: m.submoments.map((sm, idx) =>
                idx !== si ? sm : { ...sm, [f]: v },
              ),
            },
      ),
    );

  const saveActiveSession = async ({ goToClass = false } = {}) => {
    if (!String(activeMeta.title || "").trim())
      return toast.error("El titulo es obligatorio");
    if (!activeMoments.length)
      return toast.error("Agrega al menos un momento antes de guardar");
    setSaving(true);
    try {
      const saved = saveSession({
        ...activeMeta,
        teacher_id: teacher?.id || "local-teacher",
        moments: activeMoments,
      });
      if (typeof window !== "undefined") localStorage.removeItem("cronoaula_draft");
      toast.success("Sesión guardada en este dispositivo");
      setTimeout(() => {
        window.location.href = goToClass ? `/class-mode/${saved.id}` : "/sessions";
      }, 500);
      return saved;
    } catch (error) {
      console.error(error);
      toast.error("No se pudo guardar en el navegador. Revisa el almacenamiento local.");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => saveActiveSession();
  const handleTryClass = async () => saveActiveSession({ goToClass: true });

  const handleAnalyze = async () => {
    if (!iTxt.trim()) return toast.error("Pega el texto de tu planificación");
    setAnalyzing(true);
    try {
      const result = parseSessionText(iTxt);
      setPrev(result);
      setIStep("preview");
      toast.success("Texto importado. Revisa la vista previa.");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "No pude procesar el texto.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 600000)
      return toast.error("Archivo muy grande. Copia el texto manualmente.");
    const r = new FileReader();
    r.onload = (ev) => {
      setITxt(ev.target.result);
      toast.success(`"${file.name}" cargado. Presiona Analizar.`);
    };
    r.onerror = () => toast.error("No pude leer el archivo. Pega el texto.");
    r.readAsText(file, "UTF-8");
  };

  const confirmPrev = () => {
    if (!prev) return;
    setMeta((m) => ({
      ...m,
      title: prev.title || m.title,
      area: prev.area || m.area,
      grade: prev.grade || m.grade,
      total_duration: prev.total_duration || m.total_duration,
      purpose: prev.purpose || m.purpose,
      evidence: prev.evidence || m.evidence,
      materials: prev.materials || m.materials,
      criteria: prev.criteria || m.criteria,
      dua: prev.dua || m.dua,
      evaluation: prev.evaluation || m.evaluation,
      metacognition: prev.metacognition || m.metacognition,
      notes: prev.notes || m.notes,
    }));
    setMoments(tpl2m(prev.moments));
    const e = {};
    prev.moments.forEach((_, i) => {
      e[i] = true;
    });
    setExp(e);
    setTab("advanced");
    setIStep("paste");
    setPrev(null);
    toast.success("✅ Sesión importada. Revisa y ajusta lo que necesites.");
  };

  const ME = (props) => (
    <MomentsEditor
      {...props}
      moments={moments}
      exp={exp}
      setExp={setExp}
      cpFor={cpFor}
      setCpFor={setCpFor}
      addM={addM}
      remM={remM}
      dupM={dupM}
      updM={updM}
      addS={addS}
      remS={remS}
      updS={updS}
    />
  );

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <a
            href="/sessions"
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft size={18} />
          </a>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {meta.title || "Nueva sesión"}
            </h1>
            <p className="text-slate-500 text-xs">
              {meta.area}
              {meta.grade ? ` · ${meta.grade}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeDuration > 0 && timeDiff !== 0 && (
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${timeDiff > 0 ? "bg-red-50 text-red-700 border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}
            >
              <AlertCircle size={12} />
              {timeDiff > 0 ? `Sobran ${timeDiff} min` : `Faltan ${Math.abs(timeDiff)} min`}
              {!(tab === "import" && iStep === "preview") && (
                <button onClick={redis} className="ml-1 underline font-bold">
                  Ajustar
                </button>
              )}
            </div>
          )}
          {activeDuration > 0 && timeDiff === 0 && activeTotal > 0 && !(tab === "import" && iStep === "paste") && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check size={12} /> Tiempo completo
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
          >
            <Save size={15} /> {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-5 w-fit">
        {[
          { id: "simple", label: "Simple", icon: <Zap size={14} /> },
          { id: "advanced", label: "Completo", icon: <Layers size={14} /> },
          { id: "import", label: "Importar texto", icon: <Wand2 size={14} /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
        <div className="min-w-0 space-y-4">
      {/* IMPORT PASTE */}
      {tab === "import" && iStep === "paste" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
                <Wand2 size={20} className="text-violet-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">
                  Importar planificación
                </h2>
                <p className="text-slate-500 text-sm">
                  Extrae momentos, tiempos y notas con un importador local
                </p>
              </div>
            </div>
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-sm text-violet-800 space-y-1">
              <p className="font-semibold">¿Cómo funciona?</p>
              <ol className="list-decimal list-inside text-violet-700 space-y-0.5">
                <li>
                  Pega el texto de tu planificación o sube un archivo .txt
                </li>
                <li>El importador analiza y extrae la estructura pedagógica</li>
                <li>Tú revisas y editas antes de confirmar</li>
                <li>¡Tu sesión queda lista para modo clase!</li>
              </ol>
            </div>
            <F label="Texto de tu planificación">
              <textarea
                className="w-full h-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-violet-500 resize-none placeholder-slate-400"
                placeholder={
                  "Pega aquí el texto de tu sesión de aprendizaje...\n\nEjemplo:\nSESIÓN - COMUNICACIÓN - 3° PRIMARIA\nI. INICIO (20 min): Motivación con imagen...\nII. DESARROLLO (50 min): Lectura comprensiva...\nIII. CIERRE (20 min): Metacognición..."
                }
                value={iTxt}
                onChange={(e) => setITxt(e.target.value)}
              />
            </F>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !iTxt.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
              >
                {analyzing ? (
                  <>
                    <RefreshCw
                      size={16}
                      style={{ animation: "spin 0.8s linear infinite" }}
                    />{" "}
                    Analizando...
                  </>
                ) : (
                  <>
                    <Wand2 size={16} /> Analizar texto
                  </>
                )}
              </button>
              <input
                ref={fRef}
                type="file"
                accept=".txt,.md,.csv"
                onChange={handleFile}
                className="hidden"
              />
              <button
                onClick={() => fRef.current?.click()}
                className="flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 bg-white text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                <Upload size={16} /> Subir .txt
              </button>
            </div>
            <p className="text-xs text-slate-400">
              💡 Para Word/PDF: abre el archivo → selecciona todo (Ctrl+A) →
              copia → pega aquí.
            </p>
          </div>
          <div className="text-center">
            <button
              onClick={() => setTab("simple")}
              className="text-sm text-slate-400 hover:text-slate-600 underline"
            >
              Prefiero crear manualmente →
            </button>
          </div>
        </div>
      )}

      {/* IMPORT PREVIEW */}
      {tab === "import" && iStep === "preview" && prev && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
            <Check size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-800 text-sm">
                ¡Análisis completado! Revisa la estructura antes de confirmar.
              </p>
              {prev.confidence_note && (
                <p className="text-emerald-700 text-xs mt-0.5 italic">
                  {prev.confidence_note}
                </p>
              )}
              <p className="text-emerald-600 text-xs mt-1">
                Puedes editar cualquier campo. Los cambios son tuyos.
              </p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <FileText size={15} className="text-slate-400" /> Datos extraídos
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <F label="Título">
                  <input
                    className={inp}
                    value={prev.title}
                    onChange={(e) =>
                      setPrev({ ...prev, title: e.target.value })
                    }
                  />
                </F>
              </div>
              <F label="Área">
                <input
                  className={inp}
                  value={prev.area}
                  onChange={(e) => setPrev({ ...prev, area: e.target.value })}
                />
              </F>
              <F label="Grado">
                <input
                  className={inp}
                  value={prev.grade}
                  onChange={(e) => setPrev({ ...prev, grade: e.target.value })}
                />
              </F>
              <div className="col-span-2">
                <F label="Duración total (min)">
                  <input
                    type="number"
                    className={inp}
                    value={prev.total_duration}
                    onChange={(e) =>
                      setPrev({
                        ...prev,
                        total_duration: parseInt(e.target.value) || 90,
                      })
                    }
                  />
                </F>
              </div>
              {prev.purpose && (
                <div className="col-span-2">
                  <F label="Propósito">
                    <textarea
                      rows={2}
                      className={ta}
                      value={prev.purpose}
                      onChange={(e) =>
                        setPrev({ ...prev, purpose: e.target.value })
                      }
                    />
                  </F>
                </div>
              )}
              {[
                ["Evidencia / producto", "evidence"],
                ["Materiales / recursos", "materials"],
                ["Criterios", "criteria"],
                ["Adaptación DUA", "dua"],
                ["Metacognición", "metacognition"],
              ].map(([label, key]) => (
                <div className="col-span-2" key={key}>
                  <F label={label}>
                    <textarea
                      rows={2}
                      className={ta}
                      placeholder={`Completa ${label.toLowerCase()} si aplica...`}
                      value={prev[key] || ""}
                      onChange={(e) =>
                        setPrev({ ...prev, [key]: e.target.value })
                      }
                    />
                  </F>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <Layers size={15} className="text-slate-400" /> Momentos
              detectados ({prev.moments.length})
            </h3>
            <div className="space-y-3">
              {prev.moments.map((m, mi) => {
                const c = MC[mi % MC.length];
                const t = calcMomentsTotal([m]);
                return (
                  <div
                    key={mi}
                    className="border border-slate-100 rounded-xl overflow-hidden"
                  >
                    <div
                      className="flex items-center gap-3 px-4 py-3 bg-slate-50"
                      style={{ borderLeftColor: c, borderLeftWidth: 4 }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: c }}
                      />
                      <input
                        className="flex-1 font-bold text-slate-800 text-sm bg-transparent outline-none border-b border-transparent focus:border-slate-300"
                        value={m.name}
                        onChange={(e) => {
                          const mo = [...prev.moments];
                          mo[mi] = { ...mo[mi], name: e.target.value };
                          setPrev({ ...prev, moments: mo });
                        }}
                      />
                      <span className="text-xs text-slate-400 font-mono shrink-0">
                        {t} min
                      </span>
                      <button
                        onClick={() =>
                          setPrev({
                            ...prev,
                            moments: prev.moments.filter((_, i) => i !== mi),
                          })
                        }
                        className="text-slate-300 hover:text-red-400 transition-colors shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="px-4 py-2 space-y-1">
                      {m.submoments.map((sm, si) => (
                        <div
                          key={si}
                          className="rounded-xl border border-slate-100 bg-white p-3 space-y-2"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-1.5 h-1.5 rounded-full shrink-0 opacity-60"
                              style={{ backgroundColor: c }}
                            />
                            <input
                              className="flex-1 text-sm font-semibold text-slate-700 bg-transparent outline-none border-b border-transparent focus:border-slate-200"
                              value={sm.name}
                              onChange={(e) => {
                                const mo = [...prev.moments];
                                mo[mi].submoments[si] = {
                                  ...sm,
                                  name: e.target.value,
                                };
                                setPrev({ ...prev, moments: mo });
                              }}
                            />
                            <input
                              type="number"
                              className="w-14 text-center text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 outline-none"
                              value={sm.duration}
                              onChange={(e) => {
                                const mo = [...prev.moments];
                                mo[mi].submoments[si] = {
                                  ...sm,
                                  duration: parseInt(e.target.value) || 0,
                                };
                                setPrev({ ...prev, moments: mo });
                              }}
                            />
                            <span className="text-xs text-slate-400 shrink-0">
                              min
                            </span>
                          </div>
                          <textarea
                            rows={2}
                            className="w-full resize-none rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs leading-relaxed text-slate-600 outline-none focus:ring-1 focus:ring-blue-400"
                            placeholder="Contenido extraido para esta actividad..."
                            value={sm.description || sm.teacher_note || ""}
                            onChange={(e) => {
                              const mo = [...prev.moments];
                              mo[mi].submoments[si] = {
                                ...sm,
                                description: e.target.value,
                                teacher_note: e.target.value,
                              };
                              setPrev({ ...prev, moments: mo });
                            }}
                          />
                          {(sm.description || sm.teacher_note) && (
                            <p className="text-[11px] text-slate-400">
                              Vista compacta: se muestran 2 lineas; puedes
                              editar o ampliar el campo.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIStep("paste")}
              className="flex items-center gap-2 px-4 py-3 border border-slate-200 bg-white text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50"
            >
              <RotateCcw size={14} /> Volver
            </button>
            <button
              onClick={confirmPrev}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm transition-colors"
            >
              <Check size={15} /> Confirmar y editar sesión
            </button>
          </div>
        </div>
      )}

      {/* SIMPLE */}
      {tab === "simple" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <Zap size={15} className="text-blue-600" /> Datos básicos
            </h2>
            <F label="Título *">
              <input
                className={inp}
                placeholder="Ej. Comprensión de textos narrativos"
                value={meta.title}
                onChange={(e) => setMeta({ ...meta, title: e.target.value })}
              />
            </F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Área">
                <select
                  className={inp}
                  value={meta.area}
                  onChange={(e) => {
                    setMeta({ ...meta, area: e.target.value });
                    setMoments([]);
                  }}
                >
                  {AREAS.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </F>
              <F label="Grado">
                <input
                  className={inp}
                  placeholder="Ej. 3° primaria"
                  value={meta.grade}
                  onChange={(e) => setMeta({ ...meta, grade: e.target.value })}
                />
              </F>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <F label="Inicio">
                <input
                  type="time"
                  className={inp}
                  value={meta.start_time}
                  onChange={(e) =>
                    setMeta({ ...meta, start_time: e.target.value })
                  }
                />
              </F>
              <F label="Fin">
                <input
                  type="time"
                  className={inp}
                  value={meta.end_time}
                  onChange={(e) =>
                    setMeta({ ...meta, end_time: e.target.value })
                  }
                />
              </F>
              <F label="Duración (min)">
                <input
                  type="number"
                  className={inp}
                  value={meta.total_duration}
                  onChange={(e) =>
                    setMeta({
                      ...meta,
                      total_duration: parseInt(e.target.value) || 90,
                    })
                  }
                />
              </F>
            </div>
            <F label="Propósito">
              <textarea
                rows={2}
                className={ta}
                placeholder="¿Qué aprenderán los estudiantes hoy?"
                value={meta.purpose}
                onChange={(e) => setMeta({ ...meta, purpose: e.target.value })}
              />
            </F>
            <F label="Evidencia / producto">
              <textarea
                rows={2}
                className={ta}
                placeholder="¿Qué producto o evidencia quedará al final?"
                value={meta.evidence}
                onChange={(e) => setMeta({ ...meta, evidence: e.target.value })}
              />
            </F>
          </div>
          <ME />
        </div>
      )}

      {/* ADVANCED */}
      {tab === "advanced" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-600 text-xs uppercase tracking-wide flex items-center gap-2">
                <FileText size={13} /> Datos de la sesión
              </h3>
              <F label="Título *">
                <input
                  className={inp}
                  value={meta.title}
                  onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                  placeholder="Nombre de la sesión"
                />
              </F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Área">
                  <select
                    className={inp}
                    value={meta.area}
                    onChange={(e) => {
                      setMeta({ ...meta, area: e.target.value });
                      setMoments([]);
                    }}
                  >
                    {AREAS.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </F>
                <F label="Grado">
                  <input
                    className={inp}
                    value={meta.grade}
                    onChange={(e) =>
                      setMeta({ ...meta, grade: e.target.value })
                    }
                    placeholder="3° primaria"
                  />
                </F>
              </div>
              <F label="Fecha">
                <input
                  type="date"
                  className={inp}
                  value={meta.date}
                  onChange={(e) => setMeta({ ...meta, date: e.target.value })}
                />
              </F>
              <div className="grid grid-cols-3 gap-2">
                <F label="Inicio">
                  <input
                    type="time"
                    className={inp}
                    value={meta.start_time}
                    onChange={(e) =>
                      setMeta({ ...meta, start_time: e.target.value })
                    }
                  />
                </F>
                <F label="Fin">
                  <input
                    type="time"
                    className={inp}
                    value={meta.end_time}
                    onChange={(e) =>
                      setMeta({ ...meta, end_time: e.target.value })
                    }
                  />
                </F>
                <F label="Min">
                  <input
                    type="number"
                    className={inp}
                    value={meta.total_duration}
                    onChange={(e) =>
                      setMeta({
                        ...meta,
                        total_duration: parseInt(e.target.value) || 90,
                      })
                    }
                  />
                </F>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-600 text-xs uppercase tracking-wide flex items-center gap-2">
                <BookOpen size={13} /> Información pedagógica
              </h3>
              <F label="Propósito">
                <textarea
                  rows={3}
                  className={ta}
                  placeholder="¿Qué aprenderán hoy?"
                  value={meta.purpose}
                  onChange={(e) =>
                    setMeta({ ...meta, purpose: e.target.value })
                  }
                />
              </F>
              <F label="Evidencia / Producto">
                <textarea
                  rows={2}
                  className={ta}
                  placeholder="¿Qué producirán los estudiantes?"
                  value={meta.evidence}
                  onChange={(e) =>
                    setMeta({ ...meta, evidence: e.target.value })
                  }
                />
              </F>
              <F label="Materiales">
                <textarea
                  rows={2}
                  className={ta}
                  placeholder="Fichas, papelotes, plumones..."
                  value={meta.materials}
                  onChange={(e) =>
                    setMeta({ ...meta, materials: e.target.value })
                  }
                />
              </F>
              <F label="Criterios">
                <textarea
                  rows={2}
                  className={ta}
                  placeholder="Criterios de evaluación o logro..."
                  value={meta.criteria}
                  onChange={(e) =>
                    setMeta({ ...meta, criteria: e.target.value })
                  }
                />
              </F>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <F label="Adaptación DUA">
                  <textarea
                    rows={2}
                    className={ta}
                    placeholder="Ajustes para acceso, participación o expresión..."
                    value={meta.dua}
                    onChange={(e) => setMeta({ ...meta, dua: e.target.value })}
                  />
                </F>
                <F label="Metacognición">
                  <textarea
                    rows={2}
                    className={ta}
                    placeholder="Preguntas para reflexionar sobre lo aprendido..."
                    value={meta.metacognition}
                    onChange={(e) =>
                      setMeta({ ...meta, metacognition: e.target.value })
                    }
                  />
                </F>
              </div>
              <F label="Notas generales">
                <textarea
                  rows={2}
                  className={ta}
                  placeholder="Recordatorios, estrategias..."
                  value={meta.notes}
                  onChange={(e) => setMeta({ ...meta, notes: e.target.value })}
                />
              </F>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-600 text-xs uppercase tracking-wide flex items-center gap-2">
                <Clock size={13} /> Resumen de tiempo
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Planificado</span>
                  <span className="font-bold text-slate-800">{total} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total sesión</span>
                  <span className="font-bold text-slate-800">
                    {meta.total_duration} min
                  </span>
                </div>
                <div
                  className={`flex justify-between font-bold ${timeDiff === 0 ? "text-emerald-600" : timeDiff > 0 ? "text-amber-600" : "text-red-600"}`}
                >
                  <span>Diferencia</span>
                  <span>{timeDiff > 0 ? `+${timeDiff}` : timeDiff} min</span>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${timeDiff === 0 ? "bg-emerald-500" : timeDiff > 0 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{
                    width: `${Math.min(100, (total / (meta.total_duration || 1)) * 100)}%`,
                  }}
                />
              </div>
              {timeDiff !== 0 && (
                <button
                  onClick={redis}
                  className="w-full py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw size={12} /> Redistribuir automáticamente
                </button>
              )}
            </div>
          </div>
          <div className="lg:col-span-3">
            <ME showAdv />
          </div>
        </div>
      )}
        </div>
        <SessionReviewPanel
          review={review}
          saving={saving}
          onSave={handleSave}
          onTryClass={handleTryClass}
          onRedistribute={isPreviewing ? null : redis}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a
              href="/sessions"
              className="text-sm text-slate-500 hover:text-slate-700 font-medium"
            >
              Cancelar
            </a>
            {tab !== "import" && (
              <button
                onClick={() => setTab("import")}
                className="hidden sm:flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-semibold"
              >
                <Wand2 size={14} /> Importar texto
              </button>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
          >
            <Save size={15} /> {saving ? "Guardando..." : "Guardar sesión"}
          </button>
        </div>
      </div>
      <style
        jsx
        global
      >{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function SessionReviewPanel({
  review,
  saving,
  onSave,
  onTryClass,
  onRedistribute,
}) {
  const status =
    review.diff === 0 && review.used > 0
      ? "Tiempo completo"
      : review.diff < 0
        ? `Faltan ${Math.abs(review.diff)} min`
        : `Sobran ${review.diff} min`;
  const statusClass =
    review.diff === 0 && review.used > 0
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : review.diff < 0
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-red-50 text-red-700 border-red-200";

  const checks = [
    ["Inicio", review.flags.inicio],
    ["Desarrollo", review.flags.desarrollo],
    ["Cierre", review.flags.cierre],
    ["Propósito", review.flags.purpose],
    ["Evidencia/producto", review.flags.evidence],
    ["Metacognición", review.flags.metacognition],
    ["Adaptación DUA", review.flags.dua],
  ];

  return (
    <aside className="xl:sticky xl:top-20 space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
        <div>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">
            Revisión rápida
          </p>
          <h2 className="text-lg font-black text-slate-800">
            Resumen inteligente
          </h2>
        </div>

        <div className={`rounded-xl border px-3 py-2.5 ${statusClass}`}>
          <p className="text-xs font-bold uppercase tracking-wide">Estado</p>
          <p className="text-sm font-black">{status}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Metric label="Duración" value={`${review.totalDuration || 0}m`} />
          <Metric label="Usado" value={`${review.used || 0}m`} />
          <Metric label="Momentos" value={review.momentCount} />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Componentes pedagógicos
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {checks.map(([label, ok]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="text-slate-600">{label}</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${ok ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}
                >
                  {ok ? <Check size={11} /> : <X size={11} />}
                  {ok ? "Sí" : "No"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Recomendaciones
          </p>
          <div className="space-y-2">
            {review.recommendations.map((item, idx) => (
              <div
                key={`${item}-${idx}`}
                className="flex gap-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2"
              >
                <AlertCircle
                  size={14}
                  className="text-blue-500 shrink-0 mt-0.5"
                />
                <p className="text-xs leading-relaxed text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {onRedistribute && review.diff !== 0 && review.used > 0 && (
          <button
            onClick={onRedistribute}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold hover:bg-amber-100"
          >
            <RefreshCw size={13} /> Ajustar tiempos
          </button>
        )}

        <div className="space-y-2 pt-1">
          <button
            onClick={onSave}
            disabled={saving || !review.canSave}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl text-sm font-black transition-colors shadow-sm"
          >
            <Save size={15} /> {saving ? "Guardando..." : "Guardar sesión"}
          </button>
          <button
            onClick={onTryClass}
            disabled={saving || !review.canSave}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 text-white rounded-xl text-sm font-black transition-colors"
          >
            <BookOpen size={15} /> Probar en modo clase
          </button>
        </div>
      </div>
    </aside>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">
        {label}
      </p>
      <p className="text-lg font-black text-slate-800">{value}</p>
    </div>
  );
}

function MomentsEditor({
  moments,
  exp,
  setExp,
  cpFor,
  setCpFor,
  addM,
  remM,
  dupM,
  updM,
  addS,
  remS,
  updS,
  showAdv = false,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
          <Layers size={15} className="text-slate-400" /> Momentos pedagógicos
        </h3>
        <span className="text-xs text-slate-400">
          {moments.length} momentos
        </span>
      </div>
      <div className="space-y-2">
        {moments.map((m, mi) => {
          const mc = m.color || MC[mi % MC.length];
          const isE = exp[mi];
          const mt = calcMomentsTotal([m]);
          return (
            <div
              key={m.id}
              className="border border-slate-100 rounded-2xl overflow-hidden"
            >
              <div
                className="relative flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                style={m.bgImage ? { borderLeftColor: mc, borderLeftWidth: 4, backgroundImage: `linear-gradient(rgba(15,23,42,.72), rgba(15,23,42,.72)), url(${m.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" } : { borderLeftColor: mc, borderLeftWidth: 4 }}
              >
                <div className="relative shrink-0">
                  <div
                    className="w-3 h-3 rounded-full cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: mc }}
                    onClick={() => setCpFor(cpFor === mi ? null : mi)}
                  />
                  {cpFor === mi && (
                    <div
                      className="absolute left-0 top-5 z-20 p-2 bg-white border border-slate-200 rounded-xl shadow-xl grid grid-cols-5 gap-1.5 w-36"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {MC.map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            updM(mi, "color", c);
                            setCpFor(null);
                          }}
                          className="w-5 h-5 rounded-full border-2 hover:scale-110 transition-transform"
                          style={{
                            backgroundColor: c,
                            borderColor:
                              m.color === c ? "#1E293B" : "transparent",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <input
                  className={`flex-1 font-semibold text-sm bg-transparent outline-none border-b border-transparent focus:border-slate-300 ${m.bgImage ? "text-white" : "text-slate-800"}`}
                  value={m.name}
                  onChange={(e) => updM(mi, "name", e.target.value)}
                />
                <span className="text-xs font-mono text-slate-400 shrink-0">
                  {mt} min
                </span>
                <label className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600 cursor-pointer text-xs font-semibold shrink-0" title="Subir imagen de fondo">
                  Imagen
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => updM(mi, "bgImage", ev.target.result);
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                {m.bgImage && (
                  <button onClick={() => updM(mi, "bgImage", "")} className="text-xs text-red-400 hover:text-red-600 shrink-0">Quitar fondo</button>
                )}
                <button
                  onClick={() => dupM(mi)}
                  className="p-1 rounded-lg hover:bg-white text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                >
                  <Copy size={13} />
                </button>
                <button
                  onClick={() => remM(mi)}
                  className="p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors shrink-0"
                >
                  <X size={13} />
                </button>
                <button
                  onClick={() => setExp((e) => ({ ...e, [mi]: !e[mi] }))}
                  className="p-1 rounded-lg hover:bg-white text-slate-400 transition-colors shrink-0"
                >
                  {isE ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
              </div>
              {isE && (
                <div className="px-4 pb-3 pt-2 space-y-2 bg-white">
                  {m.submoments.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-3">
                      Sin actividades — agrega submomentos abajo
                    </p>
                  )}
                  {m.submoments.map((sm, si) => (
                    <div
                      key={sm.id}
                      className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0 mt-2"
                        style={{ backgroundColor: mc }}
                      />
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <input
                          className="w-full text-sm font-semibold text-slate-800 bg-transparent outline-none border-b border-transparent focus:border-slate-300"
                          value={sm.name}
                          placeholder="Nombre de la actividad"
                          onChange={(e) => updS(mi, si, "name", e.target.value)}
                        />
                        {showAdv && (
                          <>
                            <input
                              className="w-full text-xs text-slate-500 bg-transparent outline-none border-b border-transparent focus:border-slate-200"
                              placeholder="Descripción breve..."
                              value={sm.description}
                              onChange={(e) =>
                                updS(mi, si, "description", e.target.value)
                              }
                            />
                            <input
                              className="w-full text-xs text-amber-700 bg-transparent outline-none border-b border-transparent focus:border-amber-200"
                              placeholder="💬 Tu nota docente (solo la ves tú)..."
                              value={sm.teacher_note}
                              onChange={(e) =>
                                updS(mi, si, "teacher_note", e.target.value)
                              }
                            />
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          type="number"
                          min="1"
                          className="w-14 text-center text-sm font-mono font-bold bg-white border border-slate-200 rounded-lg px-1.5 py-1 outline-none focus:ring-1 focus:ring-blue-400"
                          value={sm.duration}
                          onChange={(e) =>
                            updS(
                              mi,
                              si,
                              "duration",
                              parseInt(e.target.value) || 0,
                            )
                          }
                        />
                        <span className="text-xs text-slate-400">min</span>
                      </div>
                      <button
                        onClick={() => remS(mi, si)}
                        className="p-1 text-slate-300 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addS(mi)}
                    className="w-full py-2 rounded-xl border-2 border-dashed text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    style={{ borderColor: mc + "60", color: mc }}
                  >
                    <Plus size={13} /> Agregar actividad
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <button
          onClick={addM}
          className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm font-semibold hover:border-blue-300 hover:text-blue-500 flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={18} /> Agregar momento
        </button>
      </div>
    </div>
  );
}
