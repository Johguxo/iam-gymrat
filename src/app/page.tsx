import { MuscleGroup } from "@prisma/client";
import { prisma } from "@/lib/db";
import { HomeView } from "./home-view";
import { requireUserId } from "@/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const userId = await requireUserId();
  const since = new Date();
  since.setDate(since.getDate() - 60);

  const [user, routineRows, exercises, recentSets] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.routineDay.findMany({ where: { userId } }),
    prisma.exercise.findMany({ where: { userId }, select: { muscleGroup: true } }),
    prisma.workoutSet.findMany({
      where: { exercise: { userId }, performedAt: { gte: since } },
      select: { performedAt: true },
      orderBy: { performedAt: "desc" },
    }),
  ]);

  const routineByDay: Record<number, MuscleGroup[]> = {};
  for (const r of routineRows) routineByDay[r.dayOfWeek] = r.muscleGroups;

  const exercisesByGroup: Record<string, number> = {};
  for (const e of exercises) {
    exercisesByGroup[e.muscleGroup] = (exercisesByGroup[e.muscleGroup] ?? 0) + 1;
  }

  const workoutDays = Array.from(
    new Set(recentSets.map((s) => s.performedAt.toISOString().slice(0, 10))),
  );

  return (
    <HomeView
      name={user?.name ?? null}
      routineByDay={routineByDay}
      exercisesByGroup={exercisesByGroup}
      workoutDays={workoutDays}
    />
  );
}
