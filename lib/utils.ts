/** Formats large counts compactly, e.g. 24000 -> "24K". */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(
    value
  );
}
