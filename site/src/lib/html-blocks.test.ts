import { describe, expect, it } from 'vitest';

import { splitHtmlBlocks } from './html-blocks';

describe('splitHtmlBlocks', () => {
  it('splits top-level elements, keeping their tags and attributes', () => {
    expect(splitHtmlBlocks('<p>One</p>\n<p class="x">Two</p><ul><li>a</li></ul>')).toEqual([
      '<p>One</p>',
      '<p class="x">Two</p>',
      '<ul><li>a</li></ul>',
    ]);
  });

  it('returns the whole text as one block when it does not split cleanly', () => {
    expect(splitHtmlBlocks('Loose text <p>and a paragraph</p>')).toEqual(['Loose text <p>and a paragraph</p>']);
    expect(splitHtmlBlocks('<div><div>a</div>b</div>')).toEqual(['<div><div>a</div>b</div>']);
    expect(splitHtmlBlocks('')).toEqual(['']);
  });
});
