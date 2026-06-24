import { Plus } from "lucide-react";
import { MomentCard } from "./MomentCard";

export function MomentEditor({
  moments,
  expandedMoments,
  setExpandedMoments,
  isDark,
  colorPickerFor,
  setColorPickerFor,
  bgImageFor,
  setBgImageFor,
  bgImageInput,
  setBgImageInput,
  updateMoment,
  duplicateMoment,
  removeMoment,
  addSubmoment,
  removeSubmoment,
  updateSubmoment,
  updateSubmomentTime,
  toMinSec,
  addMoment,
}) {
  return (
    <div className="lg:col-span-3 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">MOMENTOS</h2>
        <span className="text-xs opacity-40 font-mono">
          {moments.length} momentos
        </span>
      </div>

      <div className="space-y-3">
        {moments.map((moment, mIdx) => (
          <MomentCard
            key={moment.id}
            moment={moment}
            mIdx={mIdx}
            isExpanded={expandedMoments[mIdx]}
            isDark={isDark}
            colorPickerFor={colorPickerFor}
            setColorPickerFor={setColorPickerFor}
            bgImageFor={bgImageFor}
            setBgImageFor={setBgImageFor}
            bgImageInput={bgImageInput}
            setBgImageInput={setBgImageInput}
            updateMoment={updateMoment}
            duplicateMoment={duplicateMoment}
            removeMoment={removeMoment}
            addSubmoment={addSubmoment}
            removeSubmoment={removeSubmoment}
            updateSubmoment={updateSubmoment}
            updateSubmomentTime={updateSubmomentTime}
            toMinSec={toMinSec}
            setExpandedMoments={setExpandedMoments}
          />
        ))}

        <button
          onClick={addMoment}
          className={`w-full py-5 rounded-2xl border-2 border-dashed text-sm font-bold flex items-center justify-center gap-2 transition-all ${isDark ? "border-white/20 text-white/40 hover:border-white/40 hover:text-white/70" : "border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500"}`}
        >
          <Plus size={20} /> Agregar momento
        </button>
      </div>
    </div>
  );
}
