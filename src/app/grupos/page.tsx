import Link from "next/link";
import { Card } from "@/components/ui";
import { MUSCLE_GROUPS, MUSCLE_LABEL, MUSCLE_SLUG, MUSCLE_COLOR } from "@/lib/muscle-groups";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/auth";

export const dynamic = "force-dynamic";

export default async function GruposPage() {
  const userId = await requireUserId();
  const counts = await prisma.exercise.groupBy({
    by: ["muscleGroup"],
    where: { userId },
    _count: { _all: true },
  });
  const countMap = new Map(counts.map((c) => [c.muscleGroup, c._count._all]));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Grupos musculares</h1>
      <p className="text-[var(--muted-foreground)] mb-6">
        Elige un grupo para ver tus ejercicios.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {MUSCLE_GROUPS.map((g) => (
          <Link key={g} href={`/grupos/${MUSCLE_SLUG[g]}`}>
            <Card className="hover:shadow-md transition cursor-pointer">
              <div className={`inline-flex rounded-md px-2 py-1 text-xs font-medium border ${MUSCLE_COLOR[g]}`}>
                {MUSCLE_LABEL[g]}
              </div>
              <div className="mt-3 text-2xl font-bold">{countMap.get(g) ?? 0}</div>
              <div className="text-xs text-[var(--muted-foreground)]">ejercicios</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
