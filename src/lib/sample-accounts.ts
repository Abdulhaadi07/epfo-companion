export const SAMPLE_ACCOUNT_PASSWORD = "sample-password";

export const SAMPLE_ACCOUNTS = [
  {
    loginId: "sample-ready",
    displayName: "Aarav Mehta",
    description: "Ready to submit a PF withdrawal claim",
  },
  {
    loginId: "sample-under_verification",
    displayName: "Mira Sen",
    description: "Claim under verification with no action needed",
  },
  {
    loginId: "sample-action_required",
    displayName: "Kabir Rao",
    description: "Claim paused until a bank detail is fixed",
  },
  {
    loginId: "sample-rejected",
    displayName: "Tara Iyer",
    description: "Claim rejected and needing resolution",
  },
] as const;

export const DEFAULT_SAMPLE_ACCOUNT = SAMPLE_ACCOUNTS[1];
