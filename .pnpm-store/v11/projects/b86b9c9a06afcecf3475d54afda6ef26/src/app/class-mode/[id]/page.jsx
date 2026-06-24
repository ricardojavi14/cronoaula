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
  X,
} from "lucide-react";
import { toast } from "sonner";
import { resolveTheme, useAppSettings } from "@/context/AppSettingsContext";
import { clearTestDraftSession, getEditorReturnState, getSession, saveSession, updateSubmomentStatus } from "@/utils/localStore";

const COLORS = ["#22C55E", "#38BDF8", "#A78BFA", "#F59E0B", "#F43F5E"];
const TEST_SPEEDS = [
  { value: 1, label: "Tiempo real x1" },
  { value: 5, label: "Rápido x5" },
  { value: 10, label: "Muy rápido x10" },
  { value: 30, label: "Demo x30" },
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
  if (normalized === "actividades del momento" || normalized === "actividad principal") {
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
  return { activity: description || note || "", note: note || "" };
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

function getValidMomentIndexes(moments = []) {
  return moments
    .map((moment, idx) => ({ idx, duration: getMomentDuration(moment), name: normalizeText(moment?.name) }))
    .filter(({ duration, name }) => duration > 0 && name !== "actividades permanentes")
    .map(({ idx }) => idx);
}

function countSubmoments(moments = []) {
  return moments.reduce((sum, moment) => sum + Math.max(1, moment.submoments?.length || 0), 0);
}

function hasLongText(text = "") {
  return String(text).length > 300 || String(text).split("\n").length > 5;
}

function readableText(hex = "#2563EB") {
  const clean = String(hex).replace("#", "");
  if (clean.length !== 6) return "#FFFFFF";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#0F172A" : "#FFFFFF";
}

function getFontSize(settings) {
  if (settings.fontSize === "gigante") return "20px";
  if (settings.fontSize === "grande") return "17px";
  return "15px";
}

function getTimerClass(timerSize, large = false) {
  if (timerSize === "gigante") {
    return large ? "text-[74px] sm:text-[112px] lg:text-[142px]" : "text-[68px] sm:text-[104px]";
  }
  return large ? "text-[66px] sm:text-[98px] lg:text-[126px]" : "text-[60px] sm:text-[92px]";
}

function getClassModeTheme(settings) {
  const theme = resolveTheme({
    ...settings,
    theme: settings.highContrastMode ? "contraste" : settings.darkModeInClass ? "oscuro" : settings.theme,
  });
  return {
    key: settings.theme || "oscuro",
    bg: theme.bg,
    text: theme.text,
    muted: theme.textMuted,
    panel: theme.card,
    panelStrong: theme.elevated,
    border: theme.border,
    softBorder: theme.border,
    progressBg: theme.accentSoft,
    glow: theme.glow,
  };
}

function getUrgency(timeLeft, durationSeconds) {
  if (timeLeft <= 60 || timeLeft === 0) {
    return { key: "critical", color: "#EF4444", label: timeLeft === 0 ? "Momento finalizado" : "Tiempo crítico" };
  }
  if (timeLeft <= 300 || timeLeft <= durationSeconds * 0.3) {
    return { key: "medium", color: "#F59E0B", label: "Tiempo medio" };
  }
  return { key: "comfort", color: "#22C55E", label: "Tiempo cómodo" };
}

export default function ClassModePage({ params }) {
  const { id } = params;
  const { settings, setSettings } = useAppSettings();
  const resolvedTheme = resolveTheme(settings);
  const accent = resolvedTheme.accent || "#38BDF8";
  const onAccent = resolvedTheme.onAccent || readableText(accent);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [workedSeconds, setWorkedSeconds] = useState(0);
  const [currentMomentIdx, setCurrentMomentIdx] = useState(0);
  const [currentSubIdx, setCurrentSubIdx] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [viewMode, setViewMode] = useState(settings.defaultClassView === "class" ? "class" : "teacher");
  const [focusMode, setFocusMode] = useState(Boolean(settings.distractionFree));
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [activityExpanded, setActivityExpanded] = useState(false);
  const [showLateStart, setShowLateStart] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(Number(settings.testSpeed) || 10);
  const [testScope, setTestScope] = useState("session");
  const [showPrepare, setShowPrepare] = useState(false);
  const [prepareFullscreen, setPrepareFullscreen] = useState(Boolean(settings.prepareFullscreen));
  const [lateMode, setLateMode] = useState("delay");
  const [lateMinutes, setLateMinutes] = useState(10);
  const [remainingMinutesInput, setRemainingMinutesInput] = useState(45);
  const timerRef = useRef(null);
  const previousTimeRef = useRef(0);

  useEffect(() => {
    try {
      const search = new URLSearchParams(window.location.search);
      const isTest = search.get("test") === "1";
      const speed = Number(search.get("speed") || settings.testSpeed || 10);
      const startMoment = Math.max(0, Number(search.get("moment") || 0));
      const data = getSession(id);
      if (!data) {
        toast.error(id === "draft" ? "No encontré el borrador de prueba" : "No encontré la sesión en este dispositivo");
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
      const validIndexes = getValidMomentIndexes(normalized.moments || []);
      const requestedScope = search.get("scope") === "moment" ? "moment" : "session";
      const defaultMoment = validIndexes.includes(startMoment) ? startMoment : validIndexes[0] || 0;
      const safeMoment = validIndexes.includes(startMoment) ? startMoment : defaultMoment;
      if (isTest && requestedScope === "moment" && !validIndexes.includes(startMoment)) {
        toast.error("Ese momento no tiene tiempo asignado. Iniciaré en el primer momento válido.");
      }
      setTestMode(isTest);
      setSimulationSpeed([1, 5, 10, 30].includes(speed) ? speed : 10);
      setTestScope(requestedScope);
      setCurrentMomentIdx(safeMoment);
      setCurrentSubIdx(0);
      setTimeLeft(toSeconds(normalized.moments?.[safeMoment]?.submoments?.[0]?.duration || 0));
      setRemainingMinutesInput(Math.ceil(getTotalSeconds(normalized.moments) / 60));
      setShowPrepare(true);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar el modo clase");
    } finally {
      setLoading(false);
    }
  }, [id, settings.testSpeed]);

  const moments = session?.moments || [];
  const currentMoment = moments[currentMomentIdx] || {};
  const currentSub = currentMoment.submoments?.[currentSubIdx] || {};
  const nextMoment = moments[currentMomentIdx + 1] || null;
  const nextSub = currentMoment.submoments?.[currentSubIdx + 1] || nextMoment?.submoments?.[0] || null;
  const nextMomentLabel = currentMoment.submoments?.[currentSubIdx + 1] ? currentMoment.name : nextMoment?.name;
  const totalPlannedSeconds = getTotalSeconds(moments);
  const totalSessionLeft = Math.max(0, totalPlannedSeconds - workedSeconds);
  const currentDurationSeconds = toSeconds(currentSub.duration || 0);
  const currentElapsed = Math.max(0, currentDurationSeconds - timeLeft);
  const currentProgress = currentDurationSeconds > 0 ? Math.min(100, (currentElapsed / currentDurationSeconds) * 100) : 0;
  const generalProgress = totalPlannedSeconds > 0 ? Math.min(100, (workedSeconds / totalPlannedSeconds) * 100) : 0;
  const totalActivities = countSubmoments(moments);
  const activityParts = getActivityParts(currentMoment, currentSub);
  const activityText = activityParts.activity;
  const teacherNote = activityParts.note;
  const currentActivityName = displayActivityName(currentSub.name);
  const isLastActivity =
    currentMomentIdx === moments.length - 1 &&
    currentSubIdx === (currentMoment.submoments?.length || 1) - 1;
  const urgency = getUrgency(timeLeft, currentDurationSeconds);
  const classTheme = getClassModeTheme(settings);

  useEffect(() => {
    if (!isActive || showSummary) return;
    timerRef.current = setInterval(() => {
      const step = testMode ? simulationSpeed : 1;
      setTimeLeft((prev) => {
        if (prev <= step) {
          setIsActive(false);
          return 0;
        }
        return prev - step;
      });
      setWorkedSeconds((prev) => Math.min(totalPlannedSeconds, prev + step));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isActive, showSummary, simulationSpeed, testMode, totalPlannedSeconds]);

  useEffect(() => setActivityExpanded(false), [currentMomentIdx, currentSubIdx]);

  useEffect(() => {
    previousTimeRef.current = toSeconds(currentSub.duration || 0);
  }, [currentMomentIdx, currentSubIdx, currentSub.duration]);

  const playAlertTone = useCallback((kind = "soft") => {
    if (settings.muteAll || !settings.soundAlerts || typeof window === "undefined") return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = kind === "critical" ? "square" : "sine";
      oscillator.frequency.value = kind === "critical" ? 880 : 520;
      gain.gain.value = settings.alertVolume === "bajo" ? 0.035 : 0.07;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.12);
    } catch (error) {}
  }, [settings.alertVolume, settings.muteAll, settings.soundAlerts]);

  useEffect(() => {
    if (!isActive) {
      previousTimeRef.current = timeLeft;
      return;
    }
    const previous = previousTimeRef.current;
    if (settings.earlyAlert && previous > 300 && timeLeft <= 300) playAlertTone("soft");
    if (previous > 60 && timeLeft <= 60) playAlertTone("critical");
    if (settings.beepLast15 && previous > 15 && timeLeft <= 15) playAlertTone("critical");
    previousTimeRef.current = timeLeft;
  }, [isActive, playAlertTone, settings.beepLast15, settings.earlyAlert, timeLeft]);

  useEffect(() => {
    setViewMode(settings.defaultClassView === "class" ? "class" : "teacher");
  }, [settings.defaultClassView]);

  useEffect(() => {
    setFocusMode(Boolean(settings.distractionFree));
  }, [settings.distractionFree]);

  useEffect(() => {
    const onChange = () => setFullscreenMode(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const saveCurrentStatus = useCallback(
    (status) => {
      if (testMode) return;
      if (currentSub?.id) updateSubmomentStatus(id, currentSub.id, status);
    },
    [currentSub?.id, id, testMode],
  );

  const goNext = useCallback((options = {}) => {
    if (!session) return;
    saveCurrentStatus("completed");
    setCompletedCount((count) => Math.min(totalActivities, count + 1));
    if (currentSubIdx < (currentMoment.submoments?.length || 1) - 1) {
      const next = currentMoment.submoments[currentSubIdx + 1];
      setCurrentSubIdx((idx) => idx + 1);
      setTimeLeft(toSeconds(next.duration || 0));
      setIsActive(Boolean(options.keepPlaying));
      return;
    }
    if (currentMomentIdx < moments.length - 1) {
      const next = moments[currentMomentIdx + 1]?.submoments?.[0];
      setCurrentMomentIdx((idx) => idx + 1);
      setCurrentSubIdx(0);
      setTimeLeft(toSeconds(next?.duration || 0));
      setIsActive(Boolean(options.keepPlaying));
      return;
    }
    setIsActive(false);
    setShowSummary(true);
  }, [currentMoment.submoments, currentMomentIdx, currentSubIdx, moments, saveCurrentStatus, session, totalActivities]);

  useEffect(() => {
    if (timeLeft !== 0 || showSummary || !session) return;
    if (testScope === "moment") {
      setIsActive(false);
      return;
    }
    if (settings.autoAdvanceMoments && !settings.pauseAtMomentEnd && !isLastActivity) {
      window.setTimeout(() => goNext({ keepPlaying: true }), 150);
    }
  }, [
    goNext,
    isLastActivity,
    session,
    settings.autoAdvanceMoments,
    settings.pauseAtMomentEnd,
    showSummary,
    testMode,
    testScope,
    timeLeft,
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

  const restartCurrentMoment = () => {
    setIsActive(false);
    setTimeLeft(toSeconds(currentSub.duration || 0));
  };

  const jumpToSeconds = (seconds) => {
    setTimeLeft(Math.min(toSeconds(currentSub.duration || 0), seconds));
    setIsActive(false);
  };

  const finishCurrentMoment = () => {
    setTimeLeft(0);
    setIsActive(false);
  };

  const startTestMode = () => {
    if (getMomentDuration(moments[currentMomentIdx]) <= 0) {
      toast.error("Elige un momento con duración mayor que 0 para iniciar la prueba.");
      return;
    }
    setSettings({ testSpeed: simulationSpeed, prepareFullscreen });
    setTestMode(true);
    setShowPrepare(false);
    setIsActive(true);
    window.history.replaceState(null, "", `/class-mode/${id}?test=1&speed=${simulationSpeed}&moment=${currentMomentIdx}&scope=${testScope}`);
  };

  const startRealSession = async () => {
    setSettings({ prepareFullscreen });
    setShowPrepare(false);
    if (prepareFullscreen && !document.fullscreenElement) await toggleFullscreen();
  };

  const exitTestMode = () => {
    if (id === "draft") {
      clearTestDraftSession();
      const state = getEditorReturnState();
      window.location.href = `${state?.url || "/create"}${String(state?.url || "").includes("?") ? "&" : "?"}fromTest=1`;
      return;
    }
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/sessions";
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo activar pantalla completa");
    }
  };

  const applyLateAdjustment = () => {
    if (!session) return;
    const remaining = moments.slice(currentMomentIdx).map((moment, idx) => ({ moment, absoluteIdx: currentMomentIdx + idx }));
    const remainingSeconds = remaining.reduce((sum, item, idx) => {
      const subs = item.moment.submoments || [];
      const startSub = idx === 0 ? currentSubIdx : 0;
      return sum + subs.slice(startSub).reduce((subSum, sub) => subSum + toSeconds(sub.duration || 0), 0);
    }, 0);
    const targetSeconds =
      lateMode === "remaining"
        ? toSeconds(remainingMinutesInput)
        : Math.max(60, remainingSeconds - toSeconds(lateMinutes));
    const factor = remainingSeconds > 0 ? targetSeconds / remainingSeconds : 1;
    const message =
      lateMode === "remaining"
        ? `Â¿Redistribuir los momentos restantes en ${remainingMinutesInput} minutos?`
        : `Â¿Reducir ${lateMinutes} minutos de los momentos restantes?`;

    if (!confirm(message)) return;

    const nextMoments = moments.map((moment, momentIdx) => {
      if (momentIdx < currentMomentIdx) return moment;
      return {
        ...moment,
        submoments: (moment.submoments || []).map((sub, subIdx) => {
          if (momentIdx === currentMomentIdx && subIdx < currentSubIdx) return sub;
          return { ...sub, duration: Math.max(1, Math.round((Number(sub.duration) || 1) * factor)) };
        }),
      };
    });
    const updated = { ...session, moments: nextMoments };
    setSession(updated);
    if (!testMode) saveSession(updated);
    setTimeLeft(toSeconds(nextMoments[currentMomentIdx]?.submoments?.[currentSubIdx]?.duration || 0));
    setShowLateStart(false);
    toast.success("Tiempos restantes redistribuidos");
  };

  if (loading || !session) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-300 border-t-transparent mx-auto animate-spin" />
          <p className="text-sm text-slate-400">Cargando modo clase...</p>
        </div>
      </div>
    );
  }

  const shellVars = {
    "--ca-accent": accent,
    "--ca-on-accent": onAccent,
    "--ca-urgency": urgency.color,
    "--cm-bg": classTheme.bg,
    "--cm-text": classTheme.text,
    "--cm-muted": classTheme.muted,
    "--cm-panel": classTheme.panel,
    "--cm-panel-strong": classTheme.panelStrong,
    "--cm-border": classTheme.border,
    "--cm-soft-border": classTheme.softBorder,
    "--cm-progress-bg": classTheme.progressBg,
    fontSize: getFontSize(settings),
    backgroundColor: classTheme.bg,
    color: classTheme.text,
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden" style={shellVars}>
      <div className="absolute inset-0" style={{ background: classTheme.glow }} />
      <div className="relative flex h-full flex-col">
        <TopBar
          session={session}
          viewMode={viewMode}
          setViewMode={setViewMode}
          focusMode={focusMode}
          setFocusMode={setFocusMode}
          fullscreenMode={fullscreenMode}
          toggleFullscreen={toggleFullscreen}
          setShowLateStart={setShowLateStart}
          testMode={testMode}
        />

        <main className={`min-h-0 flex-1 px-3 py-2 md:px-5 md:py-3 ${viewMode === "class" ? "overflow-hidden" : "overflow-y-auto"}`}>
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
              urgency={urgency}
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
              timerSize={settings.timerSize}
              testMode={testMode}
              testScope={testScope}
            />
          ) : (
            <ClassView
              session={session}
              moments={moments}
              focusMode={focusMode}
              currentMoment={currentMoment}
              currentMomentIdx={currentMomentIdx}
              currentActivityName={currentActivityName}
              activityText={activityText}
              activityExpanded={activityExpanded}
              setActivityExpanded={setActivityExpanded}
              urgency={urgency}
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
              timerSize={settings.timerSize}
              testMode={testMode}
              testScope={testScope}
            />
          )}
        </main>
        {testMode && !showPrepare && (
          <TestPanel
            speed={simulationSpeed}
            restartCurrentMoment={restartCurrentMoment}
            jumpToSeconds={jumpToSeconds}
            finishCurrentMoment={finishCurrentMoment}
            exitTestMode={exitTestMode}
          />
        )}
      </div>

      {showPrepare && (
        <PrepareSessionModal
          session={session}
          settings={settings}
          moments={moments}
          currentMomentIdx={currentMomentIdx}
          setCurrentMomentIdx={setCurrentMomentIdx}
          setCurrentSubIdx={setCurrentSubIdx}
          setTimeLeft={setTimeLeft}
          simulationSpeed={simulationSpeed}
          setSimulationSpeed={setSimulationSpeed}
          prepareFullscreen={prepareFullscreen}
          setPrepareFullscreen={setPrepareFullscreen}
          testMode={testMode}
          testScope={testScope}
          totalPlannedSeconds={totalPlannedSeconds}
          startTestMode={startTestMode}
          startRealSession={startRealSession}
          onCancel={testMode ? exitTestMode : () => setShowPrepare(false)}
        />
      )}

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

function TopBar({
  session,
  viewMode,
  setViewMode,
  focusMode,
  setFocusMode,
  fullscreenMode,
  toggleFullscreen,
  setShowLateStart,
  testMode,
}) {
  return (
    <header
      className="relative z-10 flex min-h-12 items-center justify-between gap-3 border-b px-3 backdrop-blur-xl md:px-5"
      style={{ backgroundColor: "var(--cm-panel-strong)", borderColor: "var(--cm-soft-border)" }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <a
          href="/sessions"
          className="rounded-full border p-1.5 transition hover:brightness-110"
          style={{ backgroundColor: "var(--cm-panel)", borderColor: "var(--cm-border)", color: "var(--cm-muted)" }}
        >
          <ArrowLeft size={18} />
        </a>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-black md:text-base" style={{ color: "var(--cm-text)" }}>{session.title}</h1>
          <p className="truncate text-xs" style={{ color: "var(--cm-muted)" }}>{session.area || "Área sin registrar"} · {session.grade || "Grado sin registrar"}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto">
        {testMode && (
          <span className="inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-black" style={{ backgroundColor: "var(--ca-accent)", color: "var(--ca-on-accent)" }}>
            Prueba
          </span>
        )}
        <ModeButton active={viewMode === "teacher"} onClick={() => setViewMode("teacher")} icon={<BookOpen size={14} />} label="Vista docente" />
        <ModeButton active={viewMode === "class"} onClick={() => setViewMode("class")} icon={<Eye size={14} />} label="Modo clase" />
        {!testMode && <ModeButton active={focusMode} onClick={() => setFocusMode((v) => !v)} icon={focusMode ? <EyeOff size={14} /> : <Eye size={14} />} label="Sin distracciones" />}
        <ModeButton active={fullscreenMode} onClick={toggleFullscreen} icon={fullscreenMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />} label="Pantalla completa" />
        {!testMode && (
          <button
            onClick={() => setShowLateStart(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition hover:brightness-110"
            style={{ borderColor: "rgba(245,158,11,0.35)", backgroundColor: "rgba(245,158,11,0.14)", color: "#F59E0B" }}
          >
            <AlertTriangle size={14} /> <span className="hidden sm:inline">Empecé tarde</span>
          </button>
        )}
      </div>
    </header>
  );
}

function ModeButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition"
      style={{
        backgroundColor: active ? "var(--ca-accent)" : "var(--cm-panel)",
        borderColor: active ? "var(--ca-accent)" : "var(--cm-soft-border)",
        color: active ? "var(--ca-on-accent)" : "var(--cm-muted)",
      }}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

function TeacherView(props) {
  const {
    moments,
    focusMode,
    currentMoment,
    currentMomentIdx,
    currentSubIdx,
    currentActivityName,
    activityText,
    teacherNote,
    activityExpanded,
    setActivityExpanded,
    urgency,
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
    timerSize,
    testMode,
    testScope,
  } = props;

  return (
    <div className={`mx-auto grid max-w-7xl gap-5 ${focusMode ? "" : "xl:grid-cols-[minmax(0,1fr)_340px]"}`}>
      <section
        className="min-w-0 rounded-[2rem] border p-5 shadow-2xl backdrop-blur-xl md:p-7"
        style={{ backgroundColor: "var(--cm-panel)", borderColor: "var(--cm-soft-border)" }}
      >
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
          <div className="space-y-5">
            <p className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: "var(--cm-muted)" }}>Vista docente</p>
            <div>
              <p className="mb-2 text-sm font-bold" style={{ color: "var(--cm-muted)" }}>Momento {currentMomentIdx + 1} de {moments.length}</p>
              <h2 className="text-4xl font-black leading-tight md:text-6xl" style={{ color: "var(--cm-text)" }}>{currentMoment.name}</h2>
            </div>
            <ActivityBlock
              title={currentActivityName}
              text={activityText}
              note={teacherNote}
              expanded={activityExpanded}
              setExpanded={setActivityExpanded}
            />
          </div>
          <TimerPanel
            timeLeft={timeLeft}
            totalSessionLeft={totalSessionLeft}
            urgency={urgency}
            large={false}
            timerSize={timerSize}
          />
        </div>

        <div className="mt-7 space-y-4">
          <ProgressPair currentProgress={currentProgress} generalProgress={generalProgress} urgency={urgency} />
          <ControlRow
            isActive={isActive}
            setIsActive={setIsActive}
            currentDurationSeconds={currentDurationSeconds}
            timeLeft={timeLeft}
            goPrevious={goPrevious}
            goNext={goNext}
            setShowSummary={setShowSummary}
            testMode={testMode}
            testScope={testScope}
          />
        </div>
      </section>

      {!focusMode && (
        <aside className="space-y-4">
          <NextMomentCard nextSub={nextSub} nextMomentLabel={nextMomentLabel} isLastActivity={isLastActivity} />
          <SessionRoute moments={moments} currentMomentIdx={currentMomentIdx} currentSubIdx={currentSubIdx} />
        </aside>
      )}
    </div>
  );
}

function ClassView(props) {
  const {
    session,
    moments,
    focusMode,
    currentMoment,
    currentMomentIdx,
    currentActivityName,
    activityText,
    activityExpanded,
    setActivityExpanded,
    urgency,
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
    timerSize,
    testMode,
    testScope,
  } = props;

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col justify-center gap-2 text-center">
      <section
        className="rounded-[2rem] border px-4 py-4 shadow-2xl backdrop-blur-xl md:px-8 md:py-5"
        style={{ backgroundColor: "var(--cm-panel)", borderColor: "var(--cm-soft-border)" }}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: "var(--cm-muted)" }}>Modo clase</p>
        <h2 className="mt-1 text-4xl font-black leading-none md:text-6xl" style={{ color: "var(--cm-text)" }}>{currentMoment.name}</h2>
        <p className="mt-2 text-xs font-semibold md:text-sm" style={{ color: "var(--cm-muted)" }}>
          {session.area || "Área"} · {session.grade || "Grado"} · Momento {currentMomentIdx + 1} de {moments.length}
        </p>

        <div className="mx-auto mt-4 max-w-4xl">
          <TimerPanel
            timeLeft={timeLeft}
            totalSessionLeft={totalSessionLeft}
            urgency={urgency}
            large
            timerSize={timerSize}
          />
        </div>

        <div className="mx-auto mt-3 max-w-3xl text-left">
          <ActivityBlock
            title={currentActivityName}
            text={activityText}
            expanded={activityExpanded}
            setExpanded={setActivityExpanded}
            clean
            brief
          />
        </div>

        <div className="mx-auto mt-4 max-w-4xl space-y-3">
          <ProgressPair currentProgress={currentProgress} generalProgress={generalProgress} urgency={urgency} />
          <ControlRow
            isActive={isActive}
            setIsActive={setIsActive}
            currentDurationSeconds={currentDurationSeconds}
            timeLeft={timeLeft}
            goPrevious={goPrevious}
            goNext={goNext}
            setShowSummary={setShowSummary}
            testMode={testMode}
            testScope={testScope}
            minimal
          />
        </div>
      </section>

      {!focusMode && (
        <div className="grid gap-2 md:grid-cols-[0.8fr_1.8fr]">
          <NextMomentCard nextSub={nextSub} nextMomentLabel={nextMomentLabel} isLastActivity={isLastActivity} compact />
          <MomentChips moments={moments} currentMomentIdx={currentMomentIdx} />
        </div>
      )}
    </div>
  );
}

function TimerPanel({ timeLeft, totalSessionLeft, urgency, large, timerSize }) {
  return (
    <div
      className={large ? "p-1" : "rounded-[1.75rem] border p-4 shadow-inner md:p-5"}
      style={large ? undefined : { backgroundColor: "var(--cm-panel-strong)", borderColor: "var(--cm-soft-border)" }}
    >
      <div className="mb-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] md:text-xs" style={{ color: urgency.color }}>
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: urgency.color }} />
        {urgency.label}
      </div>
      <div
        className={`${getTimerClass(timerSize, large)} font-mono font-black leading-none tracking-tight`}
        style={{ color: urgency.color, textShadow: `0 0 34px ${urgency.color}33` }}
      >
        {formatClock(timeLeft)}
      </div>
      <p className="mt-2 text-xs font-bold md:text-sm" style={{ color: "var(--cm-muted)" }}>Sesión restante: {formatMinutes(totalSessionLeft)}</p>
    </div>
  );
}

function ActivityBlock({ title, text, note, expanded, setExpanded, clean, brief }) {
  return (
    <div
      className={`${clean ? "" : "rounded-3xl border p-4"} space-y-2`}
      style={clean ? undefined : { backgroundColor: "var(--cm-panel)", borderColor: "var(--cm-soft-border)" }}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.25em] md:text-xs" style={{ color: "var(--cm-muted)" }}>Actividad de aprendizaje</p>
      <h3 className="text-lg font-black md:text-xl" style={{ color: "var(--cm-text)" }}>{title}</h3>
      <p className={`whitespace-pre-line text-sm leading-relaxed md:text-base ${expanded ? "" : brief ? "line-clamp-2" : "line-clamp-5"}`} style={{ color: "var(--cm-text)" }}>
        {text || "Actividad sin descripción registrada."}
      </p>
      {hasLongText(text) && (
        <button onClick={() => setExpanded((v) => !v)} className="text-sm font-black hover:brightness-110" style={{ color: "var(--ca-accent)" }}>
          {expanded ? "Ver menos" : "Ver completo"}
        </button>
      )}
      {note && (
        <div className="rounded-2xl border border-amber-300/15 bg-amber-300/10 p-3">
          <p className="text-[11px] font-black uppercase tracking-wide text-amber-200">Nota docente</p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-amber-50">{note}</p>
        </div>
      )}
    </div>
  );
}

