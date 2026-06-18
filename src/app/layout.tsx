import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { Dumbbell, Home, Calendar, BarChart3, LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GymRat — Mi entrenamiento",
  description: "Registra tus pesos y sigue tu progreso",
};

const NAV = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/grupos", label: "Grupos", icon: Dumbbell },
  { href: "/rutina", label: "Rutina", icon: Calendar },
  { href: "/estadisticas", label: "Stats", icon: BarChart3 },
];

async function logout() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;

  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col pb-20 sm:pb-0">
        {user && (
          <header className="hidden sm:block border-b border-[var(--border)] bg-[var(--card)]">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
              <Link href="/" className="font-bold text-lg flex items-center gap-2">
                <Dumbbell className="w-5 h-5" /> GymRat
              </Link>
              <nav className="flex gap-1 items-center">
                {NAV.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="px-3 py-2 rounded-md text-sm hover:bg-[var(--muted)] flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </Link>
                ))}
                <span className="mx-2 text-sm text-[var(--muted-foreground)]">
                  {user.name}
                </span>
                <form action={logout}>
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-md text-sm hover:bg-[var(--muted)] flex items-center gap-2 cursor-pointer"
                    aria-label="Salir"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </form>
              </nav>
            </div>
          </header>
        )}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">{children}</main>
        {user && (
          <nav className="sm:hidden fixed bottom-0 inset-x-0 border-t border-[var(--border)] bg-[var(--card)] flex justify-around">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex-1 py-3 flex flex-col items-center gap-1 text-xs"
              >
                <Icon className="w-5 h-5" /> {label}
              </Link>
            ))}
            <form action={logout} className="flex-1">
              <button
                type="submit"
                className="w-full h-full py-3 flex flex-col items-center gap-1 text-xs cursor-pointer"
              >
                <LogOut className="w-5 h-5" /> Salir
              </button>
            </form>
          </nav>
        )}
      </body>
    </html>
  );
}
