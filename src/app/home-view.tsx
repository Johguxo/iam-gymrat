"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Play, Flame, CalendarDays, Dumbbell, Clock, Check } from "lucide-react";
import { MuscleGroup } from "@prisma/client";
import { Card } from "@/components/ui";
import { MUSCLE_LABEL } from "@/lib/muscle-groups";

type Props = {
  name: string | null;
  routineByDay: Record<number, MuscleGroup[]>;
  exercisesByGroup: Record<string, number>;
  workoutDays: string[];
};

const WEEK_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

function isoLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function workoutLabel(groups: MuscleGroup[]): string {
  if (groups.length === 0) return "Día de descanso";
  const set = new Set(groups);
  const pushHits = ["PECHO", "TRICEPS", "HOMBROS"].filter((g) =>
    set.has(g as MuscleGroup),
  ).length;
  const pullHits = ["ESPALDA", "BICEPS"].filter((g) => set.has(g as MuscleGroup)).length;
  if (pushHits >= 2 && pullHits === 0) return "Día de Empuje";
  if (pullHits >= 2 && pushHits === 0) return "Día de Tirón";
  if (set.has("PIERNAS") && groups.length === 1) return "Día de Piernas";
  return groups.map((g) => MUSCLE_LABEL[g]).join(" · ");
}

export function HomeView({ name, routineByDay, exercisesByGroup, workoutDays }: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
  }, []);

  const data = useMemo(() => {
    if (!now) return null;
    const dow = now.getDay();
    const groupsToday = routineByDay[dow] ?? [];
    const exercisesToday = groupsToday.reduce(
      (acc, g) => acc + (exercisesByGroup[g] ?? 0),
      0,
    );
    const estimatedMin = exercisesToday > 0 ? Math.max(15, Math.round((exercisesToday * 10) / 5) * 5) : 0;

    const workoutSet = new Set(workoutDays);
    let streak = 0;
    const cursor = new Date(now);
    if (!workoutSet.has(isoLocal(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (workoutSet.has(isoLocal(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    const mondayOffset = (dow + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dayJsIdx = (i + 1) % 7;
      const planned = (routineByDay[dayJsIdx] ?? []).length > 0;
      const done = workoutSet.has(isoLocal(d));
      const isToday = isoLocal(d) === isoLocal(now);
      const isPast = d < new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { label: WEEK_LABELS[i], done, planned, isToday, isPast };
    });
    const weekDone = weekDays.filter((d) => d.done).length;
    const weekPlanned = weekDays.filter((d) => d.planned).length;

    return { dow, groupsToday, exercisesToday, estimatedMin, streak, weekDays, weekDone, weekPlanned };
  }, [now, routineByDay, exercisesByGroup, workoutDays]);

  if (!now || !data) {
    return (
      <>
        <div className="h-14 mb-5" />
        <div className="h-44 mb-3 rounded-3xl bg-[var(--muted)]" />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="h-20 rounded-3xl bg-[var(--muted)]" />
          <div className="h-20 rounded-3xl bg-[var(--muted)]" />
        </div>
        <div className="h-28 rounded-3xl bg-[var(--muted)]" />
      </>
    );
  }

  const initial = (name ?? "?").trim().charAt(0).toUpperCase() || "?";
  const firstName = (name ?? "").split(" ")[0] || "atleta";
  const title = workoutLabel(data.groupsToday);
  const isRest = data.groupsToday.length === 0;
  const startHref = isRest ? "/rutina" : "/sesion";

  return (
    <div className="max-w-md mx-auto">
      <header className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            {format(now, "EEEE, d MMM", { locale: es })}
          </p>
          <h1 className="text-[26px] font-semibold tracking-tight mt-0.5">Hola, {firstName}</h1>
        </div>
        <div className="w-[42px] h-[42px] rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-semibold">
          {initial}
        </div>
      </header>

      <Card className="bg-[#1C1C1E] text-white border-transparent p-6 mb-3.5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-white/55">
          ENTRENAMIENTO DE HOY
        </p>
        <h2 className="text-[28px] font-semibold tracking-tight mt-2">{title}</h2>
        {!isRest && (
          <div className="flex gap-4 mt-2 text-[13px] text-white/70 font-medium">
            <span className="inline-flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4" />
              {data.exercisesToday} ejercicio{data.exercisesToday === 1 ? "" : "s"}
            </span>
            {data.estimatedMin > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" />~{data.estimatedMin} min
              </span>
            )}
          </div>
        )}
        <Link
          href={startHref}
          className="mt-4 w-full h-[52px] rounded-2xl bg-white text-[#1C1C1E] font-semibold inline-flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" />
          {isRest ? "Programar mi rutina" : "Empezar entrenamiento"}
        </Link>
      </Card>

      <div className="grid grid-cols-2 gap-3 mb-3.5">
        <StatCard
          icon={<Flame className="w-4 h-4" />}
          label="Racha"
          value={String(data.streak)}
          unit={data.streak === 1 ? "día" : "días"}
        />
        <StatCard
          icon={<CalendarDays className="w-4 h-4" />}
          label="Semana"
          value={String(data.weekDone)}
          unit={`/${Math.max(data.weekPlanned, data.weekDone)}`}
        />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3.5">
          <div className="font-semibold text-[14px]">Tu semana</div>
          <div className="text-xs font-medium text-[var(--muted-foreground)]">
            {data.weekDone} entreno{data.weekDone === 1 ? "" : "s"}
          </div>
        </div>
        <div className="flex justify-between">
          {data.weekDays.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
                {d.label}
              </span>
              <DayPill {...d} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)]">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 font-semibold text-[28px] font-mono tracking-tight">
        {value}
        <span className="text-sm font-medium text-[var(--muted-foreground)] font-sans">
          {" "}
          {unit}
        </span>
      </div>
    </Card>
  );
}

function DayPill({
  done,
  planned,
  isToday,
  isPast,
}: {
  done: boolean;
  planned: boolean;
  isToday: boolean;
  isPast: boolean;
}) {
  if (done) {
    return (
      <span className="w-[30px] h-[30px] rounded-[10px] bg-[var(--accent)] text-white flex items-center justify-center">
        <Check className="w-4 h-4" />
      </span>
    );
  }
  if (isToday) {
    return (
      <span className="w-[30px] h-[30px] rounded-[10px] bg-[var(--card)] border-2 border-[var(--primary)]" />
    );
  }
  if (planned && !isPast) {
    return (
      <span className="w-[30px] h-[30px] rounded-[10px] bg-[var(--card)] border border-[var(--border-strong)]" />
    );
  }
  return <span className="w-[30px] h-[30px] rounded-[10px] bg-[var(--muted)]" />;
}
