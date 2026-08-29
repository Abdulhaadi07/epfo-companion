export function sanitizeReturnPath(path: unknown): string {
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }

  return path;
}

export function buildReturnUrl(path: unknown, search: unknown): string {
  const safePath = sanitizeReturnPath(path);

  if (typeof search !== "string" || !search.trim()) {
    return safePath;
  }

  const query = search.startsWith("?") ? search : `?${search}`;
  return `${safePath}${query}`;
}
