"use client";

import React, { useState } from "react";
import {
  Clock,
  Play,
  Plus,
  Save,
  Wand2,
  BookOpen,
  Users,
  Settings,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  ArrowLeft,
  FileText,
  Timer,
  SkipForward,
  Pause,
  RefreshCw,
  Star,
  Zap,
  Target,
  HelpCircle,
  MessageSquare,
  BarChart2,
  Download,
} from "lucide-react";

const TABS = [
  { id: "intro", label: "¿Qué es?", icon: <Star size={16} /> },
  { id: "create", label: "Crear sesión", icon: <Plus size={16} /> },
  { id: "moments", label: "Momentos", icon: <BookOpen size={16} /> },
  { id: "classmode", label: "Modo clase", icon: <Play size={16} /> },
  { id: "late", label: "Inicio tardío", icon: <AlertCircle size={16} /> },
  { id: "tips", label: "Consejos Pro", icon: <Zap size={16} /> },
];

const ACCORDION_DATA = {
  create: [
    {
      q: "¿Qué información necesito para crear una sesión?",
      a: "Solo el título es obligatorio para empezar. Después puedes añadir el área, grado, hora de inicio/fin y duración. Lo importante es que empieces y vayas llenando mientras planificas.",
    },
    {
      q: "¿Cómo usa la IA para analizar mi planificación?",
      a: "Copia el texto de tu sesión (puede ser de Word, tu cuaderno digitalizado, o cualquier planificación) y pégalo en la sección 'Cargar con IA'. La IA identifica automáticamente los momentos, actividades, tiempos y propósito. ¡También funciona con archivos .txt!",
    },
    {
      q: "¿Puedo usar una plantilla de mi área?",
      a: "Sí. Cuando eliges el área curricular (Comunicación, Matemática, etc.), CronoAula carga automáticamente una plantilla con los momentos y actividades típicas de esa área. Puedes editarla, añadir o eliminar lo que necesites.",
    },
    {
      q: "¿Qué pasa si el tiempo no cuadra?",
      a: "CronoAula te muestra en tiempo real si te 'sobra' o 'falta' tiempo. Hay un botón de 'Ajustar automáticamente' que redistribuye los minutos proporcionalmente entre todos tus submomentos. También puedes hacerlo manualmente.",
    },
  ],
  moments: [
    {
      q: "¿Qué es un momento pedagógico?",
      a: "Es una etapa de tu clase: Inicio, Desarrollo, Cierre, etc. Cada momento tiene un propósito pedagógico claro. Por ejemplo, el 'Inicio' sirve para captar atención y activar conocimientos previos.",
    },
    {
      q: "¿Qué es un submomento?",
      a: "Es una actividad específica dentro de un momento. Por ejemplo, dentro del 'Desarrollo' puedes tener: Modelado (8 min), Práctica guiada (15 min), Trabajo independiente (20 min). Cada submomento tiene nombre, duración y notas para ti.",
    },
    {
      q: "¿Puedo añadir notas que solo vea yo?",
      a: "¡Sí! Cada submomento tiene un campo de 'Nota docente' que solo tú verás en el Modo Clase. Perfecto para recordatorios, materiales, o estrategias diferenciadas.",
    },
    {
      q: "¿Qué son las pausas activas?",
      a: "Son momentos breves (2-5 min) para que los estudiantes se muevan, respiren o se relajen. CronoAula incluye una biblioteca con pausas temáticas como 'La momia despierta' o 'El dragón que respira'. Puedes insertarlas entre cualquier momento.",
    },
  ],
  classmode: [
    {
      q: "¿Cómo inicio el Modo Clase?",
      a: "Desde 'Mis sesiones', abre una sesión guardada y presiona 'Iniciar clase'. También puedes ir directamente a 'Modo Clase' desde la pantalla de inicio si hay una sesión activa.",
    },
    {
      q: "¿Qué veo durante el Modo Clase?",
      a: "Verás: el nombre del momento actual (grande), la actividad en curso, un cronómetro gigante, tus notas docentes, el siguiente momento, y una barra de progreso. Todo en una vista limpia, ideal para proyector.",
    },
    {
      q: "¿Puedo ajustar el tiempo durante la clase?",
      a: "Sí. Tienes botones para: pausar, continuar, saltar al siguiente momento, extender 2 minutos, reducir 2 minutos, y terminar la sesión. También puedes registrar observaciones rápidas con un solo clic.",
    },
    {
      q: "¿Me avisa cuando el tiempo se acaba?",
      a: "CronoAula emite una alerta cuando faltan 2 minutos en un momento, y otra cuando el tiempo se acaba. Así puedes preparar la transición sin perder el ritmo de la clase.",
    },
  ],
  late: [
    {
      q: "¿Qué hago si la clase empieza 15 minutos tarde?",
      a: "Al iniciar el Modo Clase, CronoAula te pregunta si hubo un inicio tardío. Indicas cuántos minutos te retrasaste y eliges cómo ajustar: reducir todo proporcionalmente, proteger el Desarrollo recortando el Inicio/Cierre, o crear una 'versión rápida' de la sesión.",
    },
    {
      q: "¿Qué opción me recomiendas para inicio tardío?",
      a: "'Proteger el Desarrollo' es la mejor opción pedagógicamente. Reduce el tiempo de Inicio y Cierre, pero conserva los momentos centrales de aprendizaje. Si el retraso es grande (+20 min), considera la 'versión rápida'.",
    },
  ],
};

function Accordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="border border-white/10 rounded-xl overflow-hidden"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
          >
            <span className="text-sm font-semibold pr-4">{item.q}</span>
            {open === i ? (
              <ChevronDown size={16} className="shrink-0 text-blue-400" />
            ) : (
              <ChevronRight size={16} className="shrink-0 opacity-40" />
            )}
          </button>
          {open === i && (
            <div className="px-4 pb-4 text-sm text-gray-300 leading-relaxed border-t border-white/5 pt-3">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function StepCard({ number, title, desc, icon, color = "#6366f1" }) {
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm"
        style={{
          backgroundColor: color + "33",
          border: `1px solid ${color}44`,
          color,
        }}
      >
        {number}
      </div>
      <div>
        <h4 className="font-bold text-sm text-white mb-1">{title}</h4>
        <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function TipCard({ icon, title, text, color = "#f59e0b" }) {
  return (
    <div
      className="p-4 rounded-xl border"
      style={{ borderColor: color + "30", backgroundColor: color + "10" }}
    >
      <div className="flex items-center gap-2 mb-2" style={{ color }}>
        {icon}
        <span className="font-bold text-sm">{title}</span>
      </div>
      <p className="text-xs text-gray-300 leading-relaxed">{text}</p>
    </div>
  );
}

function MomentPreview({ name, color, activities }) {
  return (
    <div
      className="rounded-xl overflow-hidden border border-white/10"
      style={{ borderLeftColor: color, borderLeftWidth: 4 }}
    >
      <div className="flex items-center gap-3 px-4 py-3 bg-white/5">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="font-bold text-sm">{name}</span>
      </div>
      <div className="px-4 pb-3 space-y-1">
        {activities.map((a, i) => (
          <div
            key={i}
            className="flex justify-between items-center text-xs text-gray-400 py-1 border-t border-white/5"
          >
            <span>{a.name}</span>
            <span className="font-mono opacity-60">{a.min} min</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TutorialPage() {
  const [activeTab, setActiveTab] = useState("intro");

  return (
    <div className="bg-[#0f0f1a] text-white rounded-2xl overflow-hidden pb-10">
      {/* Header */}
      <div className="bg-[#1a1a2e] border-b border-white/10 rounded-t-2xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <a
            href="/"
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
          >
            <ArrowLeft size={20} />
          </a>
          <div>
            <h1 className="font-bold text-lg">Tutorial CronoAula</h1>
            <p className="text-xs text-gray-400">Guía completa para docentes</p>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto pb-3">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-white/10"}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ═══════════════════════════════════════ INTRO */}
        {activeTab === "intro" && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-sm font-bold">
                <Clock size={16} /> Herramienta pedagógica
              </div>
              <h2 className="text-3xl font-extrabold">¿Qué es CronoAula?</h2>
              <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                CronoAula no es solo un cronómetro. Es tu asistente pedagógico
                de aula: te ayuda a planificar, ejecutar y reflexionar sobre el
                tiempo real de tu sesión de clases. Pensado para la realidad del
                aula peruana, donde los tiempos siempre cambian.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: <Timer size={24} className="text-blue-400" />,
                  title: "Gestión inteligente",
                  desc: "Calcula, avisa y ajusta los tiempos de tu sesión automáticamente.",
                },
                {
                  icon: <BookOpen size={24} className="text-emerald-400" />,
                  title: "Momentos pedagógicos",
                  desc: "Organiza tu clase en Inicio, Desarrollo, Cierre y más, con actividades específicas.",
                },
                {
                  icon: <Wand2 size={24} className="text-violet-400" />,
                  title: "Asistente IA",
                  desc: "Pega tu planificación y la IA la convierte en momentos listos para usar.",
                },
                {
                  icon: <Play size={24} className="text-orange-400" />,
                  title: "Modo Clase",
                  desc: "Vista limpia con cronómetro gigante, ideal para proyector o pantalla compartida.",
                },
                {
                  icon: <RefreshCw size={24} className="text-rose-400" />,
                  title: "Ajuste en vivo",
                  desc: "Si empiezas tarde, redistribuye los tiempos con un solo clic.",
                },
                {
                  icon: <MessageSquare size={24} className="text-amber-400" />,
                  title: "Notas docentes",
                  desc: "Tus recordatorios y estrategias, visibles solo para ti durante la clase.",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-sm">{f.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/40 to-violet-900/40 border border-blue-500/20 space-y-4">
              <h3 className="font-bold text-lg">¿Para quién es CronoAula?</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  "Docentes de primaria",
                  "Aulas multigrado",
                  "Escuelas rurales",
                  "Docentes de secundaria",
                  "Coordinadores pedagógicos",
                  "Formadores docentes",
                  "Practicantes de educación",
                  "Aulas con proyector",
                ].map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <CheckCircle
                      size={14}
                      className="text-emerald-400 shrink-0"
                    />{" "}
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 flex-wrap">
              <a
                href="/onboarding"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <Users size={16} /> Configurar mi perfil
              </a>
              <a
                href="/create"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <Plus size={16} /> Crear mi primera sesión
              </a>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ CREAR SESIÓN */}
        {activeTab === "create" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Cómo crear una sesión</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Hay tres formas de crear una sesión. Usa la que mejor se adapte
                a tu momento: tienes una planificación escrita, ya sabes lo que
                harás, o quieres partir de una plantilla.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  color: "#a855f7",
                  icon: <Wand2 size={20} />,
                  title: "Con Inteligencia Artificial",
                  steps: [
                    "Haz clic en 'Cargar con IA'",
                    "Pega el texto de tu planificación",
                    "Presiona 'Analizar con IA'",
                    "¡Listo! Los momentos aparecen solos",
                  ],
                },
                {
                  color: "#22c55e",
                  icon: <BookOpen size={20} />,
                  title: "Con plantilla de área",
                  steps: [
                    "Elige el área curricular",
                    "La plantilla carga automáticamente",
                    "Edita los momentos que quieras",
                    "Ajusta los tiempos y guarda",
                  ],
                },
                {
                  color: "#f59e0b",
                  icon: <Plus size={20} />,
                  title: "Desde cero",
                  steps: [
                    "Llena los datos básicos",
                    "Haz clic en 'Agregar momento'",
                    "Agrega actividades a cada momento",
                    "Asigna tiempos y guarda",
                  ],
                },
              ].map((m, i) => (
                <div
                  key={i}
                  className="p-5 rounded-xl border"
                  style={{
                    borderColor: m.color + "40",
                    backgroundColor: m.color + "10",
                  }}
                >
                  <div
                    className="flex items-center gap-3 mb-4"
                    style={{ color: m.color }}
                  >
                    {m.icon}
                    <h3 className="font-bold text-sm">{m.title}</h3>
                  </div>
                  <ol className="space-y-2">
                    {m.steps.map((step, si) => (
                      <li
                        key={si}
                        className="flex items-start gap-2 text-xs text-gray-300"
                      >
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                          style={{
                            backgroundColor: m.color + "30",
                            color: m.color,
                          }}
                        >
                          {si + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Campos de la sesión</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    campo: "Título",
                    obligatorio: true,
                    desc: "El nombre de tu sesión. Ej: 'Comprensión de textos narrativos'",
                  },
                  {
                    campo: "Área curricular",
                    obligatorio: true,
                    desc: "Comunicación, Matemática, Personal Social, etc.",
                  },
                  {
                    campo: "Grado",
                    obligatorio: false,
                    desc: "El grado al que vas a enseñar. Se puede heredar de tu perfil.",
                  },
                  {
                    campo: "Fecha y horario",
                    obligatorio: false,
                    desc: "La fecha y hora real de la sesión.",
                  },
                  {
                    campo: "Duración total",
                    obligatorio: false,
                    desc: "Cuántos minutos dura la sesión. CronoAula controla que los momentos coincidan.",
                  },
                  {
                    campo: "Propósito",
                    obligatorio: false,
                    desc: "¿Qué van a aprender los estudiantes? Describe el logro esperado.",
                  },
                  {
                    campo: "Evidencia",
                    obligatorio: false,
                    desc: "¿Qué producirán o mostrarán los estudiantes? Ej: un texto escrito.",
                  },
                  {
                    campo: "Materiales",
                    obligatorio: false,
                    desc: "Lista de lo que necesitas: fichas, papelotes, plumones, etc.",
                  },
                ].map((c, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div
                      className={`mt-0.5 px-2 py-0.5 rounded text-xs font-bold shrink-0 ${c.obligatorio ? "bg-red-500/20 text-red-400" : "bg-gray-700 text-gray-400"}`}
                    >
                      {c.obligatorio ? "req." : "opt."}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{c.campo}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Preguntas frecuentes</h3>
              <Accordion items={ACCORDION_DATA.create} />
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ MOMENTOS */}
        {activeTab === "moments" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Momentos y submomentos
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Los momentos son la columna vertebral de tu sesión. Aquí te
                explicamos cada uno y cómo organizarlos con sus actividades
                específicas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  name: "Actividad permanente",
                  color: "#06b6d4",
                  desc: "Rutina al inicio: asistencia, fecha, oración, canción, etc.",
                  duracion: "5-10 min",
                },
                {
                  name: "Inicio",
                  color: "#22c55e",
                  desc: "Captar la atención, activar saberes previos y presentar el propósito.",
                  duracion: "15-20 min",
                },
                {
                  name: "Desarrollo",
                  color: "#a855f7",
                  desc: "El corazón de la clase: modelado, práctica guiada, trabajo independiente.",
                  duracion: "40-60 min",
                },
                {
                  name: "Pausa activa",
                  color: "#f97316",
                  desc: "2-5 minutos de movimiento para romper el sedentarismo y retomar la atención.",
                  duracion: "3-5 min",
                },
                {
                  name: "Cierre",
                  color: "#ec4899",
                  desc: "Revisar lo aprendido, socializar trabajos, reforzar el propósito.",
                  duracion: "10-15 min",
                },
                {
                  name: "Metacognición",
                  color: "#f59e0b",
                  desc: "¿Qué aprendí? ¿Cómo lo aprendí? ¿Para qué me sirve?",
                  duracion: "5-10 min",
                },
                {
                  name: "Retroalimentación",
                  color: "#6366f1",
                  desc: "Comentarios sobre el producto o desempeño. Puede ser oral o escrita.",
                  duracion: "5-10 min",
                },
                {
                  name: "Transferencia",
                  color: "#10b981",
                  desc: "Aplicar lo aprendido en un contexto diferente o real.",
                  duracion: "10-15 min",
                },
              ].map((m, i) => (
                <div
                  key={i}
                  className="flex gap-3 p-4 rounded-xl border"
                  style={{
                    borderColor: m.color + "30",
                    borderLeftColor: m.color,
                    borderLeftWidth: 4,
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0 mt-1"
                    style={{ backgroundColor: m.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm">{m.name}</h4>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full opacity-60"
                        style={{
                          backgroundColor: m.color + "20",
                          color: m.color,
                        }}
                      >
                        {m.duracion}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">
                Ejemplo de Desarrollo para Comunicación
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Así se vería un momento de Desarrollo bien organizado en
                submomentos:
              </p>
              <MomentPreview
                name="Desarrollo"
                color="#a855f7"
                activities={[
                  { name: "Lectura individual (texto narrativo)", min: 10 },
                  { name: "Responder preguntas de comprensión", min: 15 },
                  {
                    name: "Modelado: cómo identificar la idea principal",
                    min: 10,
                  },
                  { name: "Práctica guiada en parejas", min: 12 },
                  { name: "Producción individual: resumen", min: 13 },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-lg mb-4">
                  Pausas activas disponibles
                </h3>
                <div className="space-y-2">
                  {[
                    {
                      emoji: "🧟",
                      name: "La momia despierta",
                      tipo: "Movimiento",
                    },
                    {
                      emoji: "🐉",
                      name: "La respiración del dragón",
                      tipo: "Respiración",
                    },
                    {
                      emoji: "👁️",
                      name: "El chupacabras silencioso",
                      tipo: "Atención",
                    },
                    {
                      emoji: "🗿",
                      name: "La estatua encantada",
                      tipo: "Relajación",
                    },
                    {
                      emoji: "👾",
                      name: "El monstruo congelado",
                      tipo: "Movimiento",
                    },
                  ].map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20"
                    >
                      <span className="text-xl">{p.emoji}</span>
                      <div>
                        <p className="font-bold text-sm">{p.name}</p>
                        <p className="text-xs text-orange-400">{p.tipo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4">
                  Personalización de momentos
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      icon: <Palette size={16} className="text-pink-400" />,
                      titulo: "Color de momento",
                      desc: "Cada momento tiene un color propio. Haz clic en el ícono de paleta para cambiarlo.",
                    },
                    {
                      icon: <ImageIcon size={16} className="text-blue-400" />,
                      titulo: "Imagen de fondo",
                      desc: "Puedes poner una imagen de fondo en cada momento para hacerlo más visual.",
                    },
                    {
                      icon: (
                        <MessageSquare size={16} className="text-amber-400" />
                      ),
                      titulo: "Nota docente",
                      desc: "Agrega recordatorios personales en cada actividad. Solo tú los ves.",
                    },
                    {
                      icon: <Settings size={16} className="text-gray-400" />,
                      titulo: "Fuente y tamaño",
                      desc: "Desde Configuración puedes cambiar la tipografía y el tamaño de letra.",
                    },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      {c.icon}
                      <div>
                        <p className="font-bold text-xs mb-0.5">{c.titulo}</p>
                        <p className="text-xs text-gray-400">{c.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Accordion items={ACCORDION_DATA.moments} />
          </div>
        )}

        {/* ═══════════════════════════════════════ MODO CLASE */}
        {activeTab === "classmode" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Modo Clase: tu compañero en vivo
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                El Modo Clase transforma tu sesión planificada en una guía
                interactiva en tiempo real. Diseñado para usarse con proyector,
                tableta o laptop durante la clase.
              </p>
            </div>

            {/* Visual mock */}
            <div className="p-6 rounded-2xl bg-[#1a1a2e] border border-white/10 space-y-4">
              <div className="text-center space-y-2">
                <div
                  className="inline-block px-4 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: "#22c55e33", color: "#22c55e" }}
                >
                  DESARROLLO · 3/8 completados
                </div>
                <h3 className="text-2xl font-bold">
                  Práctica guiada en parejas
                </h3>
                <div className="text-6xl font-mono font-bold text-white">
                  12:34
                </div>
                <p className="text-sm text-emerald-400">
                  ⏰ Faltan 2:34 minutos
                </p>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: "45%" }}
                />
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                💬 Nota docente: Asegúrate que todos tengan el texto. Apoya al
                grupo del fondo.
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {[
                  "⏸ Pausar",
                  "⏭ Saltar",
                  "➕2min",
                  "➖2min",
                  "📝 Observación",
                  "⏹ Terminar",
                ].map((btn, i) => (
                  <div
                    key={i}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 border border-white/20 text-gray-300"
                  >
                    {btn}
                  </div>
                ))}
              </div>
              <div className="text-center text-xs text-gray-600">
                Siguiente: Producción individual (13 min)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-lg mb-4">
                  Controles disponibles
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      icon: <Play size={16} className="text-green-400" />,
                      btn: "Iniciar / Continuar",
                      desc: "Inicia el cronómetro del submomento actual.",
                    },
                    {
                      icon: <Pause size={16} className="text-amber-400" />,
                      btn: "Pausar",
                      desc: "Pausa el tiempo sin perder tu posición.",
                    },
                    {
                      icon: <SkipForward size={16} className="text-blue-400" />,
                      btn: "Saltar",
                      desc: "Pasa al siguiente submomento sin esperar.",
                    },
                    {
                      icon: <Plus size={16} className="text-purple-400" />,
                      btn: "+2 minutos",
                      desc: "Extiende el tiempo del momento actual.",
                    },
                    {
                      icon: (
                        <MessageSquare size={16} className="text-orange-400" />
                      ),
                      btn: "Registrar observación",
                      desc: "Anota algo rápido sin salir del Modo Clase.",
                    },
                    {
                      icon: <BarChart2 size={16} className="text-rose-400" />,
                      btn: "Ver resumen",
                      desc: "Muestra el avance general de la sesión.",
                    },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        {c.icon}
                      </div>
                      <div>
                        <p className="font-bold text-xs">{c.btn}</p>
                        <p className="text-xs text-gray-500">{c.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4">Pasos para iniciar</h3>
                <div className="space-y-3">
                  <StepCard
                    number="1"
                    title="Guarda tu sesión"
                    desc="Completa los momentos y guarda desde el editor. La sesión aparecerá en 'Mis sesiones'."
                    color="#22c55e"
                  />
                  <StepCard
                    number="2"
                    title="Abre la sesión"
                    desc="Ve a 'Mis sesiones' y haz clic en el botón verde 'Iniciar clase'."
                    color="#06b6d4"
                  />
                  <StepCard
                    number="3"
                    title="Confirma el horario"
                    desc="CronoAula te preguntará si hay inicio tardío o si el tiempo sigue igual."
                    color="#f59e0b"
                  />
                  <StepCard
                    number="4"
                    title="¡A enseñar!"
                    desc="El cronómetro inicia. Tú controlas el ritmo. CronoAula te acompaña."
                    color="#a855f7"
                  />
                </div>

                <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs text-blue-300 font-bold mb-1">
                    💡 Consejo para proyector
                  </p>
                  <p className="text-xs text-gray-400">
                    El Modo Clase usa letra grande y alto contraste. Perfecto
                    para proyectarlo al frente del aula. Los estudiantes pueden
                    ver el momento y el tiempo restante.
                  </p>
                </div>
              </div>
            </div>

            <Accordion items={ACCORDION_DATA.classmode} />
          </div>
        )}

        {/* ═══════════════════════════════════════ INICIO TARDÍO */}
        {activeTab === "late" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Ajuste por inicio tardío
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                En la escuela peruana, el tiempo siempre cambia. CronoAula tiene
                estrategias reales para cuando la clase empieza tarde, sin
                sacrificar lo más importante.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <AlertCircle size={20} /> Escenario típico
              </div>
              <p className="text-sm text-gray-300">
                Tu sesión de Comunicación dura 90 minutos y empieza a las 8:00.
                Pero la formación se extendió y llegaste al aula a las 8:18.
                Ahora tienes 72 minutos reales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  color: "#22c55e",
                  titulo: "Opción A: Todo proporcional",
                  desc: "Reduce todos los momentos por igual. Si tenías 20 min de Inicio, ahora tendrás 16.",
                  cuando:
                    "Cuando todos los momentos son igualmente importantes.",
                  ejemplo: [
                    "Inicio: 20 → 16 min",
                    "Desarrollo: 50 → 40 min",
                    "Cierre: 20 → 16 min",
                  ],
                },
                {
                  color: "#a855f7",
                  titulo: "Opción B: Proteger el Desarrollo ⭐",
                  desc: "Recorta el Inicio y el Cierre, pero mantiene intacto el Desarrollo.",
                  cuando:
                    "Recomendada. El Desarrollo es el corazón del aprendizaje.",
                  ejemplo: [
                    "Inicio: 20 → 10 min",
                    "Desarrollo: 50 → 50 min",
                    "Cierre: 20 → 12 min",
                  ],
                },
                {
                  color: "#f97316",
                  titulo: "Opción C: Versión rápida",
                  desc: "Elimina submomentos opcionales y agrupa actividades similares.",
                  cuando:
                    "Cuando el retraso es grande (+25 min) y debes priorizar.",
                  ejemplo: [
                    "Mantiene propósito principal",
                    "Elimina socialización extendida",
                    "Metacognición oral (no escrita)",
                  ],
                },
                {
                  color: "#06b6d4",
                  titulo: "Opción D: Mantener tiempos",
                  desc: "Conserva los tiempos originales. La clase terminará más tarde.",
                  cuando:
                    "Cuando tienes flexibilidad de horario y no hay clase después.",
                  ejemplo: [
                    "Sin cambios en los momentos",
                    "El recreo puede ajustarse",
                    "Ideal para horas libres",
                  ],
                },
              ].map((op, i) => (
                <div
                  key={i}
                  className="p-5 rounded-xl border space-y-3"
                  style={{
                    borderColor: op.color + "30",
                    backgroundColor: op.color + "08",
                  }}
                >
                  <h3 className="font-bold text-sm" style={{ color: op.color }}>
                    {op.titulo}
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {op.desc}
                  </p>
                  <div className="space-y-1">
                    {op.ejemplo.map((e, ei) => (
                      <div
                        key={ei}
                        className="flex items-center gap-2 text-xs text-gray-400"
                      >
                        <ChevronRight size={12} style={{ color: op.color }} />{" "}
                        {e}
                      </div>
                    ))}
                  </div>
                  <div
                    className="p-2 rounded-lg text-xs text-gray-500 italic"
                    style={{ backgroundColor: op.color + "10" }}
                  >
                    Úsala cuando: {op.cuando}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">¿Cómo hacerlo?</h3>
              <div className="space-y-3">
                <StepCard
                  number="1"
                  title="Inicia el Modo Clase"
                  desc="Abre tu sesión guardada y presiona 'Iniciar clase'."
                  color="#06b6d4"
                />
                <StepCard
                  number="2"
                  title="CronoAula detecta el retraso"
                  desc="Si la hora es diferente a la planificada, te preguntará cuántos minutos llevas de retraso."
                  color="#f59e0b"
                />
                <StepCard
                  number="3"
                  title="Elige tu estrategia"
                  desc="Selecciona entre las 4 opciones. CronoAula recalcula todos los tiempos automáticamente."
                  color="#a855f7"
                />
                <StepCard
                  number="4"
                  title="Continúa con la clase"
                  desc="Los momentos se actualizan. Tu clase sigue fluyendo sin perder el norte pedagógico."
                  color="#22c55e"
                />
              </div>
            </div>

            <Accordion items={ACCORDION_DATA.late} />
          </div>
        )}

        {/* ═══════════════════════════════════════ TIPS PRO */}
        {activeTab === "tips" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Consejos Pro para docentes
              </h2>
              <p className="text-gray-400 text-sm">
                Trucos y estrategias de docentes experimentados que usan
                CronoAula.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TipCard
                icon={<Zap size={16} />}
                color="#f59e0b"
                title="Tip #1: Plantilla + IA = combo perfecto"
                text="Elige una plantilla por área, luego usa la IA para refinarla con tu planificación específica. Ahorras 80% del tiempo de edición."
              />
              <TipCard
                icon={<Star size={16} />}
                color="#22c55e"
                title="Tip #2: Las notas docentes son oro"
                text="Escribe en la nota docente de cada submomento cosas como: '¡Ojo! Niño X necesita apoyo' o '¿Tienen los materiales listos?'. Solo tú las ves."
              />
              <TipCard
                icon={<Clock size={16} />}
                color="#06b6d4"
                title="Tip #3: Siempre añade un buffer"
                text="Planifica 5-10 min menos que tu tiempo total. Ese buffer te salva cuando algo se extiende o hay una interrupción inesperada."
              />
              <TipCard
                icon={<Target size={16} />}
                color="#a855f7"
                title="Tip #4: Metacognición siempre"
                text="Nunca quites la metacognición aunque el tiempo apriete. 3 preguntas orales bastan: ¿Qué aprendí? ¿Cómo? ¿Para qué?"
              />
              <TipCard
                icon={<RefreshCw size={16} />}
                color="#ec4899"
                title="Tip #5: Duplica y adapta"
                text="Si das la misma sesión a varios grados, crea una, guárdala y duplícala. Luego ajusta los detalles para cada grupo."
              />
              <TipCard
                icon={<Download size={16} />}
                color="#f97316"
                title="Tip #6: Exporta y comparte"
                text="Exporta tu sesión como texto y compártela con tu director o equipo pedagógico. Es tu evidencia de planificación."
              />
              <TipCard
                icon={<MessageSquare size={16} />}
                color="#10b981"
                title="Tip #7: Observaciones en vivo"
                text="Usa el botón de observaciones durante la clase para anotar lo que ocurre. Al terminar, esas notas son tu diagnóstico pedagógico."
              />
              <TipCard
                icon={<Lightbulb size={16} />}
                color="#6366f1"
                title="Tip #8: Pausa activa siempre gana"
                text="Una pausa activa de 3 minutos después del Desarrollo renueva la atención. La Momia Despierta funciona con cualquier grado."
              />
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-900/30 to-blue-900/30 border border-violet-500/20 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <HelpCircle className="text-violet-400" size={20} /> Preguntas y
                respuestas rápidas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    q: "¿Se guarda automáticamente?",
                    r: "Sí. Cada cambio que haces se guarda localmente de forma automática. No perderás tu trabajo.",
                  },
                  {
                    q: "¿Funciona sin internet?",
                    r: "El editor funciona offline. La IA necesita conexión. El Modo Clase funciona sin conexión una vez cargada la sesión.",
                  },
                  {
                    q: "¿Puedo usar en proyector?",
                    r: "El Modo Clase está diseñado para eso: letra grande, colores contrastados, sin distracciones.",
                  },
                  {
                    q: "¿Puedo tener sesiones de grados diferentes?",
                    r: "Sí. Cada sesión tiene su propio grado y área. Puedes tener todas las que necesites.",
                  },
                  {
                    q: "¿Cómo recupero una sesión borrada?",
                    r: "Usa el historial de versiones de CronoAula. Las sesiones se guardan en la nube.",
                  },
                  {
                    q: "¿Puedo compartir una sesión con otro docente?",
                    r: "Exporta el texto de la sesión y envíala. El otro docente puede pegarla en la IA para importarla.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <p className="font-bold text-xs text-violet-300 mb-1">
                      {item.q}
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {item.r}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 flex-wrap">
              <a
                href="/create"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <Plus size={16} /> Crear sesión ahora
              </a>
              <a
                href="/sessions"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <FileText size={16} /> Ver mis sesiones
              </a>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
}

function Palette({ size, style, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
    >
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

function ImageIcon({ size, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}
