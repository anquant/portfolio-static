/*
 * Contact channels shown on the contacts page. Values travel to the page
 * encoded (see obfuscate.ts) and are decoded in the browser; `masked` is the
 * placeholder shown until the visitor asks to reveal it, null = show as soon
 * as decoded.
 */

export type ContactKind = 'email' | 'phone' | 'telegram';

export type ContactItem = { kind: ContactKind; encoded: string; masked: string | null };

/** What the visitor sees and copies: "@pavelmoses" for a Telegram username */
export function contactText(kind: ContactKind, value: string): string {
  return kind === 'telegram' ? `@${value}` : value;
}

/** Link that opens the channel */
export function contactHref(kind: ContactKind, value: string): string {
  switch (kind) {
    case 'email':
      return `mailto:${value}`;
    case 'phone':
      return `tel:${value.replace(/[^\d+]/g, '')}`;
    case 'telegram':
      return `https://t.me/${value}`;
  }
}
