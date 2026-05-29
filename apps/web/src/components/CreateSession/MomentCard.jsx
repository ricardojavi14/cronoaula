import {
  ChevronUp,
  ChevronDown,
  Palette,
  Image,
  Copy,
  X,
  Plus,
} from "lucide-react";
import { MOMENT_COLORS } from "@/data/constants";
import { SubmomentItem } from "./SubmomentItem";

export function MomentCard({
  moment,
  mIdx,
  isExpanded,
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
  setExpandedMoments,
}) {
  const mColor = moment.color || MOMENT_COLORS[mIdx % MOMENT_COLORS.length].hex;
  const momentTotal = moment.submoments.reduce(
    (s, sm) => s + (parseInt(sm.duration) || 0),
    0,
  );

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all ${isDark ? "border-white/10" : "border-slate-200"}`}
      style={{ borderLeftColor: mColor, borderLeftWidth: 4 }}
    >
      {/* Moment header */}
      <div
        className={`flex items-center gap-3 px-4 py-3 ${isDark ? "bg-[#1a1a2e]" : "bg-white"}`}
        style={
          moment.bgImage
            ? {
                backgroundImage: `url(${moment.bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      >
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: mColor }}
        />
        <input
          className={`flex-1 font-bold text-sm bg-transparent outline-none border-b border-transparent focus:border-current ${isDark ? "text-white" : "text-slate-900"}`}
          value={moment.name}
          onChange={(e) => updateMoment(mIdx, "name", e.target.value)}
          style={
            moment.bgImage
              ? {
                  textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                  color: "white",
                }
              : {}
          }
        />
        <span className="text-xs font-mono opacity-50 shrink-0">
          {momentTotal} min
        </span>

        {/* Color picker */}
        <div className="relative shrink-0">
          <button
            onClick={() =>
              setColorPickerFor(colorPickerFor === mIdx ? null : mIdx)
            }
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Color"
          >
            <Palette size={14} style={{ color: mColor }} />
          </button>
          {colorPickerFor === mIdx && (
            <div
              className={`absolute right-0 top-8 z-20 p-3 rounded-xl shadow-2xl border grid grid-cols-5 gap-1.5 ${isDark ? "bg-[#0f0f1a] border-white/20" : "bg-white border-slate-200"}`}
            >
              {MOMENT_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => {
                    updateMoment(mIdx, "color", c.hex);
                    setColorPickerFor(null);
                  }}
                  className="w-6 h-6 rounded-full border-2 border-transparent hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: c.hex,
                    borderColor:
                      moment.color === c.hex ? "white" : "transparent",
                  }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* BG image */}
        <div className="relative shrink-0">
          <button
            onClick={() => setBgImageFor(bgImageFor === mIdx ? null : mIdx)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Imagen de fondo"
          >
            <Image size={14} className="opacity-60" />
          </button>
          {bgImageFor === mIdx && (
            <div
              className={`absolute right-0 top-8 z-20 p-3 rounded-xl shadow-2xl border w-64 space-y-2 ${isDark ? "bg-[#0f0f1a] border-white/20" : "bg-white border-slate-200"}`}
            >
              <p className="text-xs opacity-60">URL de imagen de fondo</p>
              <input
                placeholder="https://imagen.jpg"
                className={`w-full p-2 rounded-lg text-xs border outline-none ${isDark ? "bg-[#1a1a2e] border-white/10 text-white" : "bg-slate-50 border-slate-200"}`}
                value={bgImageInput}
                onChange={(e) => setBgImageInput(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    updateMoment(mIdx, "bgImage", bgImageInput);
                    setBgImageFor(null);
                    setBgImageInput("");
                  }}
                  className="flex-1 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-bold"
                >
                  Aplicar
                </button>
                <button
                  onClick={() => {
                    updateMoment(mIdx, "bgImage", "");
                    setBgImageFor(null);
                  }}
                  className="px-2 py-1.5 rounded-lg text-xs opacity-60 hover:opacity-100"
                >
                  Quitar
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => duplicateMoment(mIdx)}
          className="p-1.5 rounded-lg hover:bg-white/10 opacity-50 hover:opacity-100 transition-all"
          title="Duplicar"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={() => removeMoment(mIdx)}
          className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 opacity-60 hover:opacity-100 transition-all"
          title="Eliminar"
        >
          <X size={14} />
        </button>
        <button
          onClick={() =>
            setExpandedMoments((prev) => ({
              ...prev,
              [mIdx]: !prev[mIdx],
            }))
          }
          className="p-1.5 rounded-lg hover:bg-white/10 opacity-60 hover:opacity-100 transition-all"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Submoments */}
      {isExpanded && (
        <div
          className={`px-4 pb-4 pt-2 space-y-2 ${isDark ? "bg-[#13132a]" : "bg-slate-50"}`}
        >
          {moment.submoments.length === 0 && (
            <p className="text-xs opacity-30 text-center py-4">
              Sin actividades — agrega submomentos
            </p>
          )}
          {moment.submoments.map((sm, smIdx) => (
            <SubmomentItem
              key={sm.id}
              sm={sm}
              smIdx={smIdx}
              mIdx={mIdx}
              mColor={mColor}
              isDark={isDark}
              updateSubmoment={updateSubmoment}
              updateSubmomentTime={updateSubmomentTime}
              removeSubmoment={removeSubmoment}
              toMinSec={toMinSec}
            />
          ))}

          <button
            onClick={() => addSubmoment(mIdx)}
            className="w-full py-2 rounded-xl border border-dashed text-xs font-bold opacity-40 hover:opacity-70 transition-all flex items-center justify-center gap-2"
            style={{ borderColor: mColor, color: mColor }}
          >
            <Plus size={14} /> Agregar actividad
          </button>
        </div>
      )}
    </div>
  );
}
