import { Fragment } from "react";

/**
 * Renderizza un testo dove le parti tra **doppi asterischi** diventano evidenziate
 * (arancione, grassetto), per far risaltare i punti importanti nelle pagine legali
 * (Privacy, Termini, Cookie, Community Guidelines) senza dover spezzare ogni
 * paragrafo in JSX a mano.
 */
export function HighlightedText({ text }: { text: string }) {
  const parts = text.split("**");
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <strong key={index} className="font-semibold text-ember">
            {part}
          </strong>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        )
      )}
    </>
  );
}
