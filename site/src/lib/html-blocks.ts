/**
 * Splits rich text from content (a run of top-level HTML elements such as
 * <p>, <ul>, <h3>) into those elements, so each can be revealed on its own.
 * Anything that doesn't split cleanly (loose text, nested same-name tags)
 * comes back as one block: the text is never lost or re-nested.
 */
export function splitHtmlBlocks(html: string): string[] {
  const blocks = html.match(/<([a-z][a-z0-9]*)\b[^>]*>[\s\S]*?<\/\1>/gi) ?? [];
  const covered = blocks.join('').replace(/\s+/g, '') === html.replace(/\s+/g, '');
  const nested = blocks.some(b => {
    const tag = /^<([a-z0-9]+)/i.exec(b)?.[1] ?? '';

    return new RegExp(`<${tag}\\b`, 'i').test(b.slice(1));
  });

  return blocks.length > 0 && covered && !nested ? blocks : [html];
}
