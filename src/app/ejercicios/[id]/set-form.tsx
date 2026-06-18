"use client";

import { useRef, useTransition } from "react";
import { Button, Input, Label } from "@/components/ui";
import { registrarSet } from "./actions";

export function SetForm({ exerciseId }: { exerciseId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(fd) =>
        startTransition(async () => {
          await registrarSet(fd);
          formRef.current?.reset();
        })
      }
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
    >
      <input type="hidden" name="exerciseId" value={exerciseId} />
      <div>
        <Label htmlFor="weight">Peso (kg)</Label>
        <Input id="weight" name="weight" type="number" step="0.5" min="0" required />
      </div>
      <div>
        <Label htmlFor="reps">Reps</Label>
        <Input id="reps" name="reps" type="number" min="1" required defaultValue={10} />
      </div>
      <div>
        <Label htmlFor="sets">Series</Label>
        <Input id="sets" name="sets" type="number" min="1" required defaultValue={3} />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Guardando..." : "Registrar"}
        </Button>
      </div>
    </form>
  );
}