function ProgressPair({ currentProgress, generalProgress, urgency }) {
  return (
    <div className="space-y-2">
      <ProgressBar label="Momento" value={currentProgress} color={urgency.color} />
      <ProgressBar label="Sesión" value={generalProgress} color="var(--ca-accent)" />
    </div>
  );
}

function ProgressBar({ label, value, color }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-bold" style={{ color: "var(--cm-muted)" }}>
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full" style={{ backgroundColor: "var(--cm-progress-bg)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function ControlRow({ isActive, setIsActive, currentDurationSeconds, timeLeft, goPrevious, goNext, setShowSummary, minimal, testMode, testScope }) {
  const isFinished = timeLeft <= 0;
  const isMomentTest = testMode && testScope === "moment";
  const primaryLabel = isFinished
    ? isMomentTest
      ? "Finalizar prueba"
      : "Siguiente momento"
    : isActive
      ? "Pausar"
      : timeLeft < currentDurationSeconds
        ? "Continuar"
        : "Iniciar";
  const primaryIcon = isFinished ? <SkipForward size={22} /> : isActive ? <Pause size={22} /> : <Play size={22} />;
  const primaryAction = isFinished
    ? () => (isMomentTest ? setShowSummary(true) : goNext())
    : () => setIsActive((active) => !active);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
      <ClassButton onClick={goPrevious} icon={<SkipBack size={20} />} label="Anterior" quiet disabled={isMomentTest} />
      <ClassButton
        onClick={primaryAction}
        icon={primaryIcon}
        label={primaryLabel}
        primary
        className="col-span-2 md:col-span-2"
      />
      <ClassButton onClick={goNext} icon={<SkipForward size={20} />} label="Siguiente" quiet disabled={isMomentTest} />
      <ClassButton onClick={() => setShowSummary(true)} icon={<Flag size={20} />} label={testMode ? "Finalizar prueba" : minimal ? "Fin" : "Finalizar"} danger className="col-span-2" />
    </div>
  );
}

