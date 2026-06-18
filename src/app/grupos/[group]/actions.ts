"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { exerciseSchema } from "@/lib/validation";
import { requireUserId } from "@/auth";
import { MuscleGroup } from "@prisma/client";

export async function createExercise(formData: FormData) {
  const userId = await requireUserId();
  const parsed = exerciseSchema.parse({
    name: formData.get("name"),
    muscleGroup: formData.get("muscleGroup"),
    notes: formData.get("notes") || null,
  });
  await prisma.exercise.create({
    data: {
      userId,
      name: parsed.name,
      muscleGroup: parsed.muscleGroup as MuscleGroup,
      notes: parsed.notes ?? null,
    },
  });
  revalidatePath(`/grupos`);
  revalidatePath(`/grupos/[group]`, "page");
}
