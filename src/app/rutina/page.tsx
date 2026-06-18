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
    <div>
      <h1 className="text-2xl font-bold mb-1">Mi rutina semanal</h1>
      <p className="text-[var(--muted-foreground)] mb-6">
        Define qué grupos musculares trabajas cada día.
      </p>
      <div className="grid gap-3">
        {DAYS_ES.map((label, day) => (
          <Card key={day}>
            <div className="font-semibold mb-3">{label}</div>
            <RoutineEditor dayOfWeek={day} initial={byDay.get(day) ?? []} />
          </Card>
        ))}
      </div>
    </div>
  );
}
