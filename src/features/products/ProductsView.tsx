"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Leaf, Droplet, Snowflake } from "lucide-react";
import { CustomerHeader } from "@/components/pf/layout/CustomerHeader";
import { PfBadge, PfButton, PfCard, PfSectionTitle } from "@/components/pf";
import { PLANS } from "@/features/plans/constants";

const HIGHLIGHTS = [
  { icon: Leaf, label: "100% A2 Beta-Casein" },
  { icon: Snowflake, label: "Chilled at 4°C" },
  { icon: Droplet, label: "No preservatives" },
];

export function ProductsView() {
  return (
    <>
      <CustomerHeader
        title="Products"
        subtitle="Farm-fresh A2 Gir cow milk, delivered to your doorstep every morning."
      />

      <section className="mb-10">
        <article className="relative overflow-hidden rounded-[22px] bg-[var(--pf-surface)] border border-[var(--pf-border)] shadow-[var(--pf-shadow-card)]">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6">
            <div className="p-7 sm:p-9 flex flex-col justify-center">
              <PfBadge tone="brand">Signature</PfBadge>
              <h2 className="mt-4 text-[32px] sm:text-[40px] font-bold text-[var(--pf-text)] leading-[1.05] tracking-tight">
                Pure A2 Desi Gir Cow Milk
              </h2>
              <p className="mt-3 text-[15px] text-[var(--pf-text-secondary)] leading-relaxed max-w-md">
                Raw, unadulterated milk from indigenous Gir cows raised on open
                pasture. Delivered chilled, in sealed glass bottles, before 10 AM.
              </p>

              <ul className="mt-6 flex flex-wrap gap-2.5">
                {HIGHLIGHTS.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[var(--pf-surface-soft)] text-[12px] font-semibold text-[var(--pf-text-secondary)] border border-[var(--pf-border)]"
                  >
                    <Icon size={14} strokeWidth={1.75} className="text-[var(--pf-brown)]" />
                    {label}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex items-center gap-3 flex-wrap">
                <PfButton href="/plan">Choose your plan</PfButton>
                <Link
                  href="/delivery"
                  className="pf-focus-ring inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--pf-brown)] hover:text-[var(--pf-brown-hover)]"
                >
                  Check delivery
                  <ArrowRight size={15} strokeWidth={2} />
                </Link>
              </div>
            </div>

            <div className="relative min-h-[260px] bg-gradient-to-br from-[var(--pf-surface-soft)] to-[var(--pf-beige)]">
              <Image
                src="/puretyfarm-bottle-trimmed.webp"
                alt="PuretyFarm A2 milk bottle"
                fill
                sizes="(min-width: 1024px) 480px, 100vw"
                className="object-contain object-center p-6"
                priority={false}
              />
            </div>
          </div>
        </article>
      </section>

      <section>
        <PfSectionTitle
          title="Available plans"
          description="Pick the rhythm that fits your home. Change or cancel any time."
        />
        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <ProductCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <PfCard padding="lg">
          <div className="grid md:grid-cols-3 gap-6">
            <Fact
              title="Delivered fresh"
              body="Milked at dawn and delivered to your doorstep before 10 AM in sealed, sanitized glass bottles."
            />
            <Fact
              title="Zero plastic"
              body="Reusable glass bottles, picked up on the next morning run. No cartons, no single-use packaging."
            />
            <Fact
              title="Pause & skip"
              body="Travelling? Pause your plan or skip a day on WhatsApp. We'll handle the rest."
            />
          </div>
        </PfCard>
      </section>
    </>
  );
}

function ProductCard({ plan }: { plan: (typeof PLANS)[number] }) {
  return (
    <article className="flex flex-col h-full rounded-[20px] p-6 bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-border-strong)] transition-colors">
      <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
        {plan.badge}
      </div>
      <h3 className="mt-2 text-[20px] font-bold text-[var(--pf-text)] leading-[1.2]">
        {plan.name}
      </h3>
      <p className="mt-1 text-[13px] text-[var(--pf-text-secondary)] leading-relaxed">
        {plan.description}
      </p>

      <div className="mt-5 pt-5 border-t border-[var(--pf-border)]">
        <div className="flex items-baseline gap-2">
          <span className="text-[26px] font-bold text-[var(--pf-text)] leading-none">
            ₹{plan.price.toLocaleString("en-IN")}
          </span>
          <span className="text-[12px] text-[var(--pf-text-muted)] font-semibold">
            {plan.periodLabel}
          </span>
        </div>
        <div className="mt-1 text-[12px] text-[var(--pf-text-muted)]">
          {plan.rateText}
        </div>
      </div>

      <ul className="mt-4 space-y-2 flex-1">
        {plan.features.slice(0, 4).map((f, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[12.5px] text-[var(--pf-text-secondary)] leading-snug"
          >
            <CheckCircle2 size={13} strokeWidth={2} className="text-[var(--pf-brown)] mt-0.5 shrink-0" />
            <span>{f.text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <PfButton href="/plan" fullWidth variant={plan.highlighted ? "primary" : "secondary"}>
          {plan.highlighted ? plan.ctaText : "Choose this plan"}
        </PfButton>
      </div>
    </article>
  );
}

function Fact({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-[15px] font-bold text-[var(--pf-text)]">{title}</h3>
      <p className="mt-1.5 text-[13px] text-[var(--pf-text-secondary)] leading-relaxed">
        {body}
      </p>
    </div>
  );
}
