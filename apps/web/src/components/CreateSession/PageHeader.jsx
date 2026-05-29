import { ArrowLeft, Clock, Wand2, Settings, Save } from "lucide-react";

export function PageHeader({
  metadata,
  timeDiff,
  isDark,
  showAIPanel,
  setShowAIPanel,
  showSettings,
  setShowSettings,
  handleSave,
  loading,
}) {
  return (
    <div
      className={`px-4 py-5 flex items-center justify-between gap-4 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}
    >
      <div className="flex items-center gap-3">
        <a
          href="/sessions"
          className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-slate-100 text-slate-500"}`}
        >
          <ArrowLeft size={20} />
        </a>
        <div>
          <h1
            className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            {metadata.title || "Nueva sesión"}
          </h1>
          <p
            className={`text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}
          >
            {metadata.area} · {metadata.grade || "Grado no definido"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${timeDiff === 0 ? "bg-green-500/20 text-green-400" : timeDiff > 0 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}
        >
          <Clock size={12} />
          {timeDiff === 0
            ? "Tiempos ✓"
            : timeDiff > 0
              ? `Sobran ${timeDiff} min`
              : `Faltan ${Math.abs(timeDiff)} min`}
        </div>
        <button
          onClick={() => setShowAIPanel(!showAIPanel)}
          className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${isDark ? "bg-violet-600/30 hover:bg-violet-600/50 text-violet-300" : "bg-violet-50 hover:bg-violet-100 text-violet-700"}`}
        >
          <Wand2 size={16} /> IA
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-slate-100 text-slate-500"}`}
        >
          <Settings size={18} />
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Save size={16} /> {loading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
