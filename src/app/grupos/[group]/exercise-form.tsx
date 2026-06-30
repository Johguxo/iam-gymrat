"use client";

import { useRef, useTransition } from "react";
import { Button, Input, Label } from "@/components/ui";
import { createExercise } from "./actions";
import { MuscleGroup } from "@prisma/client";

export function ExerciseForm({ muscleGroup }: { muscleGroup: MuscleGroup }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(fd) =>
        startTransition(async () => {
          await createExercise(fd);
          formRef.current?.reset();
        })
      }
      className="grid gap-3"
    >
      <input type="hidden" name="muscleGroup" value={muscleGroup} />
      <div>
        <Label htmlFor="name" className="sr-only">
          Nombre del ejercicio
        </Label>
        <Input id="name" name="name" placeholder="Ej: Press banca" required />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Añadiendo..." : "Añadir ejercicio"}
      </Button>
    </form>
  );
}
