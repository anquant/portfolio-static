export function encode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64");
}

export function decode(encoded: string): string {
  return atob(encoded);
}

export function maskPhone(phone: string): string {
  const visible = phone.slice(0, 9);
  return visible + "*".repeat(Math.max(phone.length - visible.length, 0));
}
