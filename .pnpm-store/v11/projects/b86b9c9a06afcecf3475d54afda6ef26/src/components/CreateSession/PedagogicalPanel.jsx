export function PedagogicalPanel({ metadata, setMetadata, isDark }) {
  return (
    <div
      className={`p-5 rounded-2xl border space-y-4 ${isDark ? "bg-[#1a1a2e] border-white/10" : "bg-white border-slate-200"}`}
    >
      <h3 className="text-xs font-bold uppercase tracking-wider opacity-50">
        Propósito pedagógico
      </h3>
      <textarea
        placeholder="¿Qué aprenderán los estudiantes hoy?..."
        className={`w-full h-24 p-3 rounded-xl text-sm border outline-none resize-none ${isDark ? "bg-[#0f0f1a] border-white/10 text-white placeholder-gray-600 focus:border-white/30" : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-300"}`}
        value={metadata.purpose}
        onChange={(e) => setMetadata({ ...metadata, purpose: e.target.value })}
      />
      <textarea
        placeholder="Evidencia o producto esperado..."
        className={`w-full h-20 p-3 rounded-xl text-sm border outline-none resize-none ${isDark ? "bg-[#0f0f1a] border-white/10 text-white placeholder-gray-600 focus:border-white/30" : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-300"}`}
        value={metadata.evidence}
        onChange={(e) => setMetadata({ ...metadata, evidence: e.target.value })}
      />
      <textarea
        placeholder="Materiales necesarios..."
        className={`w-full h-20 p-3 rounded-xl text-sm border outline-none resize-none ${isDark ? "bg-[#0f0f1a] border-white/10 text-white placeholder-gray-600 focus:border-white/30" : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-300"}`}
        value={metadata.materials}
        onChange={(e) =>
          setMetadata({ ...metadata, materials: e.target.value })
        }
      />
      <textarea
        placeholder="Notas generales del docente..."
        className={`w-full h-20 p-3 rounded-xl text-sm border outline-none resize-none ${isDark ? "bg-[#0f0f1a] border-white/10 text-white placeholder-gray-600 focus:border-white/30" : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-300"}`}
        value={metadata.notes}
        onChange={(e) => setMetadata({ ...metadata, notes: e.target.value })}
      />
    </div>
  );
}
