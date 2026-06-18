"use client";

import { useActionState } from "react";
import { Button, Input, Label } from "@/components/ui";
import { registerAction } from "./actions";

export function RegisterForm() {
  const [error, formAction, pending] = useActionState(registerAction, null);

  return (
    <form action={formAction} className="grid gap-3">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>
      <div>
        <Label htmlFor="age">Edad</Label>
        <Input id="age" name="age" type="number" min={10} max={120} required />
      </div>
      <div>
        <Label htmlFor="email">Correo</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="password">Contraseña</Label>
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
        {pending ? "Creando..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
