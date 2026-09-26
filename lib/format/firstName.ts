/** "Manuel" da "Manuel Morelli": solo la prima parola del nome, `null` se il nome è vuoto. */
export function firstNameOf(name: string | null | undefined): string | null {
  return name?.trim().split(/\s+/)[0] || null;
}
