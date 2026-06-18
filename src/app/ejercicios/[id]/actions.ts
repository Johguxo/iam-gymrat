"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { setSchema } from "@/lib/validation";

export async function registrarSet(formData: FormData) {
  const parsed = setSchema.parse({
    exerciseId: formData.get("exerciseId"),
    weight: formData.get("weight"),
    reps: formData.get("reps"),
    sets: formData.get("sets"),
    performedAt: formData.get("performedAt") || undefined,
    notes: formData.get("notes") || null,
  });
  await prisma.workoutSet.create({
    data: {
      exerciseId: parsed.exerciseId,
      weight: parsed.weight,
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
  await prisma.workoutSet.delete({ where: { id: setId } });
  revalidatePath(`/ejercicios/${exerciseId}`);
}
