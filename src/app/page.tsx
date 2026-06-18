import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui";
import { prisma } from "@/lib/db";
import {
  DAYS_ES,
  MUSCLE_LABEL,
  MUSCLE_SLUG,
  MUSCLE_COLOR,
} from "@/lib/muscle-groups";

export const dynamic = "force-dynamic";

export default async function Home() {
  const today = new Date();
  const dow = today.getDay();

  const [routine, recent] = await Promise.all([
    prisma.routineDay.findUnique({ where: { dayOfWeek: dow } }),
    prisma.workoutSet.findMany({
      take: 5,
      orderBy: { performedAt: "desc" },
      include: { exercise: true },
    }),
  ]);

  const groupsToday = routine?.muscleGroups ?? [];

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-[var(--muted-foreground)]">
          {format(today, "EEEE, d 'de' MMMM", { locale: es })}
        </p>
        <h1 className="text-3xl font-bold">Hoy es {DAYS_ES[dow]}</h1>
      </div>

      <Card className="mb-6">
        <h2 className="font-semibold mb-3">Toca trabajar</h2>
        {groupsToday.length === 0 ? (
          <div className="text-sm text-[var(--muted-foreground)]">
            Día de descanso. Edita tu{" "}
            <Link href="/rutina" className="underline">rutina</Link> para programar este día.
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

      <Card>
        <h2 className="font-semibold mb-3">Últimos registros</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Aún no has registrado ningún set. Ve a{" "}
            <Link href="/grupos" className="underline">Grupos</Link> para empezar.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {recent.map((s) => (
              <li key={s.id} className="py-2 flex items-center justify-between">
                <Link href={`/ejercicios/${s.exerciseId}`} className="hover:underline">
                  <div className="font-medium">{s.exercise.name}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {MUSCLE_LABEL[s.exercise.muscleGroup]} ·{" "}
                    {format(s.performedAt, "d MMM", { locale: es })}
                  </div>
                </Link>
                <div className="text-sm font-medium">
                  {s.weight}kg × {s.reps} × {s.sets}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
