import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui";
import { MUSCLE_GROUPS, MUSCLE_LABEL, MUSCLE_SLUG } from "@/lib/muscle-groups";
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
    <div className="max-w-md mx-auto">
      <header className="mb-5">
        <h1 className="text-[26px] font-semibold tracking-tight">Grupos musculares</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
          Elige un grupo para ver tus ejercicios.
        </p>
      </header>
      <div className="grid gap-2.5">
        {MUSCLE_GROUPS.map((g) => {
          const count = countMap.get(g) ?? 0;
          return (
            <Link key={g} href={`/grupos/${MUSCLE_SLUG[g]}`}>
              <Card className="flex items-center gap-4 py-4">
                <div className="flex-1">
                  <div className="font-semibold text-[15px]">{MUSCLE_LABEL[g]}</div>
                  <div className="text-xs font-medium text-[var(--muted-foreground)] mt-0.5">
                    {count} ejercicio{count === 1 ? "" : "s"}
                  </div>
                </div>
                <span className="font-mono font-semibold text-2xl tabular-nums">
                  {count}
                </span>
                <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
