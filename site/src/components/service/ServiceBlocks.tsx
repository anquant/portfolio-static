import { FiPlus } from 'react-icons/fi';

import type { ServiceFile } from '@/lib/content/schemas';
import { formatPrice } from '@/lib/i18n';
import { useLocale } from '@/lib/use-locale';

import Reveal from '../Reveal';
import SectionHeader from '../SectionHeader';

/*
 * Content blocks of a service page, in reading order: who comes with what,
 * how the work goes, what it costs, answers to the questions people search.
 * Each one is optional and renders only when the service file has it.
 */

const num = (i: number) => String(i + 1).padStart(2, '0');

/** Paragraphs separated by a blank line in content */
function Paragraphs({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {text.split(/\n{2,}/).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

/** Numbered cards: service tasks, About principles */
export function Cards({ title, items }: { title: string; items: { title: string; text: string }[] }) {
  return (
    <section className="section-gap">
      <SectionHeader title={title} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {items.map((item, i) => (
          <Reveal key={i} delay={i * 70} className="flex flex-col rounded-3xl border border-line bg-surface p-6 md:p-8">
            <span className="font-display text-sm font-semibold text-accent">{num(i)}</span>
            <h3 className="t-card mt-6">{item.title}</h3>
            <p className="mt-3 text-muted leading-relaxed">{item.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Process({ title, steps }: NonNullable<ServiceFile['process']>) {
  const { t } = useLocale();

  return (
    <section className="section-gap">
      <SectionHeader title={title} />
      <ol className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <Reveal as="li" key={i} delay={i * 90} className="relative border-t border-line pt-6">
            <span aria-hidden className="absolute -top-[5px] left-0 size-[9px] rounded-full bg-accent" />
            <div className="eyebrow">
              {t.service.step} {num(i)}
            </div>
            <h3 className="t-card mt-3">{step.title}</h3>
            <p className="mt-3 text-muted leading-relaxed">{step.text}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

export function Pricing({ title, note, plans }: NonNullable<ServiceFile['pricing']>) {
  const { locale, t } = useLocale();

  return (
    <section className="section-gap">
      <SectionHeader title={title} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {plans.map((plan, i) => (
          <Reveal
            key={i}
            delay={i * 70}
            className="flex flex-col rounded-3xl border border-line bg-surface p-6 md:p-10"
          >
            <h3 className="t-card">{plan.title}</h3>
            <p className="mt-3 flex-1 text-muted leading-relaxed">{plan.text}</p>
            <div className="mt-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-t border-line pt-6">
              <div>
                {plan.price_from ? (
                  <>
                    <span className="text-muted">{t.service.from} </span>
                    <span className="font-display text-2xl md:text-3xl font-bold">
                      {formatPrice(locale, plan.price_from)}
                    </span>
                    {plan.unit && <span className="text-muted"> {plan.unit}</span>}
                  </>
                ) : (
                  <span className="font-display text-xl font-semibold">{t.service.byEstimate}</span>
                )}
              </div>
              {plan.term && (
                <span className="rounded-full border border-line px-4 py-1.5 text-sm text-muted">{plan.term}</span>
              )}
            </div>
          </Reveal>
        ))}
      </div>
      {note && (
        <Reveal as="p" className="mt-8 max-w-3xl text-muted leading-relaxed">
          {note}
        </Reveal>
      )}
    </section>
  );
}

export function Faq({ title, items }: NonNullable<ServiceFile['faq']>) {
  return (
    <section className="section-gap grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
      <Reveal as="h2" className="t-section lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
        {title}
      </Reveal>
      <div className="lg:col-span-8 divide-y divide-line border-y border-line">
        {items.map((item, i) => (
          <details key={i} className="group">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-lg md:text-xl font-semibold transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
              <h3>{item.question}</h3>
              <FiPlus
                aria-hidden
                className="mt-1 shrink-0 text-muted transition-transform duration-300 group-open:rotate-45"
              />
            </summary>
            <Paragraphs text={item.answer} className="pb-7 pr-10 text-muted leading-relaxed" />
          </details>
        ))}
      </div>
    </section>
  );
}

/** schema.org FAQPage node for the same questions */
export function faqLd(items: NonNullable<ServiceFile['faq']>['items']) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
