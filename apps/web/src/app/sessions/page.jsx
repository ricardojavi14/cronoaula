"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Archive,
  Calendar,
  Clock,
  Copy,
  Download,
  Edit3,
  FileText,
  Layers,
  Play,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { exportToText } from "@/utils/export";
import {
  deleteSession,
  duplicateSession,
  getSessionDate,
  getSessions,
  setLastSessionId,
} from "@/utils/localStore";

const TABS = [
  { id: "recent", label: "Recientes" },
  { id: "all", label: "Todas" },
  { id: "templates", label: "Plantillas" },
  { id: "archived", label: "Archivadas" },
];

function getSessionDuration(session) {
  if (session?.total_duration) return Number(session.total_duration) || 0;
  if (session?.duration) return Number(session.duration) || 0;
  return (session?.moments || []).reduce((total, moment) => {
    const subTotal = (moment.submoments || []).reduce((sum, sub) => sum + (Number(sub.duration) || 0), 0);
    return total + (subTotal || Number(moment.duration) || 0);
  }, 0);
}

function getMomentCount(session) {
  return Array.isArray(session?.moments) ? session.moments.length : 0;
}

function formatDuration(minutes) {
  if (!minutes) return "Sin duracion";
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours}h ${rest}m` : `${hours}h`;
  }
  return `${minutes} min`;
}

function formatDate(session) {
  const raw = session?.last_modified || session?.updated_at || session?.created_at || session?.date;
  if (!raw) return "Sin fecha";
  try {
    return new Date(raw).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "Sin fecha";
  }
}

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("recent");

  const refreshSessions = () => {
    try {
      setSessions(getSessions());
    } catch (err) {
      console.error(err);
      toast.error("No se pudieron cargar las sesiones locales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSessions();
    window.addEventListener("focus", refreshSessions);
    window.addEventListener("storage", refreshSessions);
    return () => {
      window.removeEventListener("focus", refreshSessions);
      window.removeEventListener("storage", refreshSessions);
    };
  }, []);

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => getSessionDate(b) - getSessionDate(a)),
    [sessions],
  );

  const tabSessions = useMemo(() => {
    if (activeTab === "templates") return sortedSessions.filter((session) => session.is_template || session.template);
    if (activeTab === "archived") return sortedSessions.filter((session) => session.archived);
    if (activeTab === "recent") return sortedSessions.filter((session) => !session.archived).slice(0, 8);
    return sortedSessions.filter((session) => !session.archived);
  }, [activeTab, sortedSessions]);

  const filteredSessions = useMemo(() => {
    const query = normalize(searchTerm);
    if (!query) return tabSessions;
    return tabSessions.filter((session) => {
      const haystack = normalize([
        session.title,
        session.area,
        session.grade,
        session.date,
        session.created_at,
        session.last_modified,
        formatDate(session),
      ].join(" "));
      return haystack.includes(query);
    });
  }, [searchTerm, tabSessions]);

  const handleDelete = (id) => {
    if (!confirm("¿Eliminar esta sesion?")) return;
    deleteSession(id);
    refreshSessions();
    toast.success("Sesion eliminada");
  };

  const handleDuplicate = (session) => {
    duplicateSession(session);
    refreshSessions();
    toast.success("Sesion duplicada");
  };

  const handleExport = (sessionId) => {
    const data = getSessions().find((s) => String(s.id) === String(sessionId));
    if (!data) return toast.error("No encontre la sesion para exportar");
    exportToText(data);
    toast.success("Guia exportada como texto");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-400">Cargando tus sesiones...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-14">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#070B13] p-5 text-white shadow-2xl sm:p-6">
        <div className="pointer-events-none absolute inset-x-0 top-14 -z-10 h-72 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.18),transparent_42%)]" />
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.26em] text-slate-500">Biblioteca de aula</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Mis sesiones</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              Encuentra una sesion, inicia clase y sigue el ritmo sin pantallas intermedias pesadas.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href="/create?tab=import"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-bold text-slate-100 transition hover:bg-white/[0.1]"
            >
              <Sparkles size={16} /> Importar planificacion
            </a>
            <a
              href="/create"
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black text-white shadow-lg transition hover:brightness-110"
              style={{ backgroundColor: "var(--ca-primary, #38BDF8)" }}
            >
              <Plus size={16} /> Nueva sesion
            </a>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Buscar por titulo, area, grado o fecha..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-3 pl-10 pr-4 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="shrink-0 rounded-full border px-3 py-2 text-xs font-black transition"
                style={{
                  backgroundColor: activeTab === tab.id ? "var(--ca-primary, #38BDF8)" : "rgba(255,255,255,0.05)",
                  borderColor: activeTab === tab.id ? "var(--ca-primary, #38BDF8)" : "rgba(255,255,255,0.1)",
                  color: activeTab === tab.id ? "#07111F" : "#CBD5E1",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {filteredSessions.length > 0 ? (
        <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0B1020] text-white shadow-xl">
          <div className="hidden grid-cols-[minmax(0,1.5fr)_1fr_0.8fr_0.8fr_170px] gap-3 border-b border-white/10 px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 md:grid">
            <span>Sesion</span>
            <span>Datos</span>
            <span>Duracion</span>
            <span>Momentos</span>
            <span className="text-right">Accion</span>
          </div>
          <div className="divide-y divide-white/10">
            {filteredSessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onExport={handleExport}
              />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState activeTab={activeTab} searchTerm={searchTerm} />
      )}
    </div>
  );
}

function SessionRow({ session, onDelete, onDuplicate, onExport }) {
  const duration = getSessionDuration(session);
  const momentCount = getMomentCount(session);
  const classHref = `/class-mode/${session.id}`;

  return (
    <article className="grid gap-3 px-4 py-4 transition hover:bg-white/[0.035] md:grid-cols-[minmax(0,1.5fr)_1fr_0.8fr_0.8fr_170px] md:items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: "var(--ca-primary, #38BDF8)" }} />
          <h2 className="truncate text-base font-black text-white">{session.title || "Sesion sin titulo"}</h2>
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar size={12} /> {formatDate(session)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-300 md:block md:space-y-1">
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 md:inline-block">{session.area || "Sin area"}</span>
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 md:inline-block md:ml-1">{session.grade || "Sin grado"}</span>
      </div>

      <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
        <Clock size={15} className="text-slate-500" /> {formatDuration(duration)}
      </div>

      <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
        <Layers size={15} className="text-slate-500" /> {momentCount || "Sin"} momentos
      </div>

      <div className="flex items-center gap-2 md:justify-end">
        <a
          href={classHref}
          onClick={() => setLastSessionId(session.id)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-black text-white transition hover:brightness-110 md:flex-none"
          style={{ backgroundColor: "var(--ca-primary, #38BDF8)" }}
        >
          <Play size={13} fill="currentColor" /> Iniciar clase
        </a>
        <a href={`/create?id=${session.id}`} className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:bg-white/[0.08] hover:text-white" title="Editar">
          <Edit3 size={14} />
        </a>
        <button onClick={() => onDuplicate(session)} className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:bg-white/[0.08] hover:text-white" title="Duplicar">
          <Copy size={14} />
        </button>
        <button onClick={() => onExport(session.id)} className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:bg-white/[0.08] hover:text-white" title="Exportar">
          <Download size={14} />
        </button>
        <button onClick={() => onDelete(session.id)} className="rounded-full border border-white/10 p-2 text-slate-500 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300" title="Eliminar">
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  );
}

function EmptyState({ activeTab, searchTerm }) {
  const isSearch = Boolean(searchTerm.trim());
  const copy = {
    recent: "Aun no tienes sesiones guardadas",
    all: "Aun no tienes sesiones guardadas",
    templates: "Todavia no hay plantillas",
    archived: "No hay sesiones archivadas",
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#0B1020] p-8 text-center text-white shadow-xl">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-300">
        {activeTab === "archived" ? <Archive size={25} /> : <FileText size={25} />}
      </div>
      <h2 className="mt-4 text-2xl font-black">
        {isSearch ? "Sin resultados" : copy[activeTab]}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
        {isSearch
          ? "Prueba buscando por titulo, area, grado o fecha."
          : activeTab === "templates" || activeTab === "archived"
            ? "Este espacio queda listo para organizar mejor tus sesiones cuando lo necesites."
            : "Crea una sesion o importa una planificacion para iniciar tu biblioteca de aula."}
      </p>
      {!isSearch && (activeTab === "recent" || activeTab === "all") && (
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <a href="/create" className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-white transition hover:brightness-110" style={{ backgroundColor: "var(--ca-primary, #38BDF8)" }}>
            <Plus size={17} /> Crear sesion
          </a>
          <a href="/create?tab=import" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold text-slate-100 transition hover:bg-white/[0.1]">
            <Sparkles size={17} /> Importar planificacion
          </a>
        </div>
      )}
    </section>
  );
}