function ClassButton({ onClick, icon, label, primary, danger, quiet, disabled, className = "" }) {
  const style = primary
    ? { backgroundColor: "var(--ca-accent)", borderColor: "var(--ca-accent)", color: "var(--ca-on-accent)" }
    : danger
      ? { backgroundColor: "rgba(239,68,68,0.12)", borderColor: "rgba(248,113,113,0.25)", color: "#FCA5A5" }
      : { backgroundColor: quiet ? "var(--cm-panel)" : "var(--cm-panel-strong)", borderColor: "var(--cm-soft-border)", color: "var(--cm-text)" };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-h-11 rounded-2xl border px-3 py-2.5 text-sm font-black transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      style={style}
    >
      <span className="flex items-center justify-center gap-2">{icon}{label}</span>
    </button>
  );
}

function NextMomentCard({ nextSub, nextMomentLabel, isLastActivity, compact }) {
  return (
    <div
      className={`rounded-3xl border ${compact ? "p-3" : "p-5"} text-left backdrop-blur-xl`}
      style={{ backgroundColor: "var(--cm-panel)", borderColor: "var(--cm-soft-border)" }}
    >
      <p className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: "var(--cm-muted)" }}>Próximo</p>
      {nextSub ? (
        <div className="mt-3 flex items-start gap-3">
          <ChevronRight className="mt-1 shrink-0" size={18} style={{ color: "var(--ca-accent)" }} />
          <div className="min-w-0">
            <h3 className="font-black" style={{ color: "var(--cm-text)" }}>{nextMomentLabel || "Siguiente actividad"}</h3>
            <p className="mt-0.5 text-sm" style={{ color: "var(--cm-muted)" }}>{displayActivityName(nextSub.name)}</p>
            <p className="mt-1 text-xs font-bold" style={{ color: "var(--cm-muted)" }}>{nextSub.duration || 0} min</p>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm font-bold text-emerald-200">
          {isLastActivity ? "Último momento de la sesión" : "No hay siguiente momento"}
        </p>
      )}
    </div>
  );
}

