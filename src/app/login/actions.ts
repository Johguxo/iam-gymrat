"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(_prev: string | null, formData: FormData) {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/",
    });
    return null;
  } catch (err) {
    if (err instanceof AuthError) {
      return "Correo o contraseña incorrectos";
    }
    throw err;
  }
}
