"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { routineDaySchema } from "@/lib/validation";
import { MuscleGroup } from "@prisma/client";

export async function setRoutineDay(dayOfWeek: number, muscleGroups: string[]) {
  const parsed = routineDaySchema.parse({ dayOfWeek, muscleGroups });
  await prisma.routineDay.upsert({
    where: { dayOfWeek: parsed.dayOfWeek },
    update: { muscleGroups: parsed.muscleGroups as MuscleGroup[] },
    create: { dayOfWeek: parsed.dayOfWeek, muscleGroups: parsed.muscleGroups as MuscleGroup[] },
  });
  revalidatePath("/rutina");
  revalidatePath("/");
}
