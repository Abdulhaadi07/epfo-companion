"use server";

import { redirect } from "next/navigation";
import { setLocaleCookie } from "./cookie";
import { buildReturnUrl } from "./locale-redirect";
import { isSupportedLocale } from "./locales";

export async function setLocaleAction(formData: FormData) {
  const localeInput = formData.get("locale");
  const returnPath = formData.get("returnPath");
  const returnSearch = formData.get("returnSearch");
  const returnUrl = buildReturnUrl(returnPath, returnSearch);

  if (typeof localeInput !== "string" || !isSupportedLocale(localeInput)) {
    redirect(returnUrl);
  }

  await setLocaleCookie(localeInput);
  redirect(returnUrl);
}
