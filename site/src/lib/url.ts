/**
 * Display host for a project link ("https://www.hl-spb.ru/" → "hl-spb.ru").
 * Never throws: a link without a scheme ("hl-spb.ru") is still shown
 * instead of breaking the build while prerendering.
 */
export function displayHost(link: string): string {
  try {
    const withScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(link) ? link : `https://${link}`;
    return new URL(withScheme).hostname.replace(/^www\./, '');
  } catch {
    return link;
  }
}
