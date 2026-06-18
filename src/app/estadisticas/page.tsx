import { format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { Card } from "@/components/ui";
import { prisma } from "@/lib/db";
import { MUSCLE_GROUPS, MUSCLE_LABEL, MUSCLE_COLOR } from "@/lib/muscle-groups";
import { VolumeChart } from "./volume-chart";

export const dynamic = "force-dynamic";

export default async function EstadisticasPage() {
  const sets = await prisma.workoutSet.findMany({
    include: { exercise: true },
    orderBy: { performedAt: "asc" },
  });

  const prByGroup = new Map<string, { exercise: string; weight: number }>();
  for (const s of sets) {
    const cur = prByGroup.get(s.exercise.muscleGroup);
    if (!cur || s.weight > cur.weight) {
      prByGroup.set(s.exercise.muscleGroup, { exercise: s.exercise.name, weight: s.weight });
    }
  }

  const weekly = new Map<string, number>();
  for (const s of sets) {
    const wk = format(startOfWeek(s.performedAt, { weekStartsOn: 1 }), "dd MMM", { locale: es });
    weekly.set(wk, (weekly.get(wk) ?? 0) + s.weight * s.reps * s.sets);
  }
  const volumeData = Array.from(weekly.entries()).map(([semana, volumen]) => ({ semana, volumen }));

  const totalSets = sets.length;
  const totalVolume = sets.reduce((acc, s) => acc + s.weight * s.reps * s.sets, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Estadísticas</h1>
      <p className="text-[var(--muted-foreground)] mb-6">Tu progreso general.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="text-xs text-[var(--muted-foreground)]">Sets registrados</div>
          <div className="text-2xl font-bold">{totalSets}</div>
        </Card>
        <Card>
          <div className="text-xs text-[var(--muted-foreground)]">Volumen total (kg)</div>
          <div className="text-2xl font-bold">{Math.round(totalVolume).toLocaleString("es")}</div>
        </Card>
        <Card>
          <div className="text-xs text-[var(--muted-foreground)]">Grupos activos</div>
          <div className="text-2xl font-bold">{prByGroup.size} / 6</div>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="font-semibold mb-3">Récords por grupo</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {MUSCLE_GROUPS.map((g) => {
            const pr = prByGroup.get(g);
            return (
              <div key={g} className="flex items-center justify-between gap-3 py-2 border-b border-[var(--border)] last:border-0">
                <span className={`rounded-full px-2.5 py-0.5 text-xs border ${MUSCLE_COLOR[g]}`}>
                  {MUSCLE_LABEL[g]}
                </span>
                {pr ? (
                  <span className="text-sm">
                    <span className="font-bold">{pr.weight} kg</span>{" "}
                    <span className="text-[var(--muted-foreground)]">· {pr.exercise}</span>
                  </span>
                ) : (
                  <span className="text-sm text-[var(--muted-foreground)]">sin registro</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {volumeData.length >= 2 && (
        <Card>
          <h2 className="font-semibold mb-3">Volumen semanal</h2>
          <VolumeChart data={volumeData} />
        </Card>
      )}
    </div>
  );
}
