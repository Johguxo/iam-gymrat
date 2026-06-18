import Link from "next/link";
import { Card } from "@/components/ui";
import { RegisterForm } from "./register-form";

export default function RegistroPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Crear cuenta</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-5">
          Registra tu progreso y compara con tus amigos.
        </p>
        <RegisterForm />
        <p className="text-sm text-[var(--muted-foreground)] mt-5 text-center">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="underline">
            Inicia sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}
