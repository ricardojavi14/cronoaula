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
  MoreVertical,
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
        <p className="text-sm" style={{ color: "var(--ca-text-muted)" }}>Cargando tus sesiones...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-14">
      <section className="overflow-hidden rounded-[2rem] border p-5 shadow-2xl sm:p-6" style={{ backgroundColor: "var(--ca-card)", borderColor: "var(--ca-border)", color: "var(--ca-text)", boxShadow: "var(--ca-shadow)" }}>
        <div className="pointer-events-none absolute inset-x-0 top-14 -z-10 h-72" style={{ background: "var(--ca-glow)" }} />
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.26em]" style={{ color: "var(--ca-text-muted)" }}>Biblioteca de aula</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Mis sesiones</h1>
            <p className="mt-1 max-w-2xl text-sm" style={{ color: "var(--ca-text-muted)" }}>
              Encuentra una sesion, inicia clase y sigue el ritmo sin pantallas intermedias pesadas.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href="/create?tab=import"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold transition hover:brightness-105"
              style={{ backgroundColor: "var(--ca-elevated)", borderColor: "var(--ca-border)", color: "var(--ca-text)" }}
            >
              <Sparkles size={16} /> Importar planificacion
            </a>
            <a
              href="/create"
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black shadow-lg transition hover:brightness-110"
              style={{ backgroundColor: "var(--ca-primary, #38BDF8)", color: "var(--ca-on-accent, #fff)" }}
            >
              <Plus size={16} /> Nueva sesion
            </a>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" size={16} style={{ color: "var(--ca-text-muted)" }} />
            <input
              type="text"
              placeholder="Buscar por titulo, area, grado o fecha..."
              className="w-full rounded-2xl border py-3 pl-10 pr-4 text-sm font-semibold outline-none placeholder:opacity-60 focus:brightness-105"
              style={{ backgroundColor: "var(--ca-input-bg)", borderColor: "var(--ca-border)", color: "var(--ca-text)" }}
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
                  backgroundColor: activeTab === tab.id ? "var(--ca-primary, #38BDF8)" : "var(--ca-elevated)",
                  borderColor: activeTab === tab.id ? "var(--ca-primary, #38BDF8)" : "var(--ca-border)",
                  color: activeTab === tab.id ? "var(--ca-on-accent, #07111F)" : "var(--ca-text)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {filteredSessions.length > 0 ? (
        <section className="overflow-hidden rounded-[1.5rem] border shadow-xl" style={{ backgroundColor: "var(--ca-card)", borderColor: "var(--ca-border)", color: "var(--ca-text)" }}>
          <div className="hidden grid-cols-[minmax(220px,1.6fr)_minmax(180px,0.9fr)_120px_120px_220px] gap-4 border-b px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] xl:grid" style={{ borderColor: "var(--ca-border)", color: "var(--ca-text-muted)" }}>
            <span>Sesion</span>
            <span>Datos</span>
            <span>Duracion</span>
            <span>Momentos</span>
            <span className="text-right">Accion</span>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--ca-border)" }}>
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
  const [menuOpen, setMenuOpen] = useState(false);
  const duration = getSessionDuration(session);
  const momentCount = getMomentCount(session);
  const classHref = `/class-mode/${session.id}`;

  return (
    <article className="grid gap-3 px-4 py-4 transition hover:brightness-[1.03] md:grid-cols-[minmax(0,1fr)_auto] md:items-center xl:grid-cols-[minmax(220px,1.6fr)_minmax(180px,0.9fr)_120px_120px_220px] xl:gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: "var(--ca-primary, #38BDF8)" }} />
          <h2 className="line-clamp-2 min-w-0 text-base font-black leading-snug xl:truncate xl:whitespace-nowrap" style={{ color: "var(--ca-text)" }}>{session.title || "Sesion sin titulo"}</h2>
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-xs" style={{ color: "var(--ca-text-muted)" }}>
          <Calendar size={12} /> {formatDate(session)}
        </p>
      </div>

      <div className="flex min-w-0 flex-wrap gap-2 text-xs font-bold md:col-span-2 xl:col-span-1 xl:block xl:space-y-1" style={{ color: "var(--ca-text)" }}>
        <span className="max-w-full truncate rounded-full border px-2 py-1 xl:inline-block" style={{ backgroundColor: "var(--ca-elevated)", borderColor: "var(--ca-border)" }}>{session.area || "Sin area"}</span>
        <span className="max-w-full truncate rounded-full border px-2 py-1 xl:inline-block xl:ml-1" style={{ backgroundColor: "var(--ca-elevated)", borderColor: "var(--ca-border)" }}>{session.grade || "Sin grado"}</span>
      </div>

      <div className="flex items-center gap-2 text-sm font-bold md:col-span-1 xl:col-span-1" style={{ color: "var(--ca-text)" }}>
        <Clock size={15} style={{ color: "var(--ca-text-muted)" }} /> {formatDuration(duration)}
      </div>

      <div className="flex items-center gap-2 text-sm font-bold md:col-span-1 xl:col-span-1" style={{ color: "var(--ca-text)" }}>
        <Layers size={15} style={{ color: "var(--ca-text-muted)" }} /> {momentCount || "Sin"} momentos
      </div>

      <div className="relative flex min-w-[210px] items-center gap-2 md:row-start-1 md:justify-end xl:row-auto">
        <a
          href={`${classHref}?test=1`}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-2.5 text-xs font-black transition hover:brightness-110"
          style={{ borderColor: "var(--ca-border)", backgroundColor: "var(--ca-elevated)", color: "var(--ca-text)" }}
        >
          Probar
        </a>
        <a
          href={classHref}
          onClick={() => setLastSessionId(session.id)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3.5 py-2.5 text-xs font-black transition hover:brightness-110 md:flex-none"
          style={{ backgroundColor: "var(--ca-primary, #38BDF8)", color: "var(--ca-on-accent, #fff)" }}
        >
          <Play size={13} fill="currentColor" /> Iniciar clase
        </a>
        <button
          onClick={() => setMenuOpen((value) => !value)}
          className="rounded-full border p-2.5 transition hover:brightness-110"
          style={{ borderColor: "var(--ca-border)", color: "var(--ca-text-muted)", backgroundColor: "var(--ca-elevated)" }}
          title="Mas acciones"
        >
          <MoreVertical size={15} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-12 z-20 w-44 overflow-hidden rounded-2xl border p-1.5 shadow-2xl" style={{ backgroundColor: "var(--ca-elevated)", borderColor: "var(--ca-border)" }}>
            <ActionLink href={`/create?id=${session.id}`} icon={<Edit3 size={14} />} label="Editar" />
            <ActionButton onClick={() => { onDuplicate(session); setMenuOpen(false); }} icon={<Copy size={14} />} label="Duplicar" />
            <ActionButton onClick={() => { onExport(session.id); setMenuOpen(false); }} icon={<Download size={14} />} label="Exportar" />
            <ActionButton danger onClick={() => { onDelete(session.id); setMenuOpen(false); }} icon={<Trash2 size={14} />} label="Eliminar" />
          </div>
        )}
      </div>
    </article>
  );
}

