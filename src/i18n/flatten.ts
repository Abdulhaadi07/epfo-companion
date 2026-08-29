import type { NestedMessages } from "./types";

export function flattenMessages(messages: NestedMessages, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(messages)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "string") {
      result[path] = value;
      continue;
    }

    Object.assign(result, flattenMessages(value, path));
  }

  return result;
}