function SessionRoute({ moments, currentMomentIdx, currentSubIdx }) {
  return (
    <div className="rounded-3xl border p-5 backdrop-blur-xl" style={{ backgroundColor: "var(--cm-panel)", borderColor: "var(--cm-soft-border)" }}>
      <p className="mb-4 text-xs font-black uppercase tracking-[0.25em]" style={{ color: "var(--cm-muted)" }}>Ruta de sesión</p>
      <div className="space-y-2">
        {moments.map((moment, momentIdx) => (
          <div
            key={moment.id || momentIdx}
            className="rounded-2xl border px-3 py-3"
            style={{
              backgroundColor: momentIdx === currentMomentIdx ? "var(--cm-panel-strong)" : "var(--cm-panel)",
              borderColor: momentIdx === currentMomentIdx ? "var(--ca-accent)" : "var(--cm-soft-border)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: moment.color || COLORS[momentIdx % COLORS.length] }} />
              <p className="min-w-0 flex-1 truncate text-sm font-black" style={{ color: "var(--cm-text)" }}>{moment.name}</p>
              <span className="font-mono text-xs" style={{ color: "var(--cm-muted)" }}>{getMomentDuration(moment)}m</span>
            </div>
            {momentIdx === currentMomentIdx && (
              <div className="mt-2 space-y-1 pl-4">
                {(moment.submoments || []).map((sub, subIdx) => (
                  <p
                    key={sub.id || subIdx}
                    className={`text-xs ${subIdx === currentSubIdx ? "font-black" : ""}`}
                    style={{ color: subIdx === currentSubIdx ? "var(--ca-accent)" : "var(--cm-muted)" }}
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

function MomentChips({ moments, currentMomentIdx }) {
  return (
    <div
      className="rounded-3xl border p-3 text-left backdrop-blur-xl"
      style={{ backgroundColor: "var(--cm-panel)", borderColor: "var(--cm-soft-border)" }}
    >
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] md:text-xs" style={{ color: "var(--cm-muted)" }}>Ruta</p>
      <div className="flex flex-wrap gap-2">
        {moments.map((moment, idx) => (
          <span
            key={moment.id || idx}
            className="rounded-full border px-2.5 py-1.5 text-xs font-black"
            style={{
              backgroundColor: idx === currentMomentIdx ? "var(--ca-accent)" : idx < currentMomentIdx ? "rgba(34,197,94,0.14)" : "var(--cm-panel-strong)",
              borderColor: idx === currentMomentIdx ? "var(--ca-accent)" : idx < currentMomentIdx ? "rgba(34,197,94,0.3)" : "var(--cm-soft-border)",
              color: idx === currentMomentIdx ? "var(--ca-on-accent)" : idx < currentMomentIdx ? "#16A34A" : "var(--cm-text)",
            }}
          >
            {moment.name} · {getMomentDuration(moment)}m
          </span>
        ))}
      </div>
    </div>
  );
}

function TestPanel({
  speed,
  restartCurrentMoment,
  jumpToSeconds,
  finishCurrentMoment,
  exitTestMode,
}) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const runTool = (action) => {
    action();
    setToolsOpen(false);
  };

  return (
    <div className="relative z-20 border-t px-3 py-2 backdrop-blur-xl" style={{ backgroundColor: "var(--cm-panel-strong)", borderColor: "var(--cm-soft-border)", color: "var(--cm-text)" }}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs font-bold" style={{ color: "var(--cm-muted)" }}>
          <span className="rounded-full px-3 py-1 font-black" style={{ backgroundColor: "var(--ca-accent)", color: "var(--ca-on-accent)" }}>Prueba</span>
          <span>x{speed}</span>
        </div>
        <div className="relative flex flex-wrap items-center gap-2">
          <TestButton onClick={() => setToolsOpen((value) => !value)}>Herramientas</TestButton>
          <TestButton onClick={exitTestMode}>Salir</TestButton>
          {toolsOpen && (
            <div className="absolute bottom-12 right-0 z-30 w-60 rounded-2xl border p-2 shadow-2xl" style={{ backgroundColor: "var(--cm-panel-strong)", borderColor: "var(--cm-soft-border)" }}>
              <ToolMenuButton onClick={() => runTool(restartCurrentMoment)}>Reiniciar momento</ToolMenuButton>
              <ToolMenuButton onClick={() => runTool(() => jumpToSeconds(300))}>Saltar a alerta temprana</ToolMenuButton>
              <ToolMenuButton onClick={() => runTool(() => jumpToSeconds(60))}>Saltar al último minuto</ToolMenuButton>
              <ToolMenuButton onClick={() => runTool(() => jumpToSeconds(15))}>Saltar a últimos 15 segundos</ToolMenuButton>
              <ToolMenuButton onClick={() => runTool(finishCurrentMoment)}>Finalizar momento</ToolMenuButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function TestButton({ children, onClick }) {
  return (
    <button onClick={onClick} className="rounded-xl border px-2.5 py-2 text-xs font-black transition hover:brightness-110" style={{ backgroundColor: "var(--cm-panel)", borderColor: "var(--cm-soft-border)", color: "var(--cm-text)" }}>
      {children}
    </button>
  );
}

function ToolMenuButton({ children, onClick }) {
  return (
    <button onClick={onClick} className="block w-full rounded-xl px-3 py-2 text-left text-xs font-black transition hover:brightness-110" style={{ color: "var(--cm-text)" }}>
      {children}
    </button>
  );
}

function PrepareSessionModal({
  session,
  settings,
  moments,
  currentMomentIdx,
  setCurrentMomentIdx,
  setCurrentSubIdx,
  setTimeLeft,
  simulationSpeed,
  setSimulationSpeed,
  prepareFullscreen,
  setPrepareFullscreen,
  testMode,
  testScope,
  totalPlannedSeconds,
  startTestMode,
  startRealSession,
  onCancel,
}) {
  const validIndexes = getValidMomentIndexes(moments);
  const chooseMoment = (idx) => {
    const moment = moments[idx];
    setCurrentMomentIdx(idx);
    setCurrentSubIdx(0);
    setTimeLeft(toSeconds(moment?.submoments?.[0]?.duration || moment?.duration || 0));
  };

  if (testMode) {
    return (
      <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-3xl border p-5 shadow-2xl" style={{ backgroundColor: "var(--cm-panel-strong)", borderColor: "var(--cm-soft-border)", color: "var(--cm-text)" }}>
          <p className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: "var(--ca-accent)" }}>Preparar prueba</p>
          <h2 className="mt-2 text-2xl font-black">{session?.title || "Sesión"}</h2>

          <div className="mt-5 space-y-3">
            {testScope === "moment" ? (
              <div className="rounded-2xl border p-3 text-sm font-bold" style={{ backgroundColor: "var(--cm-panel)", borderColor: "var(--cm-soft-border)" }}>
                <span className="block text-xs uppercase tracking-wide" style={{ color: "var(--cm-muted)" }}>Momento elegido</span>
                <span>{currentMomentIdx + 1}. {moments[currentMomentIdx]?.name || "Momento"}</span>
              </div>
            ) : (
              <label className="block rounded-2xl border p-3 text-sm font-bold" style={{ backgroundColor: "var(--cm-panel)", borderColor: "var(--cm-soft-border)" }}>
                <span className="block text-xs uppercase tracking-wide" style={{ color: "var(--cm-muted)" }}>Momento inicial</span>
                <select value={currentMomentIdx} onChange={(event) => chooseMoment(Number(event.target.value))} disabled={!validIndexes.length} className="mt-2 w-full rounded-xl border px-2 py-2 outline-none disabled:opacity-60" style={{ backgroundColor: "var(--cm-panel-strong)", borderColor: "var(--cm-soft-border)", color: "var(--cm-text)" }}>
                  {validIndexes.length
                    ? validIndexes.map((idx) => <option key={moments[idx]?.id || idx} value={idx}>{idx + 1}. {moments[idx]?.name}</option>)
                    : <option>No hay momentos con tiempo</option>}
                </select>
              </label>
            )}
            <label className="block rounded-2xl border p-3 text-sm font-bold" style={{ backgroundColor: "var(--cm-panel)", borderColor: "var(--cm-soft-border)" }}>
              <span className="block text-xs uppercase tracking-wide" style={{ color: "var(--cm-muted)" }}>Velocidad</span>
              <select value={simulationSpeed} onChange={(event) => setSimulationSpeed(Number(event.target.value))} className="mt-2 w-full rounded-xl border px-2 py-2 outline-none" style={{ backgroundColor: "var(--cm-panel-strong)", borderColor: "var(--cm-soft-border)", color: "var(--cm-text)" }}>
                {TEST_SPEEDS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button onClick={onCancel} className="rounded-2xl border px-5 py-3 text-sm font-black" style={{ backgroundColor: "var(--cm-panel)", borderColor: "var(--cm-soft-border)", color: "var(--cm-text)" }}>Cancelar</button>
            <button onClick={startTestMode} disabled={!validIndexes.length} className="rounded-2xl px-5 py-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50" style={{ backgroundColor: "var(--ca-accent)", color: "var(--ca-on-accent)" }}>Iniciar prueba</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border p-5 shadow-2xl" style={{ backgroundColor: "var(--cm-panel-strong)", borderColor: "var(--cm-soft-border)", color: "var(--cm-text)" }}>
        <p className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: "var(--ca-accent)" }}>Preparar sesión</p>
        <h2 className="mt-2 text-2xl font-black">{session?.title || "Sesión"}</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <InfoLine label="Vista inicial" value={settings.defaultClassView === "class" ? "Modo clase" : "Vista docente"} />
          <InfoLine label="Sonidos" value={settings.muteAll ? "Silenciados" : settings.soundAlerts ? `Activos · volumen ${settings.alertVolume || "medio"}` : "Desactivados"} />
          <InfoLine label="Cambio automático" value={settings.autoAdvanceMoments ? "Activado" : "Desactivado"} />
          <InfoLine label="Pausa al terminar" value={settings.pauseAtMomentEnd !== false ? "Activada" : "Desactivada"} />
          <InfoLine label="Duración total" value={formatMinutes(totalPlannedSeconds)} />
          <label className="rounded-2xl border p-3 text-sm font-bold" style={{ backgroundColor: "var(--cm-panel)", borderColor: "var(--cm-soft-border)" }}>
            <span className="block text-xs uppercase tracking-wide" style={{ color: "var(--cm-muted)" }}>Momento inicial</span>
            <select value={currentMomentIdx} onChange={(event) => chooseMoment(Number(event.target.value))} disabled={!validIndexes.length} className="mt-2 w-full rounded-xl border px-2 py-2 outline-none disabled:opacity-60" style={{ backgroundColor: "var(--cm-panel-strong)", borderColor: "var(--cm-soft-border)", color: "var(--cm-text)" }}>
              {validIndexes.length
                ? validIndexes.map((idx) => <option key={moments[idx]?.id || idx} value={idx}>{idx + 1}. {moments[idx]?.name}</option>)
                : <option>No hay momentos con tiempo</option>}
            </select>
          </label>
          <button onClick={() => setPrepareFullscreen(!prepareFullscreen)} className="rounded-2xl border p-3 text-left text-sm font-bold" style={{ backgroundColor: prepareFullscreen ? "var(--ca-accent)" : "var(--cm-panel)", borderColor: prepareFullscreen ? "var(--ca-accent)" : "var(--cm-soft-border)", color: prepareFullscreen ? "var(--ca-on-accent)" : "var(--cm-text)" }}>
            Pantalla completa: {prepareFullscreen ? "sí" : "no"}
          </button>
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button onClick={onCancel} className="rounded-2xl border px-5 py-3 text-sm font-black" style={{ backgroundColor: "var(--cm-panel)", borderColor: "var(--cm-soft-border)", color: "var(--cm-text)" }}>Cancelar</button>
          <button onClick={startTestMode} className="rounded-2xl border px-5 py-3 text-sm font-black" style={{ backgroundColor: "var(--cm-panel)", borderColor: "var(--cm-soft-border)", color: "var(--cm-text)" }}>Probar sesión</button>
          <button onClick={startRealSession} className="rounded-2xl px-5 py-3 text-sm font-black" style={{ backgroundColor: "var(--ca-accent)", color: "var(--ca-on-accent)" }}>Iniciar sesión real</button>
        </div>
      </div>
    </div>
  );
}
function InfoLine({ label, value }) {
  return (
    <div className="rounded-2xl border p-3 text-sm font-bold" style={{ backgroundColor: "var(--cm-panel)", borderColor: "var(--cm-soft-border)" }}>
      <span className="block text-xs uppercase tracking-wide" style={{ color: "var(--cm-muted)" }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function LateStartModal({ lateMode, setLateMode, lateMinutes, setLateMinutes, remainingMinutesInput, setRemainingMinutesInput, onClose, onApply }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-black"><AlertTriangle className="text-amber-300" size={20} /> Empecé tarde</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
        </div>
        <p className="mt-2 text-sm text-slate-400">Redistribuye proporcionalmente el tiempo de las actividades que faltan.</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button onClick={() => setLateMode("delay")} className="rounded-2xl border px-3 py-3 text-sm font-black" style={lateMode === "delay" ? { backgroundColor: "var(--ca-accent)", borderColor: "var(--ca-accent)", color: "var(--ca-on-accent)" } : { borderColor: "rgba(255,255,255,0.1)", color: "#CBD5E1" }}>Retraso</button>
          <button onClick={() => setLateMode("remaining")} className="rounded-2xl border px-3 py-3 text-sm font-black" style={lateMode === "remaining" ? { backgroundColor: "var(--ca-accent)", borderColor: "var(--ca-accent)", color: "var(--ca-on-accent)" } : { borderColor: "rgba(255,255,255,0.1)", color: "#CBD5E1" }}>Tiempo restante</button>
        </div>
        <NumberField
          label={lateMode === "delay" ? "Minutos de retraso" : "Minutos que quedan realmente"}
          value={lateMode === "delay" ? lateMinutes : remainingMinutesInput}
          onChange={lateMode === "delay" ? setLateMinutes : setRemainingMinutesInput}
        />
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-2xl border border-white/10 py-3 font-bold text-slate-300">Cancelar</button>
          <button onClick={onApply} className="flex-1 rounded-2xl py-3 font-black" style={{ backgroundColor: "var(--ca-accent)", color: "var(--ca-on-accent)" }}>Aplicar</button>
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <label className="mt-5 block space-y-2">
      <span className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
      <input
        type="number"
        min="1"
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-black text-white outline-none focus:border-cyan-200"
        value={value}
        onChange={(e) => onChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
      />
    </label>
  );
}

function SummaryModal({ session, plannedSeconds, workedSeconds, completedCount, totalActivities, onRepeat }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-6 text-white shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-300/15">
            <CheckCircle2 className="text-emerald-200" size={28} />
          </div>
          <h2 className="mt-3 text-2xl font-black">Sesión finalizada</h2>
          <p className="text-sm text-slate-400">Resumen del trabajo en aula</p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <SummaryItem label="Planificado" value={formatMinutes(plannedSeconds)} />
          <SummaryItem label="Trabajado" value={formatMinutes(workedSeconds)} />
          <SummaryItem label="Completados" value={`${completedCount}/${totalActivities}`} />
          <SummaryItem label="Sesión" value={session.area || "Clase"} />
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <a href="/sessions" className="rounded-2xl border border-white/10 py-3 text-center font-bold text-slate-300">Mis sesiones</a>
          <button onClick={onRepeat} className="rounded-2xl border border-white/10 py-3 font-bold text-slate-300">Repetir</button>
          <a href={`/create?id=${session.id}`} className="rounded-2xl py-3 text-center font-black" style={{ backgroundColor: "var(--ca-accent)", color: "var(--ca-on-accent)" }}>Editar</a>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}
