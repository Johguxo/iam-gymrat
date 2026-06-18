"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { signIn } from "@/auth";
import { MUSCLE_GROUPS } from "@/lib/muscle-groups";
import type { MuscleGroup } from "@prisma/client";

const schema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  name: z.string().min(1, "Nombre requerido").max(60),
  age: z.coerce.number().int().min(10).max(120),
});

export async function registerAction(_prev: string | null, formData: FormData) {
  const parsed = schema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: formData.get("password"),
    name: String(formData.get("name") ?? "").trim(),
    age: formData.get("age"),
  });
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos";
  }
  const { email, password, name, age } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return "Ese correo ya está registrado";

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, age },
  });

  await prisma.routineDay.createMany({
    data: Array.from({ length: 7 }, (_, day) => ({
      userId: user.id,
      dayOfWeek: day,
      muscleGroups: [] as MuscleGroup[],
    })),
    skipDuplicates: true,
  });
  void MUSCLE_GROUPS;

  await signIn("credentials", { email, password, redirectTo: "/" });
  return null;
}
