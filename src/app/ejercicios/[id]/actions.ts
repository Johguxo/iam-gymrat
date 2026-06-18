"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { setSchema } from "@/lib/validation";
import { lbsToKg } from "@/lib/utils";
import { requireUserId } from "@/auth";

async function assertOwnsExercise(exerciseId: string, userId: string) {
  const owned = await prisma.exercise.findFirst({
    where: { id: exerciseId, userId },
    select: { id: true },
  });
  if (!owned) throw new Error("FORBIDDEN");
}

export async function registrarSet(formData: FormData) {
  const userId = await requireUserId();
  const parsed = setSchema.parse({
    exerciseId: formData.get("exerciseId"),
    weight: formData.get("weight"),
    reps: formData.get("reps"),
    sets: formData.get("sets"),
    performedAt: formData.get("performedAt") || undefined,
    notes: formData.get("notes") || null,
  });
  await assertOwnsExercise(parsed.exerciseId, userId);
  const unit = formData.get("unit") === "lbs" ? "lbs" : "kg";
  const weightKg = unit === "lbs" ? lbsToKg(parsed.weight) : parsed.weight;
  await prisma.workoutSet.create({
    data: {
      exerciseId: parsed.exerciseId,
      weight: weightKg,
      reps: parsed.reps,
      sets: parsed.sets,
      performedAt: parsed.performedAt,
      notes: parsed.notes ?? null,
    },
  });
  revalidatePath(`/ejercicios/${parsed.exerciseId}`);
  revalidatePath("/");
}

export async function deleteSet(setId: string, exerciseId: string) {
  const userId = await requireUserId();
  await assertOwnsExercise(exerciseId, userId);
  await prisma.workoutSet.delete({ where: { id: setId } });
  revalidatePath(`/ejercicios/${exerciseId}`);
}
