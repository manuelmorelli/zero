import { Check } from "lucide-react";
import { FadeImage } from "@/components/common/FadeImage";
import { ComingSoonButton } from "@/components/community/ComingSoonButton";
import { GiftMonthPanel } from "@/components/community/GiftMonthPanel";
import { TipPanel } from "@/components/community/TipPanel";
import { PageTitle } from "@/components/ui/heading";
import { PANEL_ACCENT } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

/** What every subscriber gets each month. Copy is in English, like the rest of the site. */
const BENEFITS = [
  "Exclusive content every month",
  "Walk the Path With Me: a challenge you take on alongside the creator",
  "Members room, with written answers from the creator",
];

type SubscribeCardProps = {
  name: string;
  username: string;
  avatarUrl: string | null;
  /** Price chosen by the creator, e.g. "€7 per month". Null while no price is set. */
  priceLabel: string | null;
};

export function SubscribeCard({ name, username, avatarUrl, priceLabel }: SubscribeCardProps) {
  return (
    <section className={cn(PANEL_ACCENT, "mx-auto max-w-4xl sm:p-8")}>
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-surface-2">
          {avatarUrl ? (
            <FadeImage src={avatarUrl} alt={name} fill sizes="48px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-ink-muted">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <PageTitle className="truncate">{name}</PageTitle>
          <p className="truncate text-sm text-ink-muted">@{username}</p>
        </div>
      </div>

      <ul className="mt-5 space-y-2.5">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2.5 text-sm text-ink">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-ember" aria-hidden="true" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-sm text-ink-muted">
        Cancel anytime. If nothing new is published in a month, that month is free.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <ComingSoonButton className="hover:shadow-glow-strong">
          {priceLabel ? `Subscribe, ${priceLabel}` : "Subscribe"}
        </ComingSoonButton>
        <GiftMonthPanel />
        <TipPanel />
      </div>
    </section>
  );
}
