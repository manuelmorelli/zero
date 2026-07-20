import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reimposta la tua password — Zero",
        html: `<p>Ciao ${user.name},</p><p>Hai chiesto di reimpostare la password del tuo account Zero. Clicca sul link qui sotto per sceglierne una nuova:</p><p><a href="${url}">${url}</a></p><p>Se non sei stato tu, ignora questa email: la tua password resterà invariata.</p>`,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Conferma la tua email — Zero",
        html: `<p>Ciao ${user.name},</p><p>Conferma il tuo indirizzo email per attivare il tuo account Zero:</p><p><a href="${url}">${url}</a></p>`,
      });
    },
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  user: {
    fields: {
      // il progetto usa "avatarUrl" invece del nome campo di default "image"
      image: "avatarUrl",
    },
  },
  plugins: [nextCookies()],
});
