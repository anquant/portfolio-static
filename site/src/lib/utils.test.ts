import { describe, expect, it } from "vitest";
import { decode, encode, maskPhone } from "./obfuscate";
import { displayHost } from "./url";

describe("displayHost", () => {
  it.each([
    ["https://www.hl-spb.ru/", "hl-spb.ru"],
    ["https://igem.ru/path?q=1", "igem.ru"],
    ["quantumtec.eu", "quantumtec.eu"],
    ["http://sub.example.com", "sub.example.com"],
  ])("%s → %s", (link, host) => {
    expect(displayHost(link)).toBe(host);
  });

  it("never throws on garbage, it echoes the input", () => {
    expect(displayHost("not a url")).toBe("not a url");
  });
});

describe("obfuscate", () => {
  it.each(["inbox@moiseevp.ru", "+7 (921) 123-45-67", "Павел ✉"])(
    "round-trips %s",
    (value) => {
      expect(decode(encode(value))).toBe(value);
    }
  );

  it("does not leave the value readable in the output", () => {
    expect(encode("inbox@moiseevp.ru")).not.toContain("moiseevp");
  });

  it("masks everything after the area code", () => {
    expect(maskPhone("+7 (921) 123-45-67")).toBe("+7 (921) *********");
  });
});
