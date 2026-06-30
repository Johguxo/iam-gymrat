"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Dumbbell,
  History,
  Minus,
  Plus,
  SkipForward,
  X,
} from "lucide-react";
import { MuscleGroup } from "@prisma/client";
import { Card, Input } from "@/components/ui";
import { logSessionSet } from "./actions";

export type SessionExercise = {
  id: string;
  name: string;
  muscleGroup: string;
  lastWeight: number | null;
  lastReps: number | null;
};

type Props = {
  routineByDay: Record<number, MuscleGroup[]>;
  exercisesByGroup: Record<string, SessionExercise[]>;
};

type DoneSet = { weight: number; reps: number };
type View = "summary" | "active" | "rest";

const REST_DEFAULT = 90;
const TARGET_SETS = 3;

export function SessionRunner({ routineByDay, exercisesByGroup }: Props) {
  const router = useRouter();
  const [exercises, setExercises] = useState<SessionExercise[] | null>(null);
  const [view, setView] = useState<View>("summary");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completed, setCompleted] = useState<Record<string, DoneSet[]>>({});
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(0);
  const [notes, setNotes] = useState("");
  const [rest, setRest] = useState(REST_DEFAULT);
  const [pending, startTransition] = useTransition();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const dow = new Date().getDay();
    const groups = routineByDay[dow] ?? [];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExercises(groups.flatMap((g) => exercisesByGroup[g] ?? []));
  }, [routineByDay, exercisesByGroup]);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (view !== "rest") return;
    const t = setTimeout(() => {
      if (rest <= 1) {
        setRest(0);
        setView("active");
      } else {
        setRest(rest - 1);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [view, rest]);

  const current = exercises?.[currentIdx] ?? null;

  useEffect(() => {
    if (!current) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWeight(current.lastWeight ?? 0);
    setReps(current.lastReps ?? 8);
  }, [current]);

  if (!exercises) {
    return (
      <div className="max-w-md mx-auto text-center py-16 text-[var(--muted-foreground)]">
        Cargando sesión…
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <h1 className="text-[22px] font-semibold tracking-tight mb-2">Sin ejercicios para hoy</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Añade ejercicios a los grupos de hoy o edita tu rutina.
        </p>
        <Link
          href="/grupos"
          className="inline-flex h-11 px-5 rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] items-center font-semibold text-sm"
        >
          Ir a grupos
        </Link>
      </div>
    );
  }

  const completedCount = (id: string) => completed[id]?.length ?? 0;
  const exerciseDone = (id: string) => completedCount(id) >= TARGET_SETS;
  const finishedExercises = exercises.filter((e) => exerciseDone(e.id)).length;
  const progress = Math.round((finishedExercises / exercises.length) * 100);

  const completeSet = () => {
    if (!current || pending) return;
    const set: DoneSet = { weight, reps };
    startTransition(async () => {
      try {
        await logSessionSet({
          exerciseId: current.id,
          weight,
          reps,
          notes: notes.trim() || null,
        });
        setCompleted((c) => ({
          ...c,
          [current.id]: [...(c[current.id] ?? []), set],
        }));
        setNotes("");
        setRest(REST_DEFAULT);
        setView("rest");
      } catch {
        // ignore for now
      }
    });
  };

  const nextExercise = () => {
    const next = exercises.findIndex((e, i) => i > currentIdx && !exerciseDone(e.id));
    if (next >= 0) {
      setCurrentIdx(next);
      setView("active");
    } else {
      const anyLeft = exercises.findIndex((e) => !exerciseDone(e.id));
      if (anyLeft >= 0) {
        setCurrentIdx(anyLeft);
        setView("summary");
      } else {
        setView("summary");
      }
    }
  };

  const finish = () => router.push("/");

  if (view === "active" && current) {
    const setNumber = completedCount(current.id) + 1;
    return (
      <ActiveSetView
        exercise={current}
        setNumber={setNumber}
        weight={weight}
        reps={reps}
        notes={notes}
        pending={pending}
        doneSets={completed[current.id] ?? []}
        onWeight={setWeight}
        onReps={setReps}
        onNotes={setNotes}
        onBack={() => setView("summary")}
        onComplete={completeSet}
        onSkip={nextExercise}
        index={currentIdx}
        total={exercises.length}
      />
    );
  }

  if (view === "rest" && current) {
    const nextSet = completedCount(current.id) + 1;
    return (
      <RestView
        exercise={current}
        nextSet={nextSet}
        rest={rest}
        weight={weight}
        reps={reps}
        onAdd30={() => setRest((r) => r + 30)}
        onSkip={() => setRest(0)}
      />
    );
  }

  return (
    <SummaryView
      exercises={exercises}
      currentIdx={currentIdx}
      completedCount={completedCount}
      finishedExercises={finishedExercises}
      progress={progress}
      elapsed={elapsed}
      onPick={(i) => {
        setCurrentIdx(i);
        setView("active");
      }}
      onContinue={() => setView("active")}
      onFinish={finish}
      allDone={finishedExercises === exercises.length}
    />
  );
}

function mmss(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function SummaryView({
  exercises,
  currentIdx,
  completedCount,
  finishedExercises,
  progress,
  elapsed,
  onPick,
  onContinue,
  onFinish,
  allDone,
}: {
  exercises: SessionExercise[];
  currentIdx: number;
  completedCount: (id: string) => number;
  finishedExercises: number;
  progress: number;
  elapsed: number;
  onPick: (i: number) => void;
  onContinue: () => void;
  onFinish: () => void;
  allDone: boolean;
}) {
  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3.5">
        <Link
          href="/"
          aria-label="Salir"
          className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </Link>
        <div className="text-center">
          <div className="font-semibold text-[16px]">Entrenamiento</div>
          <div className="font-mono text-[13px] text-[var(--accent)] flex items-center gap-1.5 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            {mmss(elapsed)}
          </div>
        </div>
        <div className="w-10 h-10" />
      </div>

      <div className="mb-4">
        <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
          <div
            className="h-full bg-[var(--primary)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs font-medium text-[var(--muted-foreground)] mt-2">
          {finishedExercises} de {exercises.length} ejercicios
        </div>
      </div>

      <div className="space-y-2.5 mb-4">
        {exercises.map((e, i) => {
          const done = completedCount(e.id);
          const isDone = done >= TARGET_SETS;
          const isCurrent = i === currentIdx && !isDone;
          if (isCurrent) {
            return (
              <button
                key={e.id}
                onClick={() => onPick(i)}
                className="w-full text-left bg-[var(--card)] border-2 border-[var(--primary)] rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-mono font-semibold text-sm">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold text-[15px]">{e.name}</div>
                    <div className="text-xs font-medium text-[var(--muted-foreground)] mt-0.5">
                      {done}/{TARGET_SETS} series
                      {e.lastWeight != null && ` · última ${e.lastWeight} kg`}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold tracking-wider bg-[var(--primary)] text-[var(--primary-foreground)] px-2.5 py-1 rounded-full">
                    AHORA
                  </span>
                </div>
              </button>
            );
          }
          return (
            <button
              key={e.id}
              onClick={() => onPick(i)}
              className={`w-full text-left bg-[var(--card)] border border-[var(--border)] rounded-2xl p-3.5 flex items-center gap-3 ${
                isDone ? "opacity-55" : ""
              }`}
            >
              {isDone ? (
                <span className="w-7 h-7 rounded-full bg-[var(--accent)] text-white flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </span>
              ) : (
                <span className="w-7 h-7 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] flex items-center justify-center font-mono font-semibold text-[13px]">
                  {i + 1}
                </span>
              )}
              <div className="flex-1">
                <div className="font-semibold text-[14px]">{e.name}</div>
                <div className="text-xs font-medium text-[var(--muted-foreground)] mt-0.5">
                  {done}/{TARGET_SETS} series
                  {e.lastWeight != null && ` · última ${e.lastWeight} kg`}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {allDone ? (
        <button
          onClick={onFinish}
          className="w-full h-[52px] rounded-2xl bg-[var(--accent)] text-white font-semibold text-[16px] flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          Terminar entrenamiento
        </button>
      ) : (
        <button
          onClick={onContinue}
          className="w-full h-[52px] rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold text-[16px]"
        >
          {finishedExercises === 0 ? "Empezar" : "Continuar serie"}
        </button>
      )}
    </div>
  );
}

function ActiveSetView({
  exercise,
  setNumber,
  weight,
  reps,
  notes,
  pending,
  doneSets,
  onWeight,
  onReps,
  onNotes,
  onBack,
  onComplete,
  onSkip,
  index,
  total,
}: {
  exercise: SessionExercise;
  setNumber: number;
  weight: number;
  reps: number;
  notes: string;
  pending: boolean;
  doneSets: DoneSet[];
  onWeight: (n: number) => void;
  onReps: (n: number) => void;
  onNotes: (s: string) => void;
  onBack: () => void;
  onComplete: () => void;
  onSkip: () => void;
  index: number;
  total: number;
}) {
  const fmt = (n: number) => (n % 1 === 0 ? String(n) : n.toFixed(1));
  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          aria-label="Volver al resumen"
          className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <div className="font-semibold text-[16px]">{exercise.name}</div>
          <div className="text-xs font-medium text-[var(--muted-foreground)]">
            Ejercicio {index + 1} de {total}
          </div>
        </div>
        <button
          onClick={onSkip}
          aria-label="Siguiente ejercicio"
          className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {exercise.lastWeight != null && exercise.lastReps != null && (
        <div className="flex items-center justify-between bg-[var(--muted)] rounded-xl px-4 py-3 mb-4">
          <span className="text-[13px] font-medium text-[var(--muted-foreground)] flex items-center gap-2">
            <History className="w-4 h-4" /> Última vez
          </span>
          <span className="font-mono font-semibold text-[14px] tabular-nums">
            {exercise.lastWeight} kg × {exercise.lastReps}
          </span>
        </div>
      )}

      <Card className="p-5 mb-4">
        <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--muted-foreground)] text-center">
          SERIE {setNumber}
        </div>
        <Stepper
          value={weight}
          unit="kg"
          big={fmt(weight)}
          onMinus={() => onWeight(Math.max(0, weight - 2.5))}
          onPlus={() => onWeight(weight + 2.5)}
        />
        <div className="h-px bg-[var(--border)] my-4" />
        <Stepper
          value={reps}
          unit="reps"
          big={String(reps)}
          onMinus={() => onReps(Math.max(0, reps - 1))}
          onPlus={() => onReps(reps + 1)}
        />
        <Input
          value={notes}
          onChange={(e) => onNotes(e.target.value)}
          placeholder="Añadir nota (ej. fácil, fallé la última)…"
          className="mt-4 bg-[var(--muted)]"
        />
        <button
          onClick={onComplete}
          disabled={pending || reps === 0}
          className="mt-3 w-full h-[52px] rounded-2xl bg-[var(--accent)] text-white font-semibold text-[16px] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Check className="w-5 h-5" />
          {pending ? "Guardando…" : "Completar serie"}
        </button>
      </Card>

      {doneSets.length > 0 && (
        <>
          <div className="text-[11px] font-semibold tracking-[0.08em] text-[var(--muted-foreground)] mt-5 mb-2.5 px-1">
            SERIES COMPLETADAS
          </div>
          <div className="space-y-2">
            {doneSets.map((s, i) => (
              <div
                key={i}
                className="bg-[var(--card)] border border-[var(--border)] rounded-2xl px-4 py-3 flex items-center gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-mono font-semibold text-[12px]">
                  {i + 1}
                </span>
                <span className="flex-1 font-mono font-semibold text-[15px] tabular-nums">
                  {fmt(s.weight)} kg × {s.reps}
                </span>
                <CheckCircle2 className="w-5 h-5 text-[var(--accent)]" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Stepper({
  big,
  unit,
  onMinus,
  onPlus,
}: {
  value: number;
  big: string;
  unit: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="flex items-center justify-between mt-4">
      <button
        onClick={onMinus}
        aria-label={`Menos ${unit}`}
        className="w-[54px] h-[54px] rounded-2xl border border-[var(--border-strong)] bg-[var(--muted)] flex items-center justify-center"
      >
        <Minus className="w-5 h-5" />
      </button>
      <div className="text-center">
        <div className="font-mono font-bold text-[42px] tracking-tight leading-none tabular-nums">
          {big}
        </div>
        <div className="text-xs font-medium text-[var(--muted-foreground)] mt-1.5">{unit}</div>
      </div>
      <button
        onClick={onPlus}
        aria-label={`Más ${unit}`}
        className="w-[54px] h-[54px] rounded-2xl border border-[var(--border-strong)] bg-[var(--muted)] flex items-center justify-center"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}

function RestView({
  exercise,
  nextSet,
  rest,
  weight,
  reps,
  onAdd30,
  onSkip,
}: {
  exercise: SessionExercise;
  nextSet: number;
  rest: number;
  weight: number;
  reps: number;
  onAdd30: () => void;
  onSkip: () => void;
}) {
  const circ = 540;
  const offset = circ * (1 - Math.max(0, rest) / REST_DEFAULT);
  return (
    <div className="max-w-md mx-auto -mx-4 -my-6 sm:-mx-6 min-h-[calc(100vh-5rem)] bg-[#1C1C1E] text-white px-5 pt-6 pb-8 flex flex-col rounded-none">
      <div className="flex justify-between items-center">
        <span className="font-medium text-[13px] text-white/55">
          {exercise.name} · Serie {nextSet}
        </span>
        <button
          onClick={onSkip}
          aria-label="Saltar descanso"
          className="text-white/55"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <div className="text-[13px] font-medium tracking-[0.18em] text-white/55">DESCANSO</div>
        <div className="relative w-[230px] h-[230px] my-2">
          <svg viewBox="0 0 200 200" className="w-[230px] h-[230px] -rotate-90">
            <circle cx="100" cy="100" r="86" fill="none" stroke="#2E2E30" strokeWidth="12" />
            <circle
              cx="100"
              cy="100"
              r="86"
              fill="none"
              stroke="#2F9E6E"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="540"
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-mono font-bold text-[54px] tracking-tight tabular-nums">
              {mmss(Math.max(0, rest))}
            </div>
            <div className="text-xs font-medium text-white/55 mt-0.5">restante</div>
          </div>
        </div>
        <div className="flex gap-3 mt-2">
          <button
            onClick={onAdd30}
            className="h-11 px-5 rounded-2xl border border-white/15 bg-transparent text-white font-semibold text-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> 30 s
          </button>
          <button
            onClick={onSkip}
            className="h-11 px-5 rounded-2xl bg-white text-[#1C1C1E] font-semibold text-sm flex items-center gap-1.5"
          >
            <SkipForward className="w-4 h-4" /> Saltar
          </button>
        </div>
      </div>
      <div className="bg-white/[0.08] rounded-2xl p-4 flex items-center gap-3">
        <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
          <Dumbbell className="w-4 h-4" />
        </span>
        <div className="flex-1">
          <div className="text-xs font-medium text-white/55">Sigue</div>
          <div className="font-semibold text-[15px] mt-0.5">
            Serie {nextSet} · {weight} kg × {reps}
          </div>
        </div>
      </div>
    </div>
  );
}
