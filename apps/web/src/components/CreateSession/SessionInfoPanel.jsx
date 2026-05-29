import { AREAS } from "@/data/constants";

export function SessionInfoPanel({ metadata, setMetadata, isDark }) {
  return (
    <div
      className={`p-5 rounded-2xl border space-y-4 ${isDark ? "bg-[#1a1a2e] border-white/10" : "bg-white border-slate-200"}`}
    >
      <h3 className="text-xs font-bold uppercase tracking-wider opacity-50">
        Datos de la sesión
      </h3>

      <div className="space-y-1">
        <label className="text-xs font-bold opacity-50 uppercase">
          Título *
        </label>
        <input
          placeholder="Nombre de la sesión..."
          className={`w-full p-3 rounded-xl text-sm font-semibold border outline-none transition-all ${isDark ? "bg-[#0f0f1a] border-white/10 text-white placeholder-gray-600 focus:border-white/30" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400"}`}
          value={metadata.title}
          onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold opacity-50 uppercase">Área</label>
          <select
            className={`w-full p-2 rounded-xl text-sm border outline-none ${isDark ? "bg-[#0f0f1a] border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
            value={metadata.area}
            onChange={(e) => {
              setMetadata({ ...metadata, area: e.target.value });
            }}
          >
            {AREAS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold opacity-50 uppercase">
            Grado
          </label>
          <input
            placeholder="1° primaria..."
            className={`w-full p-2 rounded-xl text-sm border outline-none ${isDark ? "bg-[#0f0f1a] border-white/10 text-white placeholder-gray-600" : "bg-slate-50 border-slate-200 text-slate-800"}`}
            value={metadata.grade}
            onChange={(e) =>
              setMetadata({ ...metadata, grade: e.target.value })
            }
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold opacity-50 uppercase">Fecha</label>
        <input
          type="date"
          className={`w-full p-2 rounded-xl text-sm border outline-none ${isDark ? "bg-[#0f0f1a] border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
          value={metadata.date}
          onChange={(e) => setMetadata({ ...metadata, date: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <label className="text-xs font-bold opacity-50 uppercase">
            Inicio
          </label>
          <input
            type="time"
            className={`w-full p-2 rounded-xl text-sm border outline-none ${isDark ? "bg-[#0f0f1a] border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
            value={metadata.start_time}
            onChange={(e) =>
              setMetadata({ ...metadata, start_time: e.target.value })
            }
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold opacity-50 uppercase">Fin</label>
          <input
            type="time"
            className={`w-full p-2 rounded-xl text-sm border outline-none ${isDark ? "bg-[#0f0f1a] border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
            value={metadata.end_time}
            onChange={(e) =>
              setMetadata({ ...metadata, end_time: e.target.value })
            }
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold opacity-50 uppercase">
            Duración (min)
          </label>
          <input
            type="number"
            className={`w-full p-2 rounded-xl text-sm border outline-none ${isDark ? "bg-[#0f0f1a] border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
            value={metadata.total_duration}
            onChange={(e) =>
              setMetadata({
                ...metadata,
                total_duration: parseInt(e.target.value),
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
