import { ToggleLeft, ToggleRight } from "lucide-react";
import { FONT_OPTIONS } from "@/data/constants";

export function SettingsPanel({ settings, setSettings, isDark }) {
  return (
    <div
      className={`p-5 rounded-2xl border ${isDark ? "bg-[#1a1a2e] border-white/10" : "bg-white border-slate-200"} space-y-4`}
    >
      <h3 className="font-bold text-sm uppercase tracking-wider opacity-60">
        Configuración de la sesión
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold opacity-60 uppercase">
            Avance de momentos
          </label>
          <button
            onClick={() =>
              setSettings((s) => ({ ...s, autoAdvance: !s.autoAdvance }))
            }
            className="flex items-center gap-3 w-full"
          >
            {settings.autoAdvance ? (
              <ToggleRight size={28} className="text-emerald-400" />
            ) : (
              <ToggleLeft size={28} className="opacity-40" />
            )}
            <span className="text-sm">
              {settings.autoAdvance
                ? "Automático"
                : "Manual (presionar Siguiente)"}
            </span>
          </button>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold opacity-60 uppercase">
            Fuente
          </label>
          <select
            value={settings.font}
            onChange={(e) =>
              setSettings((s) => ({ ...s, font: e.target.value }))
            }
            className={`w-full p-2 rounded-lg text-sm border ${isDark ? "bg-[#0f0f1a] border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold opacity-60 uppercase">
            Tamaño de letra
          </label>
          <select
            value={settings.fontSize}
            onChange={(e) =>
              setSettings((s) => ({ ...s, fontSize: e.target.value }))
            }
            className={`w-full p-2 rounded-lg text-sm border ${isDark ? "bg-[#0f0f1a] border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
          >
            <option value="sm">Pequeño</option>
            <option value="base">Mediano</option>
            <option value="lg">Grande</option>
            <option value="xl">Muy grande</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold opacity-60 uppercase">
            Tema del editor
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setSettings((s) => ({ ...s, theme: "dark" }))}
              className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${settings.theme === "dark" ? "bg-slate-800 border-white/20 text-white" : "border-slate-200 text-slate-600"}`}
            >
              🌙 Oscuro
            </button>
            <button
              onClick={() => setSettings((s) => ({ ...s, theme: "light" }))}
              className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${settings.theme === "light" ? "bg-white border-slate-300 text-slate-900" : "border-slate-600 text-slate-400"}`}
            >
              ☀️ Claro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
