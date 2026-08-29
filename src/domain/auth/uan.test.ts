import { describe, expect, it } from "vitest";
import { isValidUan, parseUan } from "./uan";

describe("uan", () => {
  it("accepts exactly 12 decimal digits", () => {
    expect(parseUan("100000000001")).toBe("100000000001");
    expect(isValidUan("100000000004")).toBe(true);
  });

  it("rejects values that are too short or too long", () => {
    expect(parseUan("10000000001")).toBeNull();
    expect(parseUan("1000000000011")).toBeNull();
    expect(isValidUan("")).toBe(false);
  });

  it("rejects non-digit characters", () => {
    expect(parseUan("10000000000a")).toBeNull();
    expect(parseUan("1000-0000-0001")).toBeNull();
    expect(isValidUan("abcdefghijkl")).toBe(false);
  });

  it("trims surrounding whitespace before validation", () => {
    expect(parseUan("  100000000002  ")).toBe("100000000002");
  });
});
