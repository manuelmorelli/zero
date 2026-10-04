import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const MINIMUM_AGE_YEARS = 16;

function isOldEnough(dateOfBirth: Date, minimumAge: number): boolean {
  const now = new Date();
  const cutoff = new Date(now.getFullYear() - minimumAge, now.getMonth(), now.getDate());
  return dateOfBirth <= cutoff;
}

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
        subject: "Reset your password — Zero",
        html: `<p>Hi ${user.name},</p><p>You asked to reset the password for your Zero account. Click the link below to choose a new one:</p><p><a href="${url}">${url}</a></p><p>If this wasn't you, just ignore this email: your password will stay the same.</p>`,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Confirm your email — Zero",
        html: `<p>Hi ${user.name},</p><p>Confirm your email address to activate your Zero account:</p><p><a href="${url}">${url}</a></p>`,
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
    changeEmail: {
      // Riusa emailVerification.sendVerificationEmail sopra per confermare il nuovo indirizzo
      // (stesso link "/verify-email", vedi Settings > Password & Security).
      enabled: true,
    },
    additionalFields: {
      dateOfBirth: {
        type: "date",
        required: true,
        input: true,
      },
      // Visitatore (false) o Creator (true), scelta esplicita in registrazione (S3, 2026-10-04).
      creatorMode: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const dateOfBirth = (user as { dateOfBirth?: Date }).dateOfBirth;
          if (!dateOfBirth || !isOldEnough(new Date(dateOfBirth), MINIMUM_AGE_YEARS)) {
            throw new APIError("BAD_REQUEST", {
              message: `You must be at least ${MINIMUM_AGE_YEARS} years old to create a Zero account.`,
            });
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
});
