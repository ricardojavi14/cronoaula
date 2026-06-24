import { Wand2, Save } from "lucide-react";

export function BottomBar({ isDark, setShowAIPanel, handleSave, loading }) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 border-t py-4 px-6 z-20 ${isDark ? "bg-[#0f0f1a]/95 border-white/10" : "bg-white/95 border-slate-200"} backdrop-blur-md`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <a
            href="/sessions"
            className={`text-sm opacity-60 hover:opacity-100 transition-opacity ${isDark ? "text-white" : "text-slate-700"}`}
          >
            Cancelar
          </a>
          <button
            onClick={() => setShowAIPanel(true)}
            className={`text-sm font-semibold flex items-center gap-2 ${isDark ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-700"}`}
          >
            <Wand2 size={16} /> Cargar con IA
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 text-sm transition-colors"
        >
          <Save size={18} /> {loading ? "Guardando..." : "Guardar sesión"}
        </button>
      </div>
    </div>
  );
}
