import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui";
import { ExerciseForm } from "./exercise-form";
import { SLUG_TO_MUSCLE, MUSCLE_LABEL, MUSCLE_COLOR } from "@/lib/muscle-groups";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function GrupoPage({ params }: { params: Promise<{ group: string }> }) {
  const { group } = await params;
  const muscle = SLUG_TO_MUSCLE[group];
  if (!muscle) notFound();

  const exercises = await prisma.exercise.findMany({
    where: { muscleGroup: muscle },
    orderBy: { createdAt: "desc" },
    include: {
      sets: { orderBy: { performedAt: "desc" }, take: 1 },
      _count: { select: { sets: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">{MUSCLE_LABEL[muscle]}</h1>
        <span className={`rounded-full px-2.5 py-0.5 text-xs border ${MUSCLE_COLOR[muscle]}`}>
          {exercises.length} ejercicios
        </span>
      </div>

      <Card className="mb-6">
        <h2 className="font-semibold mb-3">Añadir ejercicio</h2>
        <ExerciseForm muscleGroup={muscle} />
      </Card>

      <div className="space-y-2">
        {exercises.length === 0 && (
          <p className="text-[var(--muted-foreground)] text-sm">
            Aún no tienes ejercicios para este grupo.
          </p>
        )}
        {exercises.map((e) => {
          const last = e.sets[0];
          return (
            <Link key={e.id} href={`/ejercicios/${e.id}`}>
              <Card className="flex items-center justify-between hover:shadow-md transition cursor-pointer py-3">
                <div>
                  <div className="font-medium">{e.name}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {e._count.sets} registros
                    {last && ` · último: ${last.weight}kg × ${last.reps}`}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
