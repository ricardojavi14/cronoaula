"use client";

import React, { useState } from "react";
import { useTeacher } from "../client-layout";
import { User, Book, MapPin, Users, Clock, Settings, Save } from "lucide-react";
import { toast } from "sonner";

export default function OnboardingPage() {
  const { teacher, setTeacher } = useTeacher();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(
    teacher || {
      name: "",
      level: "Primaria",
      grade: "",
      area_principal: "",
      student_count: 30,
      classroom_type: "Urbana",
      habitual_duration: 90,
      preferences: {
        routine: "Standard",
      },
    },
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = teacher ? "PATCH" : "POST";
      const res = await fetch("/api/teachers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setTeacher(data);
        toast.success("Perfil guardado con éxito");
        window.location.href = "/";
      } else {
        toast.error(data.error || "Error al guardar perfil");
      }
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-blue-900">Perfil Docente</h1>
        <p className="text-slate-600">
          Configura tu contexto para que CronoAula se adapte a tus necesidades.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User size={16} /> Nombre completo
            </label>
            <input
              type="text"
              required
              className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. Juan Pérez"
            />
          </div>

          {/* Nivel */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Book size={16} /> Nivel Educativo
            </label>
            <select
              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
            >
              <option>Primaria</option>
              <option>Secundaria</option>
              <option>Inicial</option>
            </select>
          </div>

          {/* Grado */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Users size={16} /> Grado
            </label>
            <input
              type="text"
              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
              placeholder="Ej. 5to Grado"
            />
          </div>

          {/* Área */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MapPin size={16} /> Área Principal
            </label>
            <input
              type="text"
              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              value={form.area_principal}
              onChange={(e) =>
                setForm({ ...form, area_principal: e.target.value })
              }
              placeholder="Ej. Comunicación"
            />
          </div>

          {/* Estudiantes */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Users size={16} /> Cantidad de Estudiantes
            </label>
            <input
              type="number"
              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              value={form.student_count}
              onChange={(e) =>
                setForm({ ...form, student_count: parseInt(e.target.value) })
              }
            />
          </div>

          {/* Tipo de Aula */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MapPin size={16} /> Tipo de Aula
            </label>
            <select
              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              value={form.classroom_type}
              onChange={(e) =>
                setForm({ ...form, classroom_type: e.target.value })
              }
            >
              <option>Urbana</option>
              <option>Rural</option>
              <option>Multigrado</option>
              <option>EIB</option>
            </select>
          </div>

          {/* Duración habitual */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Clock size={16} /> Duración de Sesión (min)
            </label>
            <input
              type="number"
              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              value={form.habitual_duration}
              onChange={(e) =>
                setForm({
                  ...form,
                  habitual_duration: parseInt(e.target.value),
                })
              }
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98]"
        >
          {loading ? (
            "Guardando..."
          ) : (
            <>
              <Save size={20} /> Guardar Perfil
            </>
          )}
        </button>
      </form>
    </div>
  );
}
