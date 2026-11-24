import { describe, expect, it } from 'vitest';

import { contactHref, contactText } from './contact';

describe('contact links', () => {
  it.each([
    ['email', 'inbox@moiseevp.ru', 'mailto:inbox@moiseevp.ru', 'inbox@moiseevp.ru'],
    ['phone', '+7 (921) 123-45-67', 'tel:+79211234567', '+7 (921) 123-45-67'],
    ['telegram', 'pavelmoses', 'https://t.me/pavelmoses', '@pavelmoses'],
  ] as const)('%s', (kind, value, href, text) => {
    expect(contactHref(kind, value)).toBe(href);
    expect(contactText(kind, value)).toBe(text);
  });
});
