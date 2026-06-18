"use client";

import { useRef, useState, useTransition } from "react";
import { Button, Input, Label } from "@/components/ui";
import { registrarSet } from "./actions";

export function SetForm({ exerciseId }: { exerciseId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");

  return (
    <form
      ref={formRef}
      action={(fd) =>
        startTransition(async () => {
          await registrarSet(fd);
          formRef.current?.reset();
        })
      }
      className="grid grid-cols-2 sm:grid-cols-5 gap-3"
    >
      <input type="hidden" name="exerciseId" value={exerciseId} />
      <div className="col-span-2 sm:col-span-1">
        <Label htmlFor="unit">Unidad</Label>
        <select
          id="unit"
          name="unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value as "kg" | "lbs")}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
        >
          <option value="kg">kg</option>
          <option value="lbs">lbs</option>
        </select>
      </div>
      <div>
        <Label htmlFor="weight">Peso ({unit})</Label>
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
      <div className="flex items-end col-span-2 sm:col-span-1">
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Guardando..." : "Registrar"}
        </Button>
      </div>
    </form>
  );
}
