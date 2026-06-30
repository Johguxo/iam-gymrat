import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Dumbbell, Home, Calendar, BarChart3, LogOut, Plus } from "lucide-react";
import { auth, signOut } from "@/auth";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

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
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col pb-24 sm:pb-0 bg-[var(--background)] text-[var(--foreground)]">
        {user && (
          <header className="hidden sm:block border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
              <Link href="/" className="font-bold text-lg flex items-center gap-2">
                <Dumbbell className="w-5 h-5" /> GymRat
              </Link>
              <nav className="flex gap-1 items-center">
                {NAV.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="px-3 py-2 rounded-xl text-sm hover:bg-[var(--muted)] flex items-center gap-2"
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
                    className="px-3 py-2 rounded-xl text-sm hover:bg-[var(--muted)] flex items-center gap-2 cursor-pointer"
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
          <nav className="sm:hidden fixed bottom-0 inset-x-0 h-20 border-t border-[var(--border)] bg-[var(--card)]/95 backdrop-blur flex items-start pt-2.5 px-2">
            <BottomItem href="/" label="Inicio" icon={Home} />
            <BottomItem href="/grupos" label="Grupos" icon={Dumbbell} />
            <div className="w-14" aria-hidden />
            <BottomItem href="/rutina" label="Rutina" icon={Calendar} />
            <BottomItem href="/estadisticas" label="Stats" icon={BarChart3} />
            <Link
              href="/sesion"
              aria-label="Empezar entrenamiento"
              className="absolute left-1/2 -top-3 -translate-x-1/2 w-14 h-14 rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center shadow-lg shadow-black/30"
            >
              <Plus className="w-7 h-7" />
            </Link>
          </nav>
        )}
        {user && (
          <form
            action={logout}
            className="sm:hidden fixed top-3 right-3 z-10"
          >
            <button
              type="submit"
              aria-label="Salir"
              className="w-10 h-10 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        )}
      </body>
    </html>
  );
}

function BottomItem({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="flex-1 flex flex-col items-center gap-1 text-[var(--muted-foreground)]"
    >
      <Icon className="w-6 h-6" />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
