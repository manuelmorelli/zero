import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { recordDevEmailLink } from "@/lib/devEmailLog";

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
      recordDevEmailLink(user.email, "reset-password", url);
      await sendEmail({
        to: user.email,
        subject: "Reset your password — Zero",
        html: `<p>Hi ${user.name},</p><p>You asked to reset the password for your Zero account. Click the link below to choose a new one:</p><p><a href="${url}">${url}</a></p><p>If this wasn't you, just ignore this email: your password will stay the same.</p>`,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      recordDevEmailLink(user.email, "verify-email", url);
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
  },
  plugins: [nextCookies()],
});
