import { MuscleGroup } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/auth";
import { SessionRunner, type SessionExercise } from "./session-runner";

export const dynamic = "force-dynamic";

export default async function SesionPage() {
  const userId = await requireUserId();
  const routineRows = await prisma.routineDay.findMany({ where: { userId } });
  const routineByDay: Record<number, MuscleGroup[]> = {};
  for (const r of routineRows) routineByDay[r.dayOfWeek] = r.muscleGroups;

  const allExercises = await prisma.exercise.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { sets: { orderBy: { performedAt: "desc" }, take: 1 } },
  });

  const exercisesByGroup: Record<string, SessionExercise[]> = {};
  for (const e of allExercises) {
    const last = e.sets[0];
    (exercisesByGroup[e.muscleGroup] ??= []).push({
      id: e.id,
      name: e.name,
      muscleGroup: e.muscleGroup,
      lastWeight: last?.weight ?? null,
      lastReps: last?.reps ?? null,
    });
  }

  return <SessionRunner routineByDay={routineByDay} exercisesByGroup={exercisesByGroup} />;
}
