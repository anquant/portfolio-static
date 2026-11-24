import { describe, expect, it } from 'vitest';

import { pageFromQuery } from './pagination';

describe('pageFromQuery', () => {
  it.each([
    [undefined, 1],
    [null, 1],
    ['', 1],
    ['abc', 1],
    ['0', 1],
    ['-5', 1],
    ['2.5', 1],
    ['2', 2],
    [['3', '9'], 3],
    ['99', 4],
  ])('%j → %i (of 4 pages)', (raw, page) => {
    expect(pageFromQuery(raw, 4)).toBe(page);
  });

  it('treats an empty list as one page', () => {
    expect(pageFromQuery('3', 0)).toBe(1);
  });
});