function ActionLink({ href, icon, label }) {
  return (
    <a href={href} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition hover:brightness-110" style={{ color: "var(--ca-text)" }}>
      {icon} {label}
    </a>
  );
}

function ActionButton({ onClick, icon, label, danger }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold transition hover:brightness-110"
      style={{ color: danger ? "#FCA5A5" : "var(--ca-text)" }}
    >
      {icon} {label}
    </button>
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
    <section className="rounded-[2rem] border p-8 text-center shadow-xl" style={{ backgroundColor: "var(--ca-card)", borderColor: "var(--ca-border)", color: "var(--ca-text)" }}>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border" style={{ backgroundColor: "var(--ca-elevated)", borderColor: "var(--ca-border)", color: "var(--ca-text-muted)" }}>
        {activeTab === "archived" ? <Archive size={25} /> : <FileText size={25} />}
      </div>
      <h2 className="mt-4 text-2xl font-black">
        {isSearch ? "Sin resultados" : copy[activeTab]}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: "var(--ca-text-muted)" }}>
        {isSearch
          ? "Prueba buscando por titulo, area, grado o fecha."
          : activeTab === "templates" || activeTab === "archived"
            ? "Este espacio queda listo para organizar mejor tus sesiones cuando lo necesites."
            : "Crea una sesion o importa una planificacion para iniciar tu biblioteca de aula."}
      </p>
      {!isSearch && (activeTab === "recent" || activeTab === "all") && (
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <a href="/create" className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition hover:brightness-110" style={{ backgroundColor: "var(--ca-primary, #38BDF8)", color: "var(--ca-on-accent, #fff)" }}>
            <Plus size={17} /> Crear sesion
          </a>
          <a href="/create?tab=import" className="inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold transition hover:brightness-105" style={{ backgroundColor: "var(--ca-elevated)", borderColor: "var(--ca-border)", color: "var(--ca-text)" }}>
            <Sparkles size={17} /> Importar planificacion
          </a>
        </div>
      )}
    </section>
  );
}
