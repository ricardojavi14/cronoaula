"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Flag,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Timer,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getSession, saveSession, updateSubmomentStatus } from "@/utils/localStore";

const COLORS = [
  "#2563EB",
  "#059669",
  "#7C3AED",
  "#D97706",
  "#DC2626",
  "#0891B2",
  "#9333EA",
  "#CA8A04",
];

function toSeconds(minutes = 0) {
  return Math.max(0, Math.round((Number(minutes) || 0) * 60));
}

function formatClock(seconds = 0) {
  const safe = Math.max(0, Math.round(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatMinutes(seconds = 0) {
  const mins = Math.ceil(Math.max(0, seconds) / 60);
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  return `${mins} min`;
}

function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function displayActivityName(name = "") {
  const normalized = normalizeText(name);
  if (
    normalized === "actividades del momento" ||
    normalized === "actividad principal"
  ) {
    return "Actividad de aprendizaje";
  }
  return String(name || "Actividad de aprendizaje").trim();
}

function chooseMostComplete(a = "", b = "") {
  const first = String(a || "").trim();
  const second = String(b || "").trim();
  if (!first) return second;
  if (!second) return first;
  const nf = normalizeText(first);
  const ns = normalizeText(second);
  if (nf === ns) return first.length >= second.length ? first : second;
  if (nf.includes(ns)) return first;
  if (ns.includes(nf)) return second;
  return null;
}

function getActivityParts(moment, submoment) {
  const subDescription = submoment?.description || submoment?.activities || "";
  const momentDescription = moment?.description || moment?.activities || "";
  const description =
    chooseMostComplete(subDescription, momentDescription) ||
    String(subDescription || momentDescription || "").trim();
  const note =
    chooseMostComplete(submoment?.teacher_note, moment?.teacher_note) ||
    String(submoment?.teacher_note || moment?.teacher_note || "").trim();
  const merged = chooseMostComplete(description, note);

  if (merged) return { activity: merged, note: "" };

  return {
    activity: description || note || "",
    note: note || "",
  };
}

function getActivityText(moment, submoment) {
  return getActivityParts(moment, submoment).activity;
}

function getMomentDuration(moment) {
  const subs = Array.isArray(moment?.submoments) ? moment.submoments : [];
  const subTotal = subs.reduce((sum, sm) => sum + (Number(sm.duration) || 0), 0);
  return subTotal || Number(moment?.duration) || 0;
}

function getTotalSeconds(moments = []) {
  return moments.reduce((sum, moment) => sum + toSeconds(getMomentDuration(moment)), 0);
}

function countSubmoments(moments = []) {
  return moments.reduce((sum, moment) => sum + Math.max(1, moment.submoments?.length || 0), 0);
}

function hasLongText(text = "") {
  return String(text).length > 320 || String(text).split("\n").length > 5;
}

export default function ClassModePage({ params }) {
  const { id } = params;
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [workedSeconds, setWorkedSeconds] = useState(0);
  const [currentMomentIdx, setCurrentMomentIdx] = useState(0);
  const [currentSubIdx, setCurrentSubIdx] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [viewMode, setViewMode] = useState("teacher");
  const [projectorMode, setProjectorMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [activityExpanded, setActivityExpanded] = useState(false);
  const [showLateStart, setShowLateStart] = useState(false);
  const [lateMode, setLateMode] = useState("delay");
  const [lateMinutes, setLateMinutes] = useState(10);
  const [remainingMinutesInput, setRemainingMinutesInput] = useState(45);
  const timerRef = useRef(null);

  useEffect(() => {
    try {
      const data = getSession(id);
      if (!data) {
        toast.error("No encontre la sesion en este dispositivo");
        return;
      }
      const normalized = {
        ...data,
        moments: (data.moments || []).map((moment, momentIdx) => ({
          ...moment,
          color: moment.color || COLORS[momentIdx % COLORS.length],
          submoments:
            moment.submoments?.length > 0
              ? moment.submoments
              : [
                  {
                    id: `${moment.id || momentIdx}-main`,
                    name: moment.name || "Actividad de aprendizaje",
                    duration: Number(moment.duration) || 5,
                    description: getActivityText(moment, null),
                    status: "pending",
                  },
                ],
        })),
      };
      setSession(normalized);
      setTimeLeft(toSeconds(normalized.moments?.[0]?.submoments?.[0]?.duration || 0));
      setRemainingMinutesInput(Math.ceil(getTotalSeconds(normalized.moments) / 60));
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar el modo clase");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const moments = session?.moments || [];
  const currentMoment = moments[currentMomentIdx] || {};
  const currentSub = currentMoment.submoments?.[currentSubIdx] || {};
  const nextMoment = moments[currentMomentIdx + 1] || null;
  const nextSub =
    currentMoment.submoments?.[currentSubIdx + 1] ||
    nextMoment?.submoments?.[0] ||
    null;
  const nextMomentLabel =
    currentMoment.submoments?.[currentSubIdx + 1]
      ? currentMoment.name
      : nextMoment?.name;
  const momentColor = currentMoment.color || COLORS[currentMomentIdx % COLORS.length];
  const totalPlannedSeconds = getTotalSeconds(moments);
  const totalSessionLeft = Math.max(0, totalPlannedSeconds - workedSeconds);
  const currentDurationSeconds = toSeconds(currentSub.duration || 0);
  const currentElapsed = Math.max(0, currentDurationSeconds - timeLeft);
  const currentProgress =
    currentDurationSeconds > 0
      ? Math.min(100, (currentElapsed / currentDurationSeconds) * 100)
      : 0;
  const generalProgress =
    totalPlannedSeconds > 0
      ? Math.min(100, (workedSeconds / totalPlannedSeconds) * 100)
      : 0;
  const totalActivities = countSubmoments(moments);
  const activityParts = getActivityParts(currentMoment, currentSub);
  const activityText = activityParts.activity;
  const teacherNote = activityParts.note;
  const currentActivityName = displayActivityName(currentSub.name);
  const isLastActivity =
    currentMomentIdx === moments.length - 1 &&
    currentSubIdx === (currentMoment.submoments?.length || 1) - 1;

  const alertState =
    timeLeft === 0
      ? "done"
      : timeLeft <= 60
        ? "critical"
        : timeLeft <= 300
          ? "soft"
          : "normal";

  useEffect(() => {
    if (!isActive || showSummary) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
      setWorkedSeconds((prev) => Math.min(totalPlannedSeconds, prev + 1));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isActive, showSummary, totalPlannedSeconds]);

  useEffect(() => {
    setActivityExpanded(false);
  }, [currentMomentIdx, currentSubIdx]);

  const saveCurrentStatus = useCallback(
    (status) => {
      if (currentSub?.id) updateSubmomentStatus(id, currentSub.id, status);
    },
    [currentSub?.id, id],
  );

  const goNext = useCallback(() => {
    if (!session) return;
    saveCurrentStatus("completed");
    setCompletedCount((count) => Math.min(totalActivities, count + 1));
    if (currentSubIdx < (currentMoment.submoments?.length || 1) - 1) {
      const next = currentMoment.submoments[currentSubIdx + 1];
      setCurrentSubIdx((idx) => idx + 1);
      setTimeLeft(toSeconds(next.duration || 0));
      setIsActive(false);
      return;
    }
    if (currentMomentIdx < moments.length - 1) {
      const next = moments[currentMomentIdx + 1]?.submoments?.[0];
      setCurrentMomentIdx((idx) => idx + 1);
      setCurrentSubIdx(0);
      setTimeLeft(toSeconds(next?.duration || 0));
      setIsActive(false);
      return;
    }
    setIsActive(false);
    setShowSummary(true);
  }, [
    currentMoment.submoments,
    currentMomentIdx,
    currentSubIdx,
    moments,
    saveCurrentStatus,
    session,
    totalActivities,
  ]);

  const goPrevious = () => {
    if (!session) return;
    setIsActive(false);
    if (currentSubIdx > 0) {
      const prev = currentMoment.submoments[currentSubIdx - 1];
      setCurrentSubIdx((idx) => idx - 1);
      setTimeLeft(toSeconds(prev.duration || 0));
      return;
    }
    if (currentMomentIdx > 0) {
      const prevMoment = moments[currentMomentIdx - 1];
      const prevSubIdx = Math.max(0, (prevMoment.submoments?.length || 1) - 1);
      const prevSub = prevMoment.submoments?.[prevSubIdx];
      setCurrentMomentIdx((idx) => idx - 1);
      setCurrentSubIdx(prevSubIdx);
      setTimeLeft(toSeconds(prevSub?.duration || 0));
    }
  };

  const repeatSession = () => {
    setIsActive(false);
    setShowSummary(false);
    setCurrentMomentIdx(0);
    setCurrentSubIdx(0);
    setWorkedSeconds(0);
    setCompletedCount(0);
    setTimeLeft(toSeconds(moments?.[0]?.submoments?.[0]?.duration || 0));
  };

  const applyLateAdjustment = () => {
    if (!session) return;
    const remaining = moments.slice(currentMomentIdx).map((moment, idx) => ({
      moment,
      absoluteIdx: currentMomentIdx + idx,
    }));
    const remainingSeconds = remaining.reduce((sum, item, idx) => {
      const subs = item.moment.submoments || [];
      const startSub = idx === 0 ? currentSubIdx : 0;
      return (
        sum +
        subs.slice(startSub).reduce((subSum, sub) => subSum + toSeconds(sub.duration || 0), 0)
      );
    }, 0);
    const targetSeconds =
      lateMode === "remaining"
        ? toSeconds(remainingMinutesInput)
        : Math.max(60, remainingSeconds - toSeconds(lateMinutes));
    const factor = remainingSeconds > 0 ? targetSeconds / remainingSeconds : 1;
    const message =
      lateMode === "remaining"
        ? `Redistribuir los momentos restantes en ${remainingMinutesInput} minutos?`
        : `Reducir ${lateMinutes} minutos de los momentos restantes?`;

    if (!confirm(message)) return;

    const nextMoments = moments.map((moment, momentIdx) => {
      if (momentIdx < currentMomentIdx) return moment;
      return {
        ...moment,
        submoments: (moment.submoments || []).map((sub, subIdx) => {
          if (momentIdx === currentMomentIdx && subIdx < currentSubIdx) return sub;
          return {
            ...sub,
            duration: Math.max(1, Math.round((Number(sub.duration) || 1) * factor)),
          };
        }),
      };
    });
    const updated = { ...session, moments: nextMoments };
    setSession(updated);
    saveSession(updated);
    setTimeLeft(toSeconds(nextMoments[currentMomentIdx]?.submoments?.[currentSubIdx]?.duration || 0));
    setShowLateStart(false);
    toast.success("Tiempos restantes redistribuidos");
  };

  if (loading || !session) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-blue-600 border-t-transparent mx-auto animate-spin" />
          <p className="text-sm text-slate-500">Cargando modo clase...</p>
        </div>
      </div>
    );
  }

  const shellClass = projectorMode
    ? "fixed inset-0 z-[100] bg-slate-950 text-white overflow-hidden"
    : "fixed inset-0 z-[100] bg-slate-100 text-slate-900 overflow-hidden";

  if (projectorMode) {
    return (
      <div className={shellClass}>
        <div className="h-full flex flex-col items-center justify-center px-8 py-10 text-center">
          <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
            <button
              onClick={() => setProjectorMode(false)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-bold flex items-center gap-2"
            >
              <Minimize2 size={16} /> Salir de proyector
            </button>
            <div className="text-right">
              <p className="text-white/60 text-sm">{session.area || "Area"} · {session.grade || "Grado"}</p>
              <p className="text-white font-bold">{session.title}</p>
            </div>
          </div>

          <div className="max-w-5xl space-y-7">
            <p className="inline-flex px-5 py-2 rounded-full text-lg font-black bg-white/10 border border-white/15">
              Modo proyector
            </p>
            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              {currentMoment.name}
            </h1>
            {activityText && (
              <div className="space-y-3">
                <p className="text-white/50 text-xl md:text-2xl font-black uppercase tracking-wide">
                  Actividad de aprendizaje
                </p>
                <p className="text-2xl md:text-3xl leading-relaxed text-white/85 max-w-4xl mx-auto line-clamp-6">
                  {activityText}
                </p>
              </div>
            )}
            <div
              className={`font-mono font-black leading-none tracking-tight ${
                alertState === "critical"
                  ? "text-red-300"
                  : alertState === "soft"
                    ? "text-amber-300"
                    : alertState === "done"
                      ? "text-emerald-300"
                      : "text-white"
              } text-[120px] md:text-[190px]`}
            >
              {formatClock(timeLeft)}
            </div>
            <ProgressBar value={currentProgress} color={momentColor} dark />
          </div>

          <div className="absolute bottom-8 flex flex-wrap justify-center gap-4">
            <ClassButton onClick={goPrevious} icon={<SkipBack size={24} />} label="Anterior" dark />
            <ClassButton
              onClick={() => setIsActive((active) => !active)}
              icon={isActive ? <Pause size={28} /> : <Play size={28} />}
              label={isActive ? "Pausar" : timeLeft < currentDurationSeconds ? "Continuar" : "Iniciar"}
              primary
              dark
            />
            <ClassButton onClick={goNext} icon={<SkipForward size={24} />} label="Siguiente" dark />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100 overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <a href="/sessions" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
            <ArrowLeft size={20} />
          </a>
          <div className="min-w-0">
            <h1 className="font-black text-slate-900 truncate">{session.title}</h1>
            <p className="text-xs text-slate-500 truncate">
              {session.area || "Area sin registrar"} · {session.grade || "Grado sin registrar"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle active={viewMode === "teacher"} onClick={() => setViewMode("teacher")} icon={<BookOpen size={15} />} label="Vista docente" />
          <ModeToggle active={viewMode === "class"} onClick={() => setViewMode("class")} icon={<Eye size={15} />} label="Vista de clase" />
          <ModeToggle active={focusMode} onClick={() => setFocusMode((v) => !v)} icon={focusMode ? <EyeOff size={15} /> : <Eye size={15} />} label="Sin distracciones" />
          <ModeToggle onClick={() => setProjectorMode(true)} icon={<Maximize2 size={15} />} label="Modo proyector" />
          <button
            onClick={() => setShowLateStart(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold hover:bg-amber-100"
          >
            <AlertTriangle size={14} /> <span className="hidden sm:inline">Empece tarde</span>
          </button>
        </div>
      </header>

      <main className="h-[calc(100vh-4rem)] overflow-y-auto">
        {viewMode === "teacher" ? (
          <TeacherView
            session={session}
            moments={moments}
            focusMode={focusMode}
            currentMoment={currentMoment}
            currentMomentIdx={currentMomentIdx}
            currentSub={currentSub}
            currentSubIdx={currentSubIdx}
            currentActivityName={currentActivityName}
            activityText={activityText}
            teacherNote={teacherNote}
            activityExpanded={activityExpanded}
            setActivityExpanded={setActivityExpanded}
            alertState={alertState}
            momentColor={momentColor}
            timeLeft={timeLeft}
            totalSessionLeft={totalSessionLeft}
            currentProgress={currentProgress}
            generalProgress={generalProgress}
            currentDurationSeconds={currentDurationSeconds}
            isActive={isActive}
            setIsActive={setIsActive}
            goPrevious={goPrevious}
            goNext={goNext}
            setShowSummary={setShowSummary}
            nextSub={nextSub}
            nextMomentLabel={nextMomentLabel}
            isLastActivity={isLastActivity}
          />
        ) : (
          <ClassView
            session={session}
            currentMoment={currentMoment}
            currentMomentIdx={currentMomentIdx}
            moments={moments}
            currentActivityName={currentActivityName}
            activityText={activityText}
            activityExpanded={activityExpanded}
            setActivityExpanded={setActivityExpanded}
            alertState={alertState}
            momentColor={momentColor}
            timeLeft={timeLeft}
            totalSessionLeft={totalSessionLeft}
            currentProgress={currentProgress}
            generalProgress={generalProgress}
            currentDurationSeconds={currentDurationSeconds}
            isActive={isActive}
            setIsActive={setIsActive}
            goPrevious={goPrevious}
            goNext={goNext}
            setShowSummary={setShowSummary}
            nextSub={nextSub}
            nextMomentLabel={nextMomentLabel}
            isLastActivity={isLastActivity}
            focusMode={focusMode}
          />
        )}
      </main>

      {showLateStart && (
        <LateStartModal
          lateMode={lateMode}
          setLateMode={setLateMode}
          lateMinutes={lateMinutes}
          setLateMinutes={setLateMinutes}
          remainingMinutesInput={remainingMinutesInput}
          setRemainingMinutesInput={setRemainingMinutesInput}
          onClose={() => setShowLateStart(false)}
          onApply={applyLateAdjustment}
        />
      )}

      {showSummary && (
        <SummaryModal
          session={session}
          plannedSeconds={totalPlannedSeconds}
          workedSeconds={workedSeconds}
          completedCount={completedCount}
          totalActivities={totalActivities}
          onRepeat={repeatSession}
        />
      )}
    </div>
  );
}

function StatusBadge({ alertState }) {
  const config = {
    normal: ["bg-blue-50 text-blue-700 border-blue-200", "En desarrollo"],
    soft: ["bg-amber-50 text-amber-700 border-amber-200", "Quedan 5 min o menos"],
    critical: ["bg-red-50 text-red-700 border-red-200", "Queda 1 min o menos"],
    done: ["bg-emerald-50 text-emerald-700 border-emerald-200", "Momento finalizado"],
  }[alertState];
  return (
    <div className={`px-3 py-2 rounded-xl border text-sm font-black ${config[0]}`}>
      {config[1]}
    </div>
  );
}

function TeacherView({
  moments,
  focusMode,
  currentMoment,
  currentMomentIdx,
  currentSub,
  currentSubIdx,
  currentActivityName,
  activityText,
  teacherNote,
  activityExpanded,
  setActivityExpanded,
  alertState,
  momentColor,
  timeLeft,
  totalSessionLeft,
  currentProgress,
  generalProgress,
  currentDurationSeconds,
  isActive,
  setIsActive,
  goPrevious,
  goNext,
  setShowSummary,
  nextSub,
  nextMomentLabel,
  isLastActivity,
}) {
  return (
    <div className={`grid gap-4 p-4 md:p-5 ${focusMode ? "max-w-5xl mx-auto" : "xl:grid-cols-[1fr_320px] max-w-7xl mx-auto"}`}>
      <section className="min-w-0">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-4 md:p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div className="space-y-2">
              <p className="text-xs font-black text-blue-600 uppercase tracking-wide">
                Vista docente
              </p>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-xs font-black" style={{ backgroundColor: momentColor }}>
                Momento {currentMomentIdx + 1} de {moments.length}
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                {currentMoment.name}
              </h2>
              <p className="text-sm text-slate-500 font-semibold">
                Actividad de aprendizaje
              </p>
            </div>
            <StatusBadge alertState={alertState} />
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-4">
            <ActivityCard
              title={currentActivityName}
              activityText={activityText}
              teacherNote={teacherNote}
              expanded={activityExpanded}
              setExpanded={setActivityExpanded}
              compact
            />
            <TimerCard
              timeLeft={timeLeft}
              totalSessionLeft={totalSessionLeft}
              alertState={alertState}
              compact
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <InfoCard label="Momento" value={formatMinutes(timeLeft)} icon={<Timer size={18} />} compact />
            <InfoCard label="Sesion" value={formatMinutes(totalSessionLeft)} icon={<BookOpen size={18} />} compact />
            <InfoCard label="Momento" value={`${Math.round(currentProgress)}%`} icon={<CheckCircle2 size={18} />} compact />
            <InfoCard label="General" value={`${Math.round(generalProgress)}%`} icon={<Flag size={18} />} compact />
          </div>

          <div className="space-y-2">
            <ProgressHeader label="Progreso del momento" value={currentProgress} />
            <ProgressBar value={currentProgress} color={momentColor} />
            <ProgressHeader label="Progreso general de la sesion" value={generalProgress} />
            <ProgressBar value={generalProgress} color="#2563EB" />
          </div>

          <ControlRow
            isActive={isActive}
            setIsActive={setIsActive}
            currentDurationSeconds={currentDurationSeconds}
            timeLeft={timeLeft}
            goPrevious={goPrevious}
            goNext={goNext}
            setShowSummary={setShowSummary}
          />
        </div>

        {focusMode && (
          <div className="mt-4">
            <NextMomentCard nextSub={nextSub} nextMomentLabel={nextMomentLabel} isLastActivity={isLastActivity} />
          </div>
        )}
      </section>

      {!focusMode && (
        <aside className="space-y-4">
          <NextMomentCard nextSub={nextSub} nextMomentLabel={nextMomentLabel} isLastActivity={isLastActivity} />
          <SessionMap
            moments={moments}
            currentMomentIdx={currentMomentIdx}
            currentSubIdx={currentSubIdx}
          />
        </aside>
      )}
    </div>
  );
}

function ClassView({
  session,
  currentMoment,
  currentMomentIdx,
  moments,
  currentActivityName,
  activityText,
  activityExpanded,
  setActivityExpanded,
  alertState,
  momentColor,
  timeLeft,
  totalSessionLeft,
  currentProgress,
  generalProgress,
  currentDurationSeconds,
  isActive,
  setIsActive,
  goPrevious,
  goNext,
  setShowSummary,
  nextSub,
  nextMomentLabel,
  isLastActivity,
  focusMode,
}) {
  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className={`p-4 md:p-6 ${focusMode ? "max-w-5xl" : "max-w-6xl"} mx-auto`}>
        <section className="rounded-[28px] bg-white/90 border border-white shadow-xl p-5 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs font-black text-blue-600 uppercase tracking-wide">
                Vista de clase
              </p>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mt-2">
                {currentMoment.name}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {session.area || "Area"} · {session.grade || "Grado"} · Momento {currentMomentIdx + 1} de {moments.length}
              </p>
            </div>
            <StatusBadge alertState={alertState} />
          </div>

          <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-stretch">
            <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 md:p-7 space-y-4">
              <p className="text-xs font-black text-blue-700 uppercase tracking-wide">
                Actividad de aprendizaje
              </p>
              <h3 className="text-xl md:text-2xl font-black text-slate-900">
                {currentActivityName}
              </h3>
              <p className={`text-lg md:text-xl leading-relaxed text-slate-800 whitespace-pre-line ${activityExpanded ? "" : "line-clamp-5"}`}>
                {activityText || "Actividad sin descripcion registrada."}
              </p>
              {hasLongText(activityText) && (
                <button
                  onClick={() => setActivityExpanded((v) => !v)}
                  className="px-4 py-2 rounded-xl bg-white border border-blue-100 text-blue-700 text-sm font-black hover:bg-blue-50"
                >
                  {activityExpanded ? "Ver menos" : "Ver completo"}
                </button>
              )}
            </div>

            <TimerCard
              timeLeft={timeLeft}
              totalSessionLeft={totalSessionLeft}
              alertState={alertState}
              large
            />
          </div>

          <div className="space-y-2">
            <ProgressBar value={currentProgress} color={momentColor} />
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Progreso del momento</span>
              <span>{Math.round(currentProgress)}%</span>
            </div>
            <ProgressBar value={generalProgress} color="#2563EB" />
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Progreso de la sesion</span>
              <span>{Math.round(generalProgress)}%</span>
            </div>
          </div>

          <ControlRow
            isActive={isActive}
            setIsActive={setIsActive}
            currentDurationSeconds={currentDurationSeconds}
            timeLeft={timeLeft}
            goPrevious={goPrevious}
            goNext={goNext}
            setShowSummary={setShowSummary}
          />
        </section>

        {!focusMode && (
          <div className="grid md:grid-cols-[1fr_1.4fr] gap-4 mt-4">
            <NextMomentCard nextSub={nextSub} nextMomentLabel={nextMomentLabel} isLastActivity={isLastActivity} />
            <CompactMomentStrip moments={moments} currentMomentIdx={currentMomentIdx} />
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityCard({
  title,
  activityText,
  teacherNote,
  expanded,
  setExpanded,
  compact,
}) {
  return (
    <div className={`rounded-2xl bg-slate-50 border border-slate-200 ${compact ? "p-4" : "p-5"} space-y-3`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-slate-900">{title}</h3>
        {hasLongText(activityText) && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 shrink-0"
          >
            {expanded ? "Ver menos" : "Ver completo"}
          </button>
        )}
      </div>
      <p className={`text-[15px] leading-relaxed text-slate-800 whitespace-pre-line ${expanded ? "" : "line-clamp-5"}`}>
        {activityText || "No hay descripcion registrada para esta actividad. Puedes continuar con la guia de momentos."}
      </p>
      {teacherNote && (
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
          <p className="text-[11px] font-black uppercase tracking-wide text-amber-700 mb-1">
            Nota docente
          </p>
          <p className="text-sm leading-relaxed text-amber-900 whitespace-pre-line">
            {teacherNote}
          </p>
        </div>
      )}
    </div>
  );
}

function TimerCard({ timeLeft, totalSessionLeft, alertState, compact, large }) {
  return (
    <div className={`rounded-3xl bg-slate-950 text-white ${compact ? "p-5" : "p-6"} flex flex-col items-center justify-center min-h-[220px]`}>
      <p className="text-white/60 text-sm font-bold uppercase tracking-wide mb-2">
        Tiempo del momento
      </p>
      <div
        className={`font-mono font-black leading-none tracking-tight ${
          large ? "text-[96px] md:text-[150px]" : "text-[82px] md:text-[116px]"
        } ${
          alertState === "critical"
            ? "text-red-300"
            : alertState === "soft"
              ? "text-amber-300"
              : alertState === "done"
                ? "text-emerald-300"
                : "text-white"
        }`}
      >
        {formatClock(timeLeft)}
      </div>
      <p className="mt-3 text-white/70 text-sm">
        Total restante: {formatMinutes(totalSessionLeft)}
      </p>
    </div>
  );
}

function ControlRow({
  isActive,
  setIsActive,
  currentDurationSeconds,
  timeLeft,
  goPrevious,
  goNext,
  setShowSummary,
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-1">
      <ClassButton onClick={goPrevious} icon={<SkipBack size={20} />} label="Anterior" />
      <ClassButton
        onClick={() => setIsActive((active) => !active)}
        icon={isActive ? <Pause size={22} /> : <Play size={22} />}
        label={isActive ? "Pausar" : timeLeft < currentDurationSeconds ? "Continuar" : "Iniciar"}
        primary
        className="col-span-2 md:col-span-2"
      />
      <ClassButton onClick={goNext} icon={<SkipForward size={20} />} label="Siguiente" />
      <ClassButton onClick={() => setShowSummary(true)} icon={<Flag size={20} />} label="Finalizar sesion" danger className="col-span-2" />
    </div>
  );
}

function SessionMap({ moments, currentMomentIdx, currentSubIdx }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
      <h3 className="font-black text-slate-900">Mapa de la sesion</h3>
      <div className="space-y-2">
        {moments.map((moment, momentIdx) => (
          <div
            key={moment.id || momentIdx}
            className={`rounded-xl border p-3 ${
              momentIdx === currentMomentIdx
                ? "bg-blue-50 border-blue-200"
                : momentIdx < currentMomentIdx
                  ? "bg-emerald-50 border-emerald-100"
                  : momentIdx === currentMomentIdx + 1
                    ? "bg-amber-50 border-amber-100"
                    : "bg-white border-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: moment.color || COLORS[momentIdx % COLORS.length] }} />
              <p className="text-sm font-bold text-slate-800 flex-1">{moment.name}</p>
              {momentIdx < currentMomentIdx && <span className="text-[10px] font-black text-emerald-700">Hecho</span>}
              {momentIdx === currentMomentIdx + 1 && <span className="text-[10px] font-black text-amber-700">Sigue</span>}
              <span className="text-xs font-mono text-slate-400">{getMomentDuration(moment)}m</span>
            </div>
            {momentIdx === currentMomentIdx && (
              <div className="mt-2 ml-4 space-y-1">
                {(moment.submoments || []).map((sub, subIdx) => (
                  <p
                    key={sub.id || subIdx}
                    className={`text-xs ${subIdx === currentSubIdx ? "font-bold text-blue-700" : "text-slate-500"}`}
                  >
                    {subIdx + 1}. {displayActivityName(sub.name)}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CompactMomentStrip({ moments, currentMomentIdx }) {
  return (
    <div className="bg-white/90 border border-white rounded-2xl shadow-sm p-4">
      <p className="text-xs font-black text-slate-400 uppercase tracking-wide mb-3">
        Ruta de la sesion
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {moments.map((moment, idx) => (
          <div
            key={moment.id || idx}
            className={`rounded-xl border px-3 py-2 ${
              idx === currentMomentIdx
                ? "bg-blue-600 text-white border-blue-600"
                : idx < currentMomentIdx
                  ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                  : "bg-white text-slate-700 border-slate-100"
            }`}
          >
            <p className="text-sm font-black truncate">{moment.name}</p>
            <p className={`text-xs ${idx === currentMomentIdx ? "text-white/70" : "text-slate-400"}`}>
              {getMomentDuration(moment)} min
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressHeader({ label, value }) {
  return (
    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
      <span>{label}</span>
      <span>{Math.round(value)}%</span>
    </div>
  );
}

function ProgressBar({ value, color, dark = false }) {
  return (
    <div className={`h-3 rounded-full overflow-hidden ${dark ? "bg-white/15" : "bg-slate-200"}`}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }}
      />
    </div>
  );
}

function InfoCard({ label, value, icon, compact = false }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-slate-50 ${compact ? "p-3" : "p-4"}`}>
      <div className={`flex items-center gap-2 text-slate-400 ${compact ? "mb-1" : "mb-2"}`}>{icon}</div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`${compact ? "text-base" : "text-lg"} font-black text-slate-900`}>{value}</p>
    </div>
  );
}

function ClassButton({ onClick, icon, label, primary, danger, dark, className = "" }) {
  const cls = primary
    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
    : danger
      ? "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
      : dark
        ? "bg-white/10 hover:bg-white/15 text-white border-white/15"
        : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200";
  return (
    <button
      onClick={onClick}
      className={`min-h-14 px-4 py-3 rounded-2xl border flex items-center justify-center gap-2 text-sm md:text-base font-black shadow-sm active:scale-[0.99] transition ${cls} ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}

function ModeToggle({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold ${
        active
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

function NextMomentCard({ nextSub, nextMomentLabel, isLastActivity }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
      <p className="text-xs font-black text-slate-400 uppercase tracking-wide mb-2">
        Proximo momento
      </p>
      {nextSub ? (
        <div className="flex items-start gap-3">
          <ChevronRight className="text-blue-600 shrink-0 mt-1" size={18} />
          <div className="min-w-0">
            <h3 className="font-black text-slate-900">{nextMomentLabel || "Siguiente actividad"}</h3>
            <p className="text-sm text-slate-600 mt-0.5">{nextSub.name}</p>
            <p className="text-xs text-slate-400 mt-1">{nextSub.duration || 0} min</p>
          </div>
        </div>
      ) : (
        <p className="text-sm font-bold text-emerald-700">
          {isLastActivity ? "Ultimo momento de la sesion" : "No hay siguiente momento"}
        </p>
      )}
    </div>
  );
}

function LateStartModal({
  lateMode,
  setLateMode,
  lateMinutes,
  setLateMinutes,
  remainingMinutesInput,
  setRemainingMinutesInput,
  onClose,
  onApply,
}) {
  return (
    <div className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={20} /> Empece tarde
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-slate-500">
          Redistribuye proporcionalmente el tiempo de las actividades que faltan.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setLateMode("delay")}
            className={`py-2.5 rounded-xl border text-sm font-bold ${lateMode === "delay" ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 text-slate-600"}`}
          >
            Retraso
          </button>
          <button
            onClick={() => setLateMode("remaining")}
            className={`py-2.5 rounded-xl border text-sm font-bold ${lateMode === "remaining" ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 text-slate-600"}`}
          >
            Tiempo real restante
          </button>
        </div>
        {lateMode === "delay" ? (
          <NumberField label="Minutos de retraso" value={lateMinutes} onChange={setLateMinutes} />
        ) : (
          <NumberField label="Minutos que quedan realmente" value={remainingMinutesInput} onChange={setRemainingMinutesInput} />
        )}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold">
            Cancelar
          </button>
          <button onClick={onApply} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700">
            Aplicar ajuste
          </button>
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <input
        type="number"
        min="1"
        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-lg font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-400"
        value={value}
        onChange={(e) => onChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
      />
    </label>
  );
}

function SummaryModal({ session, plannedSeconds, workedSeconds, completedCount, totalActivities, onRepeat }) {
  return (
    <div className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="text-emerald-600" size={28} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Sesion finalizada</h2>
          <p className="text-sm text-slate-500">Resumen del trabajo en aula</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InfoCard label="Planificado" value={formatMinutes(plannedSeconds)} icon={<Timer size={18} />} />
          <InfoCard label="Trabajado" value={formatMinutes(workedSeconds)} icon={<Play size={18} />} />
          <InfoCard label="Completados" value={`${completedCount}/${totalActivities}`} icon={<CheckCircle2 size={18} />} />
          <InfoCard label="Sesion" value={session.area || "Clase"} icon={<BookOpen size={18} />} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <a href="/sessions" className="py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-center hover:bg-slate-50">
            Mis sesiones
          </a>
          <button onClick={onRepeat} className="py-3 rounded-xl border border-blue-200 text-blue-700 font-bold hover:bg-blue-50 flex items-center justify-center gap-2">
            <RotateCcw size={16} /> Repetir
          </button>
          <a href={`/create?id=${session.id}`} className="py-3 rounded-xl bg-blue-600 text-white font-black text-center hover:bg-blue-700">
            Editar sesion
          </a>
        </div>
      </div>
    </div>
  );
}
