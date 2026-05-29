"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Calendar,
  Clock,
  Play,
  Edit3,
  Trash2,
  Copy,
  FileText,
  Download,
  MoreVertical,
} from "lucide-react";
import { useTeacher } from "../client-layout";
import { toast } from "sonner";
import { exportToText } from "@/utils/export";
import { getSessions, deleteSession, duplicateSession } from "@/utils/localStore";

export default function SessionsPage() {
  const { teacher, loading: teacherLoading } = useTeacher();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSessions = async () => {
    try {
      setSessions(getSessions());
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar sesiones locales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta sesión?")) return;
    deleteSession(id);
    setSessions(getSessions());
    toast.success("Sesión eliminada");
  };

  const handleDuplicate = async (session) => {
    duplicateSession(session);
    setSessions(getSessions());
    toast.success("Sesión duplicada");
  };

  const handleExport = async (sessionId) => {
    const data = getSessions().find((s) => String(s.id) === String(sessionId));
    if (!data) return toast.error("No encontré la sesión para exportar");
    exportToText(data);
    toast.success("Guía exportada como texto");
  };

  const filteredSessions = sessions.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.area?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (teacherLoading || loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500 text-sm">Cargando tus sesiones...</p>
      </div>
    );

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mis Sesiones</h1>
          <p className="text-slate-500 text-sm">
            Gestiona, edita y reutiliza tus planificaciones.
          </p>
        </div>
        <a
          href="/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
        >
          <Plus size={16} /> Nueva sesión
        </a>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          size={16}
        />
        <input
          type="text"
          placeholder="Buscar por título, área o grado..."
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder-slate-400 text-sm shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-2xl border border-slate-200 hover:shadow-md transition-all overflow-hidden flex flex-col shadow-sm"
            >
              <div className="p-5 flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[11px] font-bold uppercase tracking-wide">
                    {session.area || "Sin área"}
                  </span>
                  <div className="flex gap-0.5">
                    <button
                      onClick={() => handleExport(session.id)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Exportar"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => handleDuplicate(session)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Duplicar"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 leading-snug line-clamp-2">
                  {session.title}
                </h3>
                {session.grade && (
                  <p className="text-xs text-slate-500">{session.grade}</p>
                )}

                <div className="flex flex-wrap gap-3 pt-1">
                  <span className="flex items-center gap-1 text-slate-500 text-xs">
                    <Calendar size={12} />
                    {session.date
                      ? new Date(session.date).toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "short",
                        })
                      : "Sin fecha"}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 text-xs">
                    <Clock size={12} /> {session.total_duration} min
                  </span>
                </div>
              </div>

              <div className="px-4 pb-4 flex gap-2">
                <a
                  href={`/class-mode/${session.id}`}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Play size={13} fill="white" /> Iniciar clase
                </a>
                <a
                  href={`/create?id=${session.id}`}
                  className="px-3.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
                >
                  <Edit3 size={14} />
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
              <FileText size={26} className="text-slate-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-1">
                {searchTerm ? "Sin resultados" : "No hay sesiones aún"}
              </h4>
              <p className="text-slate-500 text-sm">
                {searchTerm
                  ? "Prueba con otro término de búsqueda."
                  : "Crea tu primera planificación pedagógica."}
              </p>
            </div>
            {!searchTerm && (
              <a
                href="/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
              >
                <Plus size={14} /> Crear mi primera sesión
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
