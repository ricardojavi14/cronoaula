import { X } from "lucide-react";

export function SubmomentItem({
  sm,
  smIdx,
  mIdx,
  mColor,
  isDark,
  updateSubmoment,
  updateSubmomentTime,
  removeSubmoment,
  toMinSec,
}) {
  const { min, sec } = toMinSec(sm.duration || 0);

  return (
    <div
      className={`p-3 rounded-xl border ${isDark ? "bg-[#1a1a2e] border-white/5" : "bg-white border-slate-100"}`}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-1.5 h-1.5 rounded-full shrink-0 opacity-60"
          style={{ backgroundColor: mColor }}
        />
        <input
          className={`flex-1 text-sm font-semibold bg-transparent outline-none ${isDark ? "text-white" : "text-slate-800"}`}
          value={sm.name}
          onChange={(e) => updateSubmoment(mIdx, smIdx, "name", e.target.value)}
          placeholder="Nombre de la actividad..."
        />
        {/* Min/sec inputs */}
        <div className="flex items-center gap-1 shrink-0">
          <input
            type="number"
            min="0"
            className={`w-12 p-1 rounded-lg text-center text-sm font-mono font-bold border outline-none ${isDark ? "bg-[#0f0f1a] border-white/10 text-white" : "bg-slate-100 border-slate-200 text-slate-800"}`}
            value={min}
            onChange={(e) =>
              updateSubmomentTime(mIdx, smIdx, "min", e.target.value)
            }
          />
          <span className="text-xs opacity-40">min</span>
          <input
            type="number"
            min="0"
            max="59"
            className={`w-12 p-1 rounded-lg text-center text-sm font-mono font-bold border outline-none ${isDark ? "bg-[#0f0f1a] border-white/10 text-white" : "bg-slate-100 border-slate-200 text-slate-800"}`}
            value={sec}
            onChange={(e) =>
              updateSubmomentTime(mIdx, smIdx, "sec", e.target.value)
            }
          />
          <span className="text-xs opacity-40">seg</span>
        </div>
        <button
          onClick={() => removeSubmoment(mIdx, smIdx)}
          className="p-1 rounded-lg text-red-400 opacity-40 hover:opacity-100 transition-all"
        >
          <X size={14} />
        </button>
      </div>
      <div className="mt-2 pl-5 space-y-1">
        <input
          placeholder="Descripción de la actividad..."
          className={`w-full text-xs bg-transparent outline-none opacity-60 focus:opacity-100 border-b border-transparent focus:border-current ${isDark ? "text-gray-300" : "text-slate-600"}`}
          value={sm.description}
          onChange={(e) =>
            updateSubmoment(mIdx, smIdx, "description", e.target.value)
          }
        />
        <input
          placeholder="💬 Nota para ti (solo la verás tú en Modo Clase)..."
          className={`w-full text-xs bg-transparent outline-none opacity-50 focus:opacity-80 border-b border-transparent focus:border-current ${isDark ? "text-amber-300" : "text-amber-700"}`}
          value={sm.teacher_note}
          onChange={(e) =>
            updateSubmoment(mIdx, smIdx, "teacher_note", e.target.value)
          }
        />
      </div>
    </div>
  );
}
