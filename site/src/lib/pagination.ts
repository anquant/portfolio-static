/**
 * `?page=N` from the URL → a page number within 1…totalPages. Anything
 * malformed (missing, "abc", "0", "-5", "2.5") means page 1, and a number
 * past the end shows the last page, so a bad link never renders an empty list.
 */
export function pageFromQuery(raw: string | string[] | null | undefined, totalPages: number): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) {
    return 1;
  }

  return Math.min(n, Math.max(totalPages, 1));
}
