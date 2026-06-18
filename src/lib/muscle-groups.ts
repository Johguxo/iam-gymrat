import { MuscleGroup } from "@prisma/client";

export const MUSCLE_GROUPS: MuscleGroup[] = [
  "PECHO",
  "BICEPS",
  "TRICEPS",
  "ESPALDA",
  "HOMBROS",
  "PIERNAS",
];

export const MUSCLE_LABEL: Record<MuscleGroup, string> = {
  PECHO: "Pecho",
  BICEPS: "Bíceps",
  TRICEPS: "Tríceps",
  ESPALDA: "Espalda",
  HOMBROS: "Hombros",
  PIERNAS: "Piernas",
};

export const MUSCLE_SLUG: Record<MuscleGroup, string> = {
  PECHO: "pecho",
  BICEPS: "biceps",
  TRICEPS: "triceps",
  ESPALDA: "espalda",
  HOMBROS: "hombros",
  PIERNAS: "piernas",
};

export const SLUG_TO_MUSCLE: Record<string, MuscleGroup> = Object.fromEntries(
  Object.entries(MUSCLE_SLUG).map(([k, v]) => [v, k as MuscleGroup]),
);

export const MUSCLE_COLOR: Record<MuscleGroup, string> = {
  PECHO: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  BICEPS: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  TRICEPS: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
  ESPALDA: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  HOMBROS: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  PIERNAS: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
};

export const DAYS_ES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
