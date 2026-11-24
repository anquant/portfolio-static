import { describe, expect, it } from 'vitest';

import { parseRgbToken } from './design-tokens';

describe('parseRgbToken', () => {
  it("reads a CSS 'R G B' triplet as 0–1 components", () => {
    expect(parseRgbToken(' 140 156 255 ')).toEqual([140 / 255, 156 / 255, 1]);
  });

  it.each(['', '140 156', 'a b c', '300 0 0', '#8c9cff'])('rejects %j', value => {
    expect(parseRgbToken(value)).toBeNull();
  });
});
