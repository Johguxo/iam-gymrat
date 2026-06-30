import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, Dumbbell } from "lucide-react";
import { Card } from "@/components/ui";
import { ExerciseForm } from "./exercise-form";
import { SLUG_TO_MUSCLE, MUSCLE_LABEL } from "@/lib/muscle-groups";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/auth";

export const dynamic = "force-dynamic";

export default async function GrupoPage({ params }: { params: Promise<{ group: string }> }) {
  const userId = await requireUserId();
  const { group } = await params;
  const muscle = SLUG_TO_MUSCLE[group];
  if (!muscle) notFound();

  const exercises = await prisma.exercise.findMany({
    where: { userId, muscleGroup: muscle },
    orderBy: { createdAt: "desc" },
    include: {
      sets: { orderBy: { performedAt: "desc" }, take: 1 },
      _count: { select: { sets: true } },
    },
  });

  return (
    <div className="max-w-md mx-auto">
      <Link
        href="/grupos"
        className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--muted)] mb-3"
        aria-label="Volver"
      >
        <ArrowLeft className="w-4 h-4" />
      </Link>

      <header className="mb-5">
        <h1 className="text-[26px] font-semibold tracking-tight">{MUSCLE_LABEL[muscle]}</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
          {exercises.length} ejercicio{exercises.length === 1 ? "" : "s"}
        </p>
      </header>

      <Card className="mb-4">
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-[var(--muted-foreground)] mb-3">
          AÑADIR EJERCICIO
        </h2>
        <ExerciseForm muscleGroup={muscle} />
      </Card>

      <div className="space-y-2">
        {exercises.length === 0 && (
          <p className="text-sm text-[var(--muted-foreground)] py-4 text-center">
            Aún no tienes ejercicios para este grupo.
          </p>
        )}
        {exercises.map((e) => {
          const last = e.sets[0];
          return (
            <Link key={e.id} href={`/ejercicios/${e.id}`}>
              <Card className="flex items-center gap-3 py-3.5 rounded-2xl">
                <span className="w-9 h-9 rounded-xl bg-[var(--muted)] flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[14px] truncate">{e.name}</div>
                  <div className="text-xs font-medium text-[var(--muted-foreground)] mt-0.5">
                    {e._count.sets} registros
                    {last && ` · última ${last.weight} kg × ${last.reps}`}
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
