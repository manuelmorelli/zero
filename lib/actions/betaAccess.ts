"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BETA_ACCESS_COOKIE } from "@/lib/betaAccess";

const ONE_HUNDRED_EIGHTY_DAYS_SECONDS = 60 * 60 * 24 * 180;

/** Il valore del cookie è il codice stesso: cambiare BETA_ACCESS_CODE su Vercel invalida subito
 * tutti i cookie già distribuiti, senza bisogno di una lista di inviti da gestire. */
export async function redeemBetaCode(formData: FormData): Promise<{ error: string } | void> {
  const code = (formData.get("code") as string | null)?.trim() ?? "";
  const expected = process.env.BETA_ACCESS_CODE;

  if (!expected || code !== expected) {
    return { error: "Codice non valido." };
  }

  const cookieStore = await cookies();
  cookieStore.set(BETA_ACCESS_COOKIE, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_HUNDRED_EIGHTY_DAYS_SECONDS,
  });

  redirect("/");
}
