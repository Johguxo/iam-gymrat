"use client";

import { useActionState } from "react";
import { Button, Input, Label } from "@/components/ui";
import { resetPasswordAction } from "./actions";

export function ResetForm() {
  const [error, formAction, pending] = useActionState(resetPasswordAction, null);

  return (
    <form action={formAction} className="grid gap-3">
      <div>
        <Label htmlFor="email">Correo</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="password">Nueva contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={6}
        />
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Cambiando..." : "Cambiar contraseña"}
      </Button>
    </form>
  );
}
