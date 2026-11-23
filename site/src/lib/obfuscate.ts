/*
 * Keeps contact details out of the static HTML as plain text, so simple
 * scrapers don't harvest them. Encoded at build time (Node), decoded in the
 * browser after hydration. Not encryption — just obfuscation.
 */

/** UTF-8 → base64 (build time) */
export function encode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64');
}

/** base64 → UTF-8 (browser); the symmetric inverse of `encode`, non-ASCII safe */
export function decode(encoded: string): string {
  const bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

/** "+7 (921) 123-45-67" → "+7 (921) *********" */
export function maskPhone(phone: string): string {
  const visible = phone.slice(0, 9);

  return visible + '*'.repeat(Math.max(phone.length - visible.length, 0));
}
