export const SAMPLE_ACCOUNT_PASSWORD = "sample-password";

export const SAMPLE_ACCOUNTS = [
  {
    uan: "100000000001",
    displayName: "Aarav Mehta",
    description: "Ready to submit a PF withdrawal claim",
  },
  {
    uan: "100000000002",
    displayName: "Mira Sen",
    description: "Claim under verification with no action needed",
  },
  {
    uan: "100000000003",
    displayName: "Kabir Rao",
    description: "Claim paused until a bank detail is fixed",
  },
  {
    uan: "100000000004",
    displayName: "Tara Iyer",
    description: "Claim rejected and needing resolution",
  },
] as const;

export const DEFAULT_SAMPLE_ACCOUNT = SAMPLE_ACCOUNTS[1];
