import Link from "next/link";
import { Card } from "@/components/ui";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Iniciar sesión</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-5">
          Entra a tu cuenta para registrar tu progreso.
        </p>
        <LoginForm />
        <p className="text-sm text-[var(--muted-foreground)] mt-3 text-center">
          <Link href="/olvide-contrasena" className="underline">
            Olvidé mi contraseña
          </Link>
        </p>
        <p className="text-sm text-[var(--muted-foreground)] mt-2 text-center">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="underline">
            Regístrate
          </Link>
        </p>
      </Card>
    </div>
  );
}
