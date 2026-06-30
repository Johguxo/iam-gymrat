"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { MuscleGroup } from "@prisma/client";
import { MUSCLE_GROUPS, MUSCLE_LABEL } from "@/lib/muscle-groups";
import { setRoutineDay } from "./actions";

export function RoutineEditor({
  dayOfWeek,
  initial,
}: {
  dayOfWeek: number;
  initial: MuscleGroup[];
}) {
  const [selected, setSelected] = useState<MuscleGroup[]>(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const toggle = (g: MuscleGroup) => {
    const next = selected.includes(g) ? selected.filter((x) => x !== g) : [...selected, g];
    setSelected(next);
    setSaved(false);
    startTransition(async () => {
      await setRoutineDay(dayOfWeek, next);
      setSaved(true);
    });
  };

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {MUSCLE_GROUPS.map((g) => {
        const active = selected.includes(g);
        return (
          <button
            key={g}
            type="button"
            onClick={() => toggle(g)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition cursor-pointer ${
              active
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                : "border-[var(--border-strong)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            }`}
          >
            {MUSCLE_LABEL[g]}
          </button>
        );
      })}
      {pending && <span className="text-xs text-[var(--muted-foreground)] ml-1">guardando…</span>}
      {saved && !pending && (
        <span className="text-xs text-[var(--accent)] inline-flex items-center gap-1 ml-1">
          <Check className="w-3 h-3" /> guardado
        </span>
      )}
    </div>
  );
}
