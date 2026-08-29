"use server";

import { redirect } from "next/navigation";
import { parseUan } from "@/domain/auth/uan";
import { authenticateUser } from "./auth";
import { createSession } from "./demo-session";
import { DEFAULT_SAMPLE_ACCOUNT, SAMPLE_ACCOUNT_PASSWORD } from "./sample-accounts";

export async function loginAction(formData: FormData) {
  const uanInput = formData.get("uan");
  const password = formData.get("password");

  if (typeof uanInput !== "string" || typeof password !== "string" || !password) {
    redirect("/login?error=auth");
  }

  if (!parseUan(uanInput)) {
    redirect("/login?error=auth");
  }

  const userId = await authenticateUser(uanInput, password);
  if (!userId) redirect("/login?error=auth");

  await createSession(userId);
}

export async function loginSampleAccountAction() {
  const userId = await authenticateUser(DEFAULT_SAMPLE_ACCOUNT.uan, SAMPLE_ACCOUNT_PASSWORD);
  if (!userId) redirect("/login?error=auth");

  await createSession(userId);
}
