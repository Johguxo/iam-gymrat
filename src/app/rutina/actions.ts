"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { routineDaySchema } from "@/lib/validation";
import { requireUserId } from "@/auth";
import { MuscleGroup } from "@prisma/client";

export async function setRoutineDay(dayOfWeek: number, muscleGroups: string[]) {
  const userId = await requireUserId();
  const parsed = routineDaySchema.parse({ dayOfWeek, muscleGroups });
  await prisma.routineDay.upsert({
    where: { userId_dayOfWeek: { userId, dayOfWeek: parsed.dayOfWeek } },
    update: { muscleGroups: parsed.muscleGroups as MuscleGroup[] },
    create: {
      userId,
      dayOfWeek: parsed.dayOfWeek,
      muscleGroups: parsed.muscleGroups as MuscleGroup[],
    },
  });
  revalidatePath("/rutina");
  revalidatePath("/");
}
