import Link from "next/link";
import { Card } from "@/components/ui";
import { ResetForm } from "./reset-form";

export default function OlvideContrasenaPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Cambiar contraseña</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-5">
          Ingresa tu correo y la nueva contraseña.
        </p>
        <ResetForm />
        <p className="text-sm text-[var(--muted-foreground)] mt-5 text-center">
          <Link href="/login" className="underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}
