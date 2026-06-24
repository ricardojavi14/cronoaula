"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Coffee,
  Droplets,
  BookOpen,
  Sun,
  List,
  Plus,
  Play,
} from "lucide-react";
import { useTeacher } from "../client-layout";
import { toast } from "sonner";

export default function AgendaPage() {
  const { teacher } = useTeacher();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    const fetchSessions = async () => {
      if (!teacher) return;
      try {
        const res = await fetch(`/api/sessions?teacher_id=${teacher.id}`);
        const data = await res.json();
        setSessions(data);
      } catch (err) {
        toast.error("Error al cargar agenda");
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [teacher]);

  const dailyItems = [
    {
      time: "08:00",
      title: "Entrada y Actividad Permanente",
      type: "system",
      icon: <Sun className="text-orange-500" />,
    },
    ...sessions
      .filter((s) => s.date === selectedDate)
      .map((s) => ({
        time: s.start_time,
        title: s.title,
        type: "session",
        id: s.id,
        area: s.area,
        duration: s.total_duration,
        icon: <BookOpen className="text-blue-500" />,
      })),
    {
      time: "10:30",
      title: "Recreo y Refrigerio",
      type: "system",
      icon: <Coffee className="text-amber-500" />,
    },
    {
      time: "11:00",
      title: "Lavado de Manos",
      type: "system",
      icon: <Droplets className="text-blue-400" />,
    },
    {
      time: "13:00",
      title: "Salida",
      type: "system",
      icon: <List className="text-slate-400" />,
    },
  ].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6 pb-16 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Agenda Diaria</h1>
          <p className="text-slate-500 text-sm">
            Tu jornada escolar organizada
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
          <Calendar size={16} className="text-slate-400" />
          <input
            type="date"
            className="outline-none text-sm font-medium text-slate-700 bg-transparent"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-200 hidden sm:block" />

        <div className="space-y-3">
          {dailyItems.map((item, idx) => (
            <div key={idx} className="relative flex items-start gap-4 group">
              <div className="hidden sm:flex shrink-0 w-14 text-xs font-bold text-slate-400 pt-3.5 text-right">
                {item.time}
              </div>
              <div
                className={`z-10 shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border ${item.type === "session" ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200"}`}
              >
                {item.icon}
              </div>
              <div
                className={`flex-1 p-4 rounded-2xl border transition-all ${
                  item.type === "session"
                    ? "bg-white border-slate-200 hover:shadow-md shadow-sm"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold text-sm leading-tight ${item.type === "session" ? "text-slate-800" : "text-slate-600"}`}
                    >
                      {item.title}
                    </h3>
                    {item.area && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wide">
                        {item.area}
                      </span>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1 sm:hidden">
                        <Clock size={11} />
                        {item.time}
                      </span>
                      {item.duration && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {item.duration} min
                        </span>
                      )}
                    </div>
                  </div>
                  {item.type === "session" && (
                    <a
                      href={`/class-mode/${item.id}`}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      <Play size={11} fill="white" /> Iniciar
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add session button */}
          <div className="flex items-start gap-4">
            <div className="hidden sm:block w-14" />
            <a
              href="/create"
              className="flex-1 flex items-center gap-3 p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center shrink-0">
                <Plus size={18} />
              </div>
              <span className="text-sm font-medium">
                Añadir sesión a este horario
              </span>
            </a>
          </div>
        </div>
      </div>

      {sessions.filter((s) => s.date === selectedDate).length === 0 && (
        <div className="text-center py-8 space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
            <Calendar size={22} className="text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm">
            No tienes sesiones programadas para este día.
          </p>
          <a
            href="/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} /> Crear sesión para hoy
          </a>
        </div>
      )}
    </div>
  );
}
