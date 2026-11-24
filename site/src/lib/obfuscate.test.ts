import { describe, expect, it } from 'vitest';

import { decode, encode, maskPhone } from './obfuscate';

describe('obfuscate', () => {
  it.each(['inbox@moiseevp.ru', '+7 (921) 123-45-67', 'Павел ✉'])('round-trips %s', value => {
    expect(decode(encode(value))).toBe(value);
  });

  it('does not leave the value readable in the output', () => {
    expect(encode('inbox@moiseevp.ru')).not.toContain('moiseevp');
  });

  it('masks everything after the area code', () => {
    expect(maskPhone('+7 (921) 123-45-67')).toBe('+7 (921) *********');
  });
});
