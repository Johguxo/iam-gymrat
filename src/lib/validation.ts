import { z } from "zod";
import { MUSCLE_GROUPS } from "./muscle-groups";

export const exerciseSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(80),
  muscleGroup: z.enum(MUSCLE_GROUPS as [string, ...string[]]),
  notes: z.string().max(500).optional().nullable(),
});

export const setSchema = z.object({
  exerciseId: z.string().min(1),
  weight: z.coerce.number().min(0).max(1000),
  reps: z.coerce.number().int().min(1).max(200),
  sets: z.coerce.number().int().min(1).max(20),
  performedAt: z.coerce.date().optional(),
  notes: z.string().max(500).optional().nullable(),
});

export const routineDaySchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  muscleGroups: z.array(z.enum(MUSCLE_GROUPS as [string, ...string[]])),
});
