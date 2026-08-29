import { describe, expect, it } from "vitest";
import { flattenMessages } from "./flatten";

describe("flattenMessages", () => {
  it("flattens nested message trees into dot-notation keys", () => {
    expect(flattenMessages({
      nav: { home: "Home", help: "Help" },
      claim: { status: { ready: "Ready" } },
    })).toEqual({
      "nav.home": "Home",
      "nav.help": "Help",
      "claim.status.ready": "Ready",
    });
  });
});
