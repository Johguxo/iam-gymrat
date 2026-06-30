import { Card } from "@/components/ui";
import { prisma } from "@/lib/db";
import { DAYS_ES } from "@/lib/muscle-groups";
import { RoutineEditor } from "./routine-editor";
import { requireUserId } from "@/auth";

export const dynamic = "force-dynamic";

export default async function RutinaPage() {
  const userId = await requireUserId();
  const rows = await prisma.routineDay.findMany({
    where: { userId },
    orderBy: { dayOfWeek: "asc" },
  });
  const byDay = new Map(rows.map((r) => [r.dayOfWeek, r.muscleGroups]));

  return (
    <div className="max-w-md mx-auto">
      <header className="mb-5">
        <h1 className="text-[26px] font-semibold tracking-tight">Mi rutina semanal</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
          Define qué grupos musculares trabajas cada día.
        </p>
      </header>

      <div className="grid gap-2.5">
        {DAYS_ES.map((label, day) => {
          const groups = byDay.get(day) ?? [];
          const isRest = groups.length === 0;
          return (
            <Card key={day} className="rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-[15px]">{label}</div>
                <span
                  className={`text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full ${
                    isRest
                      ? "bg-[var(--muted)] text-[var(--muted-foreground)]"
                      : "bg-[var(--accent-soft)] text-[var(--accent)]"
                  }`}
                >
                  {isRest ? "DESCANSO" : `${groups.length} ${groups.length === 1 ? "GRUPO" : "GRUPOS"}`}
                </span>
              </div>
              <RoutineEditor dayOfWeek={day} initial={groups} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
