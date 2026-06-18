"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRight } from "lucide-react";
import { MuscleGroup } from "@prisma/client";
import { Card } from "@/components/ui";
import { DAYS_ES, MUSCLE_LABEL, MUSCLE_SLUG, MUSCLE_COLOR } from "@/lib/muscle-groups";

export function TodayRoutine({
  routineByDay,
}: {
  routineByDay: Record<number, MuscleGroup[]>;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  if (!now) {
    return (
      <>
        <div className="mb-6 h-20" />
        <Card className="mb-6 h-24" />
      </>
    );
  }

  const dow = now.getDay();
  const groupsToday = routineByDay[dow] ?? [];

  return (
    <>
      <div className="mb-6">
        <p className="text-sm text-[var(--muted-foreground)]">
          {format(now, "EEEE, d 'de' MMMM", { locale: es })}
        </p>
        <h1 className="text-3xl font-bold">Hoy es {DAYS_ES[dow]}</h1>
      </div>

      <Card className="mb-6">
        <h2 className="font-semibold mb-3">Toca trabajar</h2>
        {groupsToday.length === 0 ? (
          <div className="text-sm text-[var(--muted-foreground)]">
            Día de descanso. Edita tu{" "}
            <Link href="/rutina" className="underline">
              rutina
            </Link>{" "}
            para programar este día.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {groupsToday.map((g) => (
              <Link
                key={g}
                href={`/grupos/${MUSCLE_SLUG[g]}`}
                className={`rounded-full px-3 py-1.5 text-sm font-medium border ${MUSCLE_COLOR[g]} hover:opacity-80 inline-flex items-center gap-1`}
              >
                {MUSCLE_LABEL[g]} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
