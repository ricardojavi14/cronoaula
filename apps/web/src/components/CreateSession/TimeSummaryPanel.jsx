import { RefreshCw } from "lucide-react";

export function TimeSummaryPanel({
  totalTime,
  metadata,
  timeDiff,
  isDark,
  redistributeTime,
}) {
  return (
    <div
      className={`p-5 rounded-2xl border space-y-3 ${isDark ? "bg-[#1a1a2e] border-white/10" : "bg-white border-slate-200"}`}
    >
      <h3 className="text-xs font-bold uppercase tracking-wider opacity-50">
        Resumen de tiempo
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="opacity-60">Total planificado</span>
          <span className="font-bold">{totalTime} min</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="opacity-60">Duración sesión</span>
          <span className="font-bold">{metadata.total_duration} min</span>
        </div>
        <div
          className={`flex justify-between text-sm font-bold ${timeDiff === 0 ? "text-green-400" : timeDiff > 0 ? "text-amber-400" : "text-red-400"}`}
        >
          <span>Diferencia</span>
          <span>{timeDiff > 0 ? `+${timeDiff}` : timeDiff} min</span>
        </div>
      </div>
      <div
        className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-100"}`}
      >
        <div
          className={`h-full rounded-full transition-all ${timeDiff === 0 ? "bg-green-500" : timeDiff > 0 ? "bg-amber-500" : "bg-red-500"}`}
          style={{
            width: `${Math.min(100, (totalTime / metadata.total_duration) * 100)}%`,
          }}
        />
      </div>
      {timeDiff !== 0 && (
        <button
          onClick={redistributeTime}
          className="w-full py-2 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-500/30 flex items-center justify-center gap-2"
        >
          <RefreshCw size={14} /> Ajustar tiempos automáticamente
        </button>
      )}
    </div>
  );
}
