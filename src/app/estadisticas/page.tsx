import { format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui";
import { prisma } from "@/lib/db";
import { MUSCLE_GROUPS, MUSCLE_LABEL } from "@/lib/muscle-groups";
import { VolumeChart } from "./volume-chart";
import { requireUserId } from "@/auth";

export const dynamic = "force-dynamic";

export default async function EstadisticasPage() {
  const userId = await requireUserId();
  const sets = await prisma.workoutSet.findMany({
    where: { exercise: { userId } },
    include: { exercise: true },
    orderBy: { performedAt: "asc" },
  });

  const prByGroup = new Map<string, { exercise: string; weight: number; reps: number }>();
  for (const s of sets) {
    const cur = prByGroup.get(s.exercise.muscleGroup);
    if (!cur || s.weight > cur.weight) {
      prByGroup.set(s.exercise.muscleGroup, {
        exercise: s.exercise.name,
        weight: s.weight,
        reps: s.reps,
      });
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
    <div className="max-w-md mx-auto">
      <header className="mb-5">
        <h1 className="text-[26px] font-semibold tracking-tight">Estadísticas</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Tu progreso general.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-3.5">
        <StatCard label="Sets registrados" value={totalSets.toLocaleString("es")} />
        <StatCard label="Volumen total" value={Math.round(totalVolume).toLocaleString("es")} unit="kg" />
        <StatCard label="Grupos activos" value={`${prByGroup.size}`} unit="/6" />
        <StatCard label="Promedio set" value={totalSets ? Math.round(totalVolume / totalSets).toLocaleString("es") : "0"} unit="kg" />
      </div>

      {volumeData.length >= 2 && (
        <Card className="mb-3.5">
          <h2 className="text-[11px] font-semibold tracking-[0.14em] text-[var(--muted-foreground)] mb-3">
            VOLUMEN SEMANAL
          </h2>
          <VolumeChart data={volumeData} />
        </Card>
      )}

      <Card>
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-[var(--muted-foreground)] mb-3">
          RÉCORDS POR GRUPO
        </h2>
        <div className="flex flex-col">
          {MUSCLE_GROUPS.map((g, i) => {
            const pr = prByGroup.get(g);
            return (
              <div
                key={g}
                className={`flex items-center gap-3 py-3 ${
                  i < MUSCLE_GROUPS.length - 1 ? "border-b border-[var(--border)]" : ""
                }`}
              >
                <span className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </span>
                <span className="flex-1 font-semibold text-[14px]">{MUSCLE_LABEL[g]}</span>
                {pr ? (
                  <div className="text-right">
                    <div className="font-mono font-semibold text-[15px] tabular-nums">
                      {pr.weight} kg × {pr.reps}
                    </div>
                    <div className="text-xs font-medium text-[var(--muted-foreground)] truncate max-w-[160px]">
                      {pr.exercise}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-[var(--muted-foreground)]">
                    sin registro
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs font-medium text-[var(--muted-foreground)]">{label}</div>
      <div className="mt-1.5 font-mono font-semibold text-[26px] tracking-tight tabular-nums">
        {value}
        {unit && (
          <span className="text-sm font-medium text-[var(--muted-foreground)] font-sans ml-1">
            {unit}
          </span>
        )}
      </div>
    </Card>
  );
}
