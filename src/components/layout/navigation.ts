export const PUBLIC_NAVIGATION = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/#tasks-heading" },
  { label: "Help", href: "/help" },
  { label: "About", href: "/#about-heading" },
] as const;

export const AUTHENTICATED_NAVIGATION = [
  { label: "Home", href: "/home" },
  { label: "My Claims", href: "/claim/status" },
  { label: "Help", href: "/help" },
] as const;

export function getNavigation(isAuthenticated: boolean) {
  return isAuthenticated ? AUTHENTICATED_NAVIGATION : PUBLIC_NAVIGATION;
}
