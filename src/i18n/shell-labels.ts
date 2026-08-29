import type { Translator } from "./server";

export type ShellLabels = {
  brandName: string;
  brandTagline: string;
  footerDescription: string;
  prototypeDisclosure: string;
  myAccount: string;
  signIn: string;
  signOut: string;
  language: string;
  navPrimary: string;
  navMobile: string;
  navFooter: string;
  openMenu: string;
  closeMenu: string;
  navigation: readonly { label: string; href: string }[];
};

export function getShellLabels(
  t: Translator,
  isAuthenticated: boolean,
): ShellLabels {
  const navigation = isAuthenticated
    ? [
        { label: t("nav.home"), href: "/home" },
        { label: t("nav.myClaims"), href: "/claim/status" },
        { label: t("nav.help"), href: "/help" },
      ]
    : [
        { label: t("nav.home"), href: "/" },
        { label: t("nav.services"), href: "/#tasks-heading" },
        { label: t("nav.help"), href: "/help" },
        { label: t("nav.about"), href: "/#about-heading" },
      ];

  return {
    brandName: t("brand.name"),
    brandTagline: t("brand.tagline"),
    footerDescription: t("brand.footerDescription"),
    prototypeDisclosure: t("common.prototypeDisclosure"),
    myAccount: t("common.myAccount"),
    signIn: t("nav.signIn"),
    signOut: t("nav.signOut"),
    language: t("nav.language"),
    navPrimary: t("nav.primary"),
    navMobile: t("nav.mobile"),
    navFooter: t("nav.footer"),
    openMenu: t("a11y.openMenu"),
    closeMenu: t("a11y.closeMenu"),
    navigation,
  };
}
