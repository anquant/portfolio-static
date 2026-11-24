import { describe, expect, it } from 'vitest';

import { displayHost } from './url';

describe('displayHost', () => {
  it.each([
    ['https://www.hl-spb.ru/', 'hl-spb.ru'],
    ['https://igem.ru/path?q=1', 'igem.ru'],
    ['quantumtec.eu', 'quantumtec.eu'],
    ['http://sub.example.com', 'sub.example.com'],
  ])('%s → %s', (link, host) => {
    expect(displayHost(link)).toBe(host);
  });

  it('never throws on garbage, it echoes the input', () => {
    expect(displayHost('not a url')).toBe('not a url');
  });
});
