import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui";
import { prisma } from "@/lib/db";
import { MUSCLE_LABEL, MUSCLE_SLUG, MUSCLE_COLOR } from "@/lib/muscle-groups";
import { kgToLbs } from "@/lib/utils";
import { SetForm } from "./set-form";
import { DeleteSetButton } from "./delete-set-button";
import { ProgressChart } from "./progress-chart";

export const dynamic = "force-dynamic";

export default async function EjercicioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exercise = await prisma.exercise.findUnique({
    where: { id },
    include: { sets: { orderBy: { performedAt: "desc" } } },
  });
  if (!exercise) notFound();

  const chartData = [...exercise.sets]
    .reverse()
    .map((s) => ({
      date: format(s.performedAt, "dd/MM"),
      peso: s.weight,
      reps: s.reps,
    }));

  const max = exercise.sets.reduce((m, s) => (s.weight > m ? s.weight : m), 0);

  return (
    <div>
      <Link
        href={`/grupos/${MUSCLE_SLUG[exercise.muscleGroup]}`}
        className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] mb-3 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> {MUSCLE_LABEL[exercise.muscleGroup]}
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{exercise.name}</h1>
          <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-xs border ${MUSCLE_COLOR[exercise.muscleGroup]}`}>
            {MUSCLE_LABEL[exercise.muscleGroup]}
          </span>
        </div>
        {max > 0 && (
          <Card className="py-3 px-4">
            <div className="text-xs text-[var(--muted-foreground)]">PR actual</div>
            <div className="text-2xl font-bold">{max} kg</div>
            <div className="text-xs text-[var(--muted-foreground)]">{kgToLbs(max)} lbs</div>
          </Card>
        )}
      </div>

      <Card className="mb-6">
        <h2 className="font-semibold mb-3">Registrar set</h2>
        <SetForm exerciseId={exercise.id} />
      </Card>

      {chartData.length >= 2 && (
        <Card className="mb-6">
          <h2 className="font-semibold mb-3">Progreso</h2>
          <ProgressChart data={chartData} />
        </Card>
      )}

      <Card>
        <h2 className="font-semibold mb-3">Historial</h2>
        {exercise.sets.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Aún no has registrado ningún set.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[var(--muted-foreground)]">
                <tr>
                  <th className="py-2 font-medium">Fecha</th>
                  <th className="font-medium">Peso (kg)</th>
                  <th className="font-medium">Peso (lbs)</th>
                  <th className="font-medium">Reps</th>
                  <th className="font-medium">Series</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {exercise.sets.map((s) => (
                  <tr key={s.id} className="border-t border-[var(--border)]">
                    <td className="py-2">
                      {format(s.performedAt, "d MMM yyyy", { locale: es })}
                    </td>
                    <td className="font-medium">{s.weight}</td>
                    <td className="font-medium">{kgToLbs(s.weight)}</td>
                    <td>{s.reps}</td>
                    <td>{s.sets}</td>
                    <td className="text-right">
                      <DeleteSetButton setId={s.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
