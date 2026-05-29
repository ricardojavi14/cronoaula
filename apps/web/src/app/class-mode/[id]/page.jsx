"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Plus,
  Minus,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  Clock,
  Timer,
  X,
  AlertTriangle,
  Eye,
  EyeOff,
  Maximize2,
  Volume2,
  VolumeX,
  Flag,
  BookOpen,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import { useAppSettings } from "@/context/AppSettingsContext";
import { getSession, addObservation, updateSubmomentStatus } from "@/utils/localStore";

const MOMENT_COLORS = [
  "#2563EB",
  "#059669",
  "#7C3AED",
  "#D97706",
  "#DC2626",
  "#0891B2",
  "#9333EA",
  "#CA8A04",
];

// Timer size classes based on settings
const TIMER_CLS = {
  grande: "text-[90px] md:text-[120px]",
  gigante: "text-[110px] md:text-[150px]",
  proyector: "text-[140px] md:text-[190px]",
};

export default function ClassModePage({ params }) {
  const { id } = params;
  const { settings, setSetting } = useAppSettings();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalSessionLeft, setTotalSessionLeft] = useState(0);
  const [currentMomentIdx, setCurrentMomentIdx] = useState(0);
  const [currentSubIdx, setCurrentSubIdx] = useState(0);
  const [showObservation, setShowObservation] = useState(false);
  const [showLateStart, setShowLateStart] = useState(false);
  const [observationText, setObservationText] = useState("");
  const [lateMinutes, setLateMinutes] = useState(10);
  const [projectorMode, setProjectorMode] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [alertShown2min, setAlertShown2min] = useState(false);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const timerRef = useRef(null);

  const fetchSession = useCallback(async () => {
    try {
      const data = getSession(id);
      if (data) {
        setSession(data);
        const firstSub = data.moments?.[0]?.submoments?.[0];
        setTimeLeft((firstSub?.duration || 0) * 60);
        const total = (data.moments || []).reduce(
          (t, m) => t + (m.submoments || []).reduce((s, sm) => s + (sm.duration || 0) * 60, 0),
          0,
        );
        setTotalSessionLeft(total);
      } else {
        toast.error("No encontré la sesión en este dispositivo");
      }
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar la sesión");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 121 && !alertShown2min) {
            setAlertShown2min(true);
            toast.warning("⏰ Quedan 2 minutos en este momento", {
              duration: 6000,
            });
            if (!isMuted) playBeep(440, 0.3);
          }
          if (prev <= 1) {
            clearInterval(timerRef.current);
            if (!isMuted) playBeep(880, 0.5);
            toast.info("✅ Momento completado — presiona Avanzar");
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
        setTotalSessionLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, alertShown2min, isMuted]);

  const playBeep = (freq, vol) => {
    try {
      if (typeof window === "undefined") return;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.value = vol;
      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 300);
    } catch (e) {}
  };

  const saveSubStatus = async (status) => {
    if (!session) return;
    const sub = session.moments[currentMomentIdx]?.submoments[currentSubIdx];
    if (!sub?.id) return;
    updateSubmomentStatus(id, sub.id, status);
  };

  const advance = useCallback(() => {
    if (!session) return;
    saveSubStatus("completed");
    setCompletedCount((c) => c + 1);
    setAlertShown2min(false);
    const moment = session.moments[currentMomentIdx];
    if (currentSubIdx < moment.submoments.length - 1) {
      const nextSub = moment.submoments[currentSubIdx + 1];
      setCurrentSubIdx(currentSubIdx + 1);
      setTimeLeft((nextSub.duration || 0) * 60);
      setIsActive(true);
    } else if (currentMomentIdx < session.moments.length - 1) {
      const nextMoment = session.moments[currentMomentIdx + 1];
      setCurrentMomentIdx(currentMomentIdx + 1);
      setCurrentSubIdx(0);
      setTimeLeft((nextMoment.submoments[0]?.duration || 0) * 60);
      setIsActive(true);
    } else {
      setIsActive(false);
      setShowSummary(true);
      toast.success("🎉 ¡Sesión finalizada! ¡Excelente trabajo!");
    }
  }, [session, currentMomentIdx, currentSubIdx]);

  const goBack = () => {
    if (!session) return;
    setAlertShown2min(false);
    if (currentSubIdx > 0) {
      const prevSub =
        session.moments[currentMomentIdx].submoments[currentSubIdx - 1];
      setCurrentSubIdx(currentSubIdx - 1);
      setTimeLeft((prevSub.duration || 0) * 60);
      setIsActive(false);
    } else if (currentMomentIdx > 0) {
      const prevMoment = session.moments[currentMomentIdx - 1];
      const lastSubIdx = prevMoment.submoments.length - 1;
      setCurrentMomentIdx(currentMomentIdx - 1);
      setCurrentSubIdx(lastSubIdx);
      setTimeLeft((prevMoment.submoments[lastSubIdx]?.duration || 0) * 60);
      setIsActive(false);
    }
  };

  const skipSubmoment = () => {
    saveSubStatus("skipped");
    setSkippedCount((c) => c + 1);
    advance();
  };

  const adjustLateStart = (strategy) => {
    if (!session) return;
    const totalRemaining = session.moments.reduce(
      (t, m) => t + m.submoments.reduce((s, sm) => s + (sm.duration || 0), 0),
      0,
    );
    const newTotal = Math.max(1, totalRemaining - lateMinutes);
    const factor = newTotal / totalRemaining;
    const newMoments = session.moments.map((m, mIdx) => ({
      ...m,
      submoments: m.submoments.map((sm) => {
        if (strategy === "protect" && mIdx === 1) return sm;
        return {
          ...sm,
          duration: Math.max(1, Math.round((sm.duration || 0) * factor)),
        };
      }),
    }));
    setSession({ ...session, moments: newMoments });
    const currentSub = newMoments[currentMomentIdx]?.submoments[currentSubIdx];
    setTimeLeft((currentSub?.duration || 0) * 60);
    setShowLateStart(false);
    toast.success("Tiempos recalculados. ¡A enseñar!");
  };

  const saveObservation = async () => {
    if (!observationText.trim()) return;
    addObservation(id, observationText);
    toast.success("Observación guardada en este dispositivo");
    setObservationText("");
    setShowObservation(false);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const formatTimeHM = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m} min`;
  };

  if (loading || !session) {
    return (
      <div className="fixed inset-0 bg-[#F7F6F3] flex items-center justify-center z-[100]">
        <div className="text-center space-y-3">
          <div
            className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
          <p className="text-slate-500 text-sm">Cargando modo clase...</p>
        </div>
        <style
          jsx
          global
        >{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const currentMoment = session.moments[currentMomentIdx];
  const currentSub = currentMoment?.submoments[currentSubIdx];
  const nextSub =
    currentMoment?.submoments[currentSubIdx + 1] ||
    session.moments[currentMomentIdx + 1]?.submoments[0];
  const nextMomentName =
    currentSubIdx === currentMoment?.submoments.length - 1
      ? session.moments[currentMomentIdx + 1]?.name
      : null;
  const momentColor =
    currentMoment?.color ||
    MOMENT_COLORS[currentMomentIdx % MOMENT_COLORS.length];
  const totalSubs = session.moments.reduce(
    (t, m) => t + m.submoments.length,
    0,
  );
  const doneSubs =
    session.moments
      .slice(0, currentMomentIdx)
      .reduce((t, m) => t + m.submoments.length, 0) + currentSubIdx;
  const overallProgress = totalSubs > 0 ? (doneSubs / totalSubs) * 100 : 0;
  const subProgress = currentSub
    ? (1 - timeLeft / ((currentSub.duration || 1) * 60)) * 100
    : 0;
  const isEnding = timeLeft > 0 && timeLeft <= 120;
  const isDone = timeLeft === 0;
  const timerClass = TIMER_CLS[settings.timerSize] || TIMER_CLS.grande;

  // ── Projector mode ──────────────────────────────────────────────────────────
  if (projectorMode) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center text-white p-8">
        <div className="text-center space-y-6 w-full max-w-4xl">
          <div className="flex items-center justify-center gap-3">
            <div
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: momentColor }}
            />
            <span className="text-3xl font-bold text-white/80">
              {currentMoment?.name}
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            {currentSub?.name}
          </h2>
          <div
            className={`${TIMER_CLS.proyector} font-mono font-black leading-none tabular-nums transition-colors ${isEnding ? "text-orange-400" : isDone ? "text-green-400" : "text-white"}`}
          >
            {formatTime(timeLeft)}
          </div>
          <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${subProgress}%`, backgroundColor: momentColor }}
            />
          </div>
          {nextSub && (
            <p className="text-white/50 text-xl">Siguiente: {nextSub.name}</p>
          )}
        </div>
        <button
          onClick={() => setProjectorMode(false)}
          className="absolute top-4 right-4 px-3 py-1.5 bg-white/10 rounded-lg text-sm font-medium hover:bg-white/20"
        >
          Salir proyector
        </button>
        <div className="absolute bottom-6 flex gap-3">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-colors ${isActive ? "bg-orange-500" : "bg-emerald-500"}`}
          >
            {isActive ? <Pause size={28} /> : <Play size={28} fill="white" />}
          </button>
          <button
            onClick={advance}
            className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30"
          >
            <SkipForward size={24} />
          </button>
        </div>
      </div>
    );
  }

  // ── Main class mode ──────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={currentMoment?.bgImage ? { backgroundImage: `linear-gradient(rgba(255,255,255,.86), rgba(255,255,255,.86)), url(${currentMoment.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" } : { backgroundColor: "var(--ca-bg, #F7F6F3)" }}
    >
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <a
            href="/sessions"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X size={18} />
          </a>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: momentColor }}
            />
            <span className="font-semibold text-slate-800 text-sm max-w-[200px] truncate">
              {session.title}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            <Timer size={12} /> {formatTimeHM(totalSessionLeft)} restante
          </div>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            title={isMuted ? "Activar sonido" : "Silenciar"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button
            onClick={() => setProjectorMode(true)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            title="Modo proyector"
          >
            <Maximize2 size={16} />
          </button>
          <button
            onClick={() => setShowQuickSettings(!showQuickSettings)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            title="Ajustes rápidos"
          >
            <Settings2 size={16} />
          </button>
          <button
            onClick={() => setShowLateStart(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold transition-colors border border-amber-200"
          >
            <AlertTriangle size={13} /> Empecé tarde
          </button>
        </div>
      </header>

      {/* Quick settings panel */}
      {showQuickSettings && (
        <div className="absolute top-14 right-2 z-30 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-800">
              Ajustes rápidos
            </h4>
            <button
              onClick={() => setShowQuickSettings(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Tamaño del temporizador
              </p>
              <div className="flex gap-1">
                {Object.keys(TIMER_CLS).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSetting("timerSize", size)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize"
                    style={{
                      backgroundColor:
                        settings.timerSize === size
                          ? momentColor
                          : "transparent",
                      color: settings.timerSize === size ? "white" : "#64748b",
                      borderColor:
                        settings.timerSize === size ? momentColor : "#e2e8f0",
                    }}
                  >
                    {size === "grande" ? "G" : size === "gigante" ? "GG" : "P"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">
                Notas docentes
              </span>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="relative w-10 h-5 rounded-full transition-all"
                style={{ backgroundColor: showNotes ? momentColor : "#e2e8f0" }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                  style={{
                    transform: showNotes ? "translateX(20px)" : "translateX(0)",
                  }}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">
                Silencio
              </span>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="relative w-10 h-5 rounded-full transition-all"
                style={{ backgroundColor: isMuted ? "#ef4444" : "#e2e8f0" }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                  style={{
                    transform: isMuted ? "translateX(20px)" : "translateX(0)",
                  }}
                />
              </button>
            </div>
            <a
              href="/settings"
              className="flex items-center gap-2 text-xs text-blue-600 hover:underline font-semibold"
            >
              <Settings2 size={12} /> Ir a configuración completa →
            </a>
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: timer + controls */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 space-y-6">
          {/* Moment badge */}
          <div
            className="flex items-center gap-2.5 px-4 py-2 rounded-full text-white text-sm font-semibold shadow-sm"
            style={{ backgroundColor: momentColor }}
          >
            <div className="w-2 h-2 rounded-full bg-white/60" />
            {currentMoment?.name}
            <span className="text-white/60 text-xs font-normal">
              {currentMomentIdx + 1}/{session.moments.length}
            </span>
          </div>

          {/* Activity name */}
          <div className="text-center space-y-1 max-w-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
              {currentSub?.name}
            </h2>
            {currentSub?.description && (
              <p className="text-slate-500 text-sm">{currentSub.description}</p>
            )}
          </div>

          {/* BIG TIMER — size driven by settings */}
          <div
            className={`${timerClass} font-mono font-black leading-none tabular-nums transition-colors ${isEnding ? "text-orange-500" : isDone ? "text-emerald-600" : "text-slate-800"}`}
          >
            {formatTime(timeLeft)}
          </div>

          {/* Sub progress bar */}
          <div className="w-full max-w-md space-y-1">
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${subProgress}%`,
                  backgroundColor: momentColor,
                }}
              />
            </div>
            {isEnding && (
              <p className="text-center text-orange-500 text-sm font-semibold">
                ⏰ Preparando cierre del momento...
              </p>
            )}
            {isDone && (
              <p className="text-center text-emerald-600 text-sm font-bold">
                ✅ Momento completado. Presiona Avanzar.
              </p>
            )}
          </div>

          {/* Control buttons */}
          <div className="flex flex-col items-center gap-4 w-full max-w-md">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={goBack}
                className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                title="Retroceder"
              >
                <SkipBack size={20} />
              </button>
              <button
                onClick={() => setIsActive(!isActive)}
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white transition-all shadow-lg hover:shadow-xl active:scale-95"
                style={{ backgroundColor: isActive ? "#F97316" : momentColor }}
              >
                {isActive ? (
                  <Pause size={34} />
                ) : (
                  <Play size={34} fill="white" className="ml-1" />
                )}
              </button>
              <button
                onClick={advance}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white transition-colors"
                style={{ backgroundColor: momentColor + "CC" }}
                title="Avanzar"
              >
                <SkipForward size={20} />
              </button>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => setTimeLeft((t) => t + 120)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-xs font-semibold transition-colors"
              >
                <Plus size={13} /> 2 min
              </button>
              <button
                onClick={() => setTimeLeft((t) => Math.max(0, t - 60))}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-xs font-semibold transition-colors"
              >
                <Minus size={13} /> 1 min
              </button>
              <button
                onClick={skipSubmoment}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-amber-700 text-xs font-semibold transition-colors"
              >
                <SkipForward size={13} /> Saltar
              </button>
              <button
                onClick={() => setShowObservation(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-lg text-violet-700 text-xs font-semibold transition-colors"
              >
                <MessageSquare size={13} /> Observar
              </button>
            </div>
          </div>

          {/* Next up */}
          {nextSub && (
            <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm max-w-md w-full">
              <ChevronRight size={16} className="text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                  Siguiente
                </p>
                <p className="text-sm font-semibold text-slate-700 truncate">
                  {nextMomentName && (
                    <span className="text-slate-400 mr-1">
                      {nextMomentName} ·
                    </span>
                  )}
                  {nextSub.name}
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 shrink-0">
                {nextSub.duration} min
              </span>
            </div>
          )}
        </div>

        {/* Right panel: notes + overview */}
        <div className="hidden lg:flex flex-col w-72 xl:w-80 border-l border-slate-200 bg-white overflow-y-auto shrink-0">
          {showNotes && currentSub?.teacher_note && (
            <div className="p-4 border-b border-slate-100">
              <p className="text-xs text-amber-600 font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <BookOpen size={12} /> Tu nota
              </p>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                "{currentSub.teacher_note}"
              </p>
            </div>
          )}
          <div className="p-4 border-b border-slate-100">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold">Progreso general</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1.5">
              <span>{completedCount} completados</span>
              <span>{skippedCount} saltados</span>
            </div>
          </div>
          <div className="p-4 space-y-1 flex-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
              Momentos
            </p>
            {session.moments.map((m, mIdx) => {
              const mColor =
                m.color || MOMENT_COLORS[mIdx % MOMENT_COLORS.length];
              const isCurrentM = mIdx === currentMomentIdx;
              const isPastM = mIdx < currentMomentIdx;
              return (
                <div
                  key={m.id || mIdx}
                  className={`px-3 py-2.5 rounded-xl text-sm transition-colors ${isCurrentM ? "bg-slate-50 border border-slate-200" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: mColor,
                        opacity: isPastM ? 0.4 : 1,
                      }}
                    />
                    <span
                      className={`font-medium ${isPastM ? "text-slate-400 line-through" : isCurrentM ? "text-slate-800" : "text-slate-600"}`}
                    >
                      {m.name}
                    </span>
                    {isPastM && (
                      <CheckCircle2
                        size={13}
                        className="text-emerald-500 ml-auto shrink-0"
                      />
                    )}
                  </div>
                  {isCurrentM && (
                    <div className="mt-2 ml-4 space-y-1">
                      {m.submoments.map((sm, sIdx) => (
                        <div
                          key={sm.id || sIdx}
                          className={`text-xs flex items-center gap-1.5 ${sIdx === currentSubIdx ? "font-semibold text-slate-800" : sIdx < currentSubIdx ? "text-slate-400 line-through" : "text-slate-500"}`}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0" />
                          {sm.name}
                          <span className="ml-auto text-slate-400 font-mono">
                            {sm.duration}m
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="p-4 border-t border-slate-100 space-y-2">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {showNotes ? <EyeOff size={14} /> : <Eye size={14} />}
              {showNotes ? "Ocultar notas" : "Mostrar notas"}
            </button>
            <button
              onClick={() => setShowSummary(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <Flag size={14} /> Finalizar sesión
            </button>
          </div>
        </div>
      </div>

      {/* Bottom mobile bar */}
      <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setShowObservation(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200"
          >
            <MessageSquare size={13} /> Anotar
          </button>
          <button
            onClick={() => setShowLateStart(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200"
          >
            <AlertTriangle size={13} /> Tarde
          </button>
          <button
            onClick={() => setProjectorMode(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100"
          >
            <Maximize2 size={13} /> Proyector
          </button>
          <button
            onClick={() => setShowSummary(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 bg-red-50 border border-red-200"
          >
            <Flag size={13} /> Finalizar
          </button>
        </div>
      </div>

      {/* Observation modal */}
      {showObservation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl space-y-4 p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare size={18} className="text-violet-600" />{" "}
                Registrar observación
              </h4>
              <button
                onClick={() => setShowObservation(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <textarea
              autoFocus
              className="w-full h-28 border border-slate-200 rounded-xl p-3 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-violet-500 resize-none placeholder-slate-400"
              placeholder="Ej. Los estudiantes tuvieron dificultad con la lectura..."
              value={observationText}
              onChange={(e) => setObservationText(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowObservation(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveObservation}
                className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Late start modal */}
      {showLateStart && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <AlertTriangle size={20} className="text-amber-500" />{" "}
                ¿Empezaste tarde?
              </h4>
              <button onClick={() => setShowLateStart(false)}>
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <p className="text-slate-500 text-sm">
              CronoAula puede recalcular los tiempos para que termines a tiempo.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                ¿Cuántos minutos llevas de retraso?
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLateMinutes((m) => Math.max(1, m - 1))}
                  className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-slate-800 w-12 text-center">
                  {lateMinutes}
                </span>
                <button
                  onClick={() => setLateMinutes((m) => m + 1)}
                  className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
                >
                  +
                </button>
                <span className="text-slate-500 text-sm">min</span>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => adjustLateStart("proportional")}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors"
              >
                Reducir todos los momentos proporcionalmente
              </button>
              <button
                onClick={() => adjustLateStart("protect")}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors"
              >
                Proteger el Desarrollo, reducir Inicio/Cierre ⭐
              </button>
              <button
                onClick={() => setShowLateStart(false)}
                className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50"
              >
                Mantener tiempos originales
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session summary modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 border border-slate-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} className="text-emerald-600" />
              </div>
              <h4 className="text-xl font-bold text-slate-800">
                ¡Sesión terminada!
              </h4>
              <p className="text-slate-500 text-sm">Resumen de tu clase</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Momentos completados</span>
                <span className="font-bold text-slate-800">
                  {completedCount}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Momentos saltados</span>
                <span className="font-bold text-slate-800">{skippedCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tiempo restante</span>
                <span className="font-bold text-slate-800">
                  {formatTimeHM(totalSessionLeft)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href="/sessions"
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold text-center hover:bg-slate-50"
              >
                Mis sesiones
              </a>
              <a
                href="/"
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold text-center hover:bg-blue-700"
              >
                Ir al inicio
              </a>
            </div>
          </div>
        </div>
      )}

      <style
        jsx
        global
      >{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
