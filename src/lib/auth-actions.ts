"use server";

import { redirect } from "next/navigation";
import { authenticateUser } from "./auth";
import { createSession } from "./demo-session";
import { DEFAULT_SAMPLE_ACCOUNT, SAMPLE_ACCOUNT_PASSWORD } from "./sample-accounts";

export async function loginAction(formData: FormData) {
  const loginId = formData.get("loginId");
  const password = formData.get("password");

  if (typeof loginId !== "string" || typeof password !== "string" || !loginId.trim() || !password) {
    redirect("/login?error=auth");
  }

  const userId = await authenticateUser(loginId, password);
  if (!userId) redirect("/login?error=auth");

  await createSession(userId);
}

export async function loginSampleAccountAction() {
  const userId = await authenticateUser(DEFAULT_SAMPLE_ACCOUNT.loginId, SAMPLE_ACCOUNT_PASSWORD);
  if (!userId) redirect("/login?error=auth");

  await createSession(userId);
}
