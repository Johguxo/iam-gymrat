# Distribución de la UI

Documento de referencia sobre cómo está organizada la interfaz de GymRat.

## Stack visual

- **Next.js App Router** (`src/app/`) con Server Components por defecto y Client Components solo para formularios/gráficas interactivas.
- **Tailwind CSS v4** (`@import "tailwindcss"` en `src/app/globals.css`) usando tokens vía variables CSS.
- **lucide-react** para iconografía.
- **Fuente** Geist Sans cargada en `src/app/layout.tsx`.

## Tokens de diseño

Definidos en `src/app/globals.css` como variables CSS, con tema claro/oscuro automático por `prefers-color-scheme`:

| Token | Propósito |
|---|---|
| `--background` / `--foreground` | Fondo y texto base |
| `--card` | Superficie de tarjetas y barras |
| `--border` | Bordes sutiles |
| `--muted` / `--muted-foreground` | Fondos secundarios y texto atenuado |
| `--primary` / `--primary-foreground` | Acciones principales |

Las clases de Tailwind los consumen con la sintaxis `bg-[var(--card)]`, `text-[var(--muted-foreground)]`, etc. Para colores semánticos extra (errores, peligro) se usan utilidades directas de Tailwind como `text-rose-600` o `bg-rose-600`.

## Layout global

`src/app/layout.tsx` arma el shell de la app:

- **Header (desktop, ≥sm)**: logo, navegación principal, nombre del usuario y botón de salir. Oculto en móvil (`hidden sm:block`).
- **Main**: contenedor centrado `max-w-5xl mx-auto px-4 sm:px-6 py-6` que envuelve el contenido de cada ruta.
- **Bottom nav (móvil, <sm)**: barra fija inferior (`fixed bottom-0`) con los mismos enlaces + Salir. El `body` reserva espacio con `pb-20 sm:pb-0`.
- La navegación y el botón de salir solo se renderizan si hay sesión activa (`auth()`).

Items de navegación (`NAV` en `layout.tsx`):

- `/` — Inicio
- `/grupos` — Grupos musculares
- `/rutina` — Rutina semanal
- `/estadisticas` — Stats

## Primitivos UI

`src/components/ui.tsx` exporta los building blocks compartidos. Todos aceptan `className` y se componen con `cn()` de `src/lib/utils.ts`.

- **`Card`** — `div` con `rounded-xl`, borde, fondo `--card`, padding `p-5` y sombra ligera. Es el contenedor base para casi todas las secciones.
- **`Button`** — variantes `primary | ghost | outline | danger`. Tamaño único (`px-4 py-2 text-sm`). Estados `disabled` reducen opacidad.
- **`Input`** — `w-full`, borde, focus ring con `--primary/20`.
- **`Label`** — texto pequeño en bold, bloque, margen inferior.
- **`Badge`** — píldora `rounded-full` con borde, para tags y contadores.

Cualquier elemento que no sea uno de estos se construye ad-hoc con Tailwind directamente en la página (ej. headers de tarjetas, listas).

## Estructura por ruta

Cada ruta sigue el mismo patrón:

```
src/app/<ruta>/
  page.tsx          ← Server Component, hace queries (Prisma) y compone UI
  actions.ts        ← Server Actions (mutations) cuando aplica
  <feature>-form.tsx, <feature>-chart.tsx, …  ← Client Components puntuales
```

Rutas actuales:

- **`/login`**, **`/registro`**, **`/olvide-contrasena`** — públicas (`PUBLIC_PATHS` en `src/auth.config.ts`). Render centrado vertical con `min-h-[70vh] flex items-center justify-center` y `Card` `max-w-sm`.
- **`/` (`page.tsx` + `today-routine.tsx` + `recent-date.tsx`)** — dashboard del día.
- **`/grupos`** y **`/grupos/[group]`** — listado y detalle por grupo muscular, formulario para crear ejercicios.
- **`/ejercicios/[id]`** — detalle de ejercicio con formulario de sets, gráfica de progreso y borrado.
- **`/rutina`** — editor de rutina semanal.
- **`/estadisticas`** — métricas con `volume-chart.tsx`.

## Convenciones de páginas

- Usar `Card` como contenedor principal de cada bloque visual.
- Páginas de auth: `Card` `max-w-sm`, centrado en viewport, links secundarios en `text-sm text-[var(--muted-foreground)]` con `underline`.
- Formularios: `grid gap-3`, cada campo con `<Label>` + `<Input>`. Errores en `<p className="text-sm text-rose-600">`. Botón submit muestra estado pending (`"Entrando..."`, `"Cambiando..."`, etc.).
- Iconos lucide a `w-4 h-4` (inline) o `w-5 h-5` (nav móvil/header).
- Anchos máximos: contenedores generales `max-w-5xl`, tarjetas de auth `max-w-sm`.

## Responsive

- Breakpoint principal: `sm` (640px).
- Móvil → bottom nav fija, padding inferior en el body, header oculto.
- Desktop → header superior, sin bottom nav.
- Contenido principal usa `px-4 sm:px-6` y nunca excede `max-w-5xl`.

## Cómo agregar UI nueva

1. Si es un patrón reutilizable (botón, input, badge, etc.) → agrega o extiende en `src/components/ui.tsx`.
2. Si es específico de una ruta → crea un componente en `src/app/<ruta>/`.
3. Usa siempre las variables CSS de tema en lugar de colores hardcoded, salvo estados semánticos (rose para errores).
4. Envuelve secciones en `Card` para mantener consistencia visual.
5. Si la ruta debe ser pública, añádela a `PUBLIC_PATHS` en `src/auth.config.ts`.
