"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/auth";

const schema = z.object({
  exerciseId: z.string().min(1),
  weight: z.number().min(0).max(1000),
  reps: z.number().int().min(1).max(200),
  notes: z.string().max(500).nullable().optional(),
});

export async function logSessionSet(input: {
  exerciseId: string;
  weight: number;
  reps: number;
  notes?: string | null;
}) {
  const userId = await requireUserId();
  const parsed = schema.parse(input);
  const owned = await prisma.exercise.findFirst({
    where: { id: parsed.exerciseId, userId },
    select: { id: true },
  });
  if (!owned) throw new Error("FORBIDDEN");
  await prisma.workoutSet.create({
    data: {
      exerciseId: parsed.exerciseId,
      weight: parsed.weight,
      reps: parsed.reps,
      sets: 1,
      notes: parsed.notes ?? null,
    },
  });
  revalidatePath("/");
  revalidatePath(`/ejercicios/${parsed.exerciseId}`);
}
