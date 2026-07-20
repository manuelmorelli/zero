import { createAuthClient } from "better-auth/react";

// Nessun baseURL: il client chiama /api/auth sullo stesso dominio da cui è servita la pagina.
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
