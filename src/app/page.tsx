import Link from "next/link";
import { MuscleGroup } from "@prisma/client";
import { Card } from "@/components/ui";
import { prisma } from "@/lib/db";
import { MUSCLE_LABEL } from "@/lib/muscle-groups";
import { TodayRoutine } from "./today-routine";
import { RecentDate } from "./recent-date";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [routineRows, recent] = await Promise.all([
    prisma.routineDay.findMany(),
    prisma.workoutSet.findMany({
      take: 5,
      orderBy: { performedAt: "desc" },
      include: { exercise: true },
    }),
  ]);

  const routineByDay: Record<number, MuscleGroup[]> = {};
  for (const r of routineRows) routineByDay[r.dayOfWeek] = r.muscleGroups;

  return (
    <div>
      <TodayRoutine routineByDay={routineByDay} />

      <Card>
        <h2 className="font-semibold mb-3">Últimos registros</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Aún no has registrado ningún set. Ve a{" "}
            <Link href="/grupos" className="underline">
              Grupos
            </Link>{" "}
            para empezar.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {recent.map((s) => (
              <li key={s.id} className="py-2 flex items-center justify-between">
                <Link href={`/ejercicios/${s.exerciseId}`} className="hover:underline">
                  <div className="font-medium">{s.exercise.name}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {MUSCLE_LABEL[s.exercise.muscleGroup]} ·{" "}
                    <RecentDate iso={s.performedAt.toISOString()} />
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
