type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Invia un'email tramite Resend. Se RESEND_API_KEY non è ancora configurata,
 * stampa il contenuto in console: permette di testare i flussi (reset password,
 * verifica email) in sviluppo prima che l'account Resend sia collegato.
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[email] RESEND_API_KEY not configured — email not sent.
To: ${to}
Subject: ${subject}
${html}`);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "Zero <onboarding@resend.dev>", // TODO: sostituire con un dominio verificato su Resend
    to,
    subject,
    html,
  });

  // resend.emails.send() non lancia un'eccezione in caso di errore: lo fa qui,
  // altrimenti un fallimento di invio passerebbe inosservato.
  if (error) {
    throw new Error(`Invio email fallito: ${error.message}`);
  }
}
