"use client";

import { useParams } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteSet } from "./actions";

export function DeleteSetButton({ setId }: { setId: string }) {
  const params = useParams<{ id: string }>();
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => {
        if (confirm("¿Borrar este registro?")) {
          startTransition(() => deleteSet(setId, params.id));
        }
      }}
      disabled={pending}
      className="text-[var(--muted-foreground)] hover:text-rose-600 p-1 cursor-pointer disabled:opacity-50"
      aria-label="Borrar set"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
