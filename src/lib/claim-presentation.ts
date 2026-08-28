import type { ClaimStatus } from "@/domain/claims";
import type { StatusSeverity } from "@/components/ui/status-badge";

export type ClaimPresentation = {
  label: string;
  severity: StatusSeverity;
  situation: string;
  actionRequired: boolean;
  actionMessage: string;
  nextStep: string;
  actionLabel: string;
  actionHref: string;
  readinessSummary: string;
};

const presentations: Record<ClaimStatus, ClaimPresentation> = {
  DRAFT: {
    label: "Getting ready", severity: "neutral", situation: "Your PF task has been started but is not ready to submit yet.", actionRequired: true, actionMessage: "Yes, you have a few readiness steps to complete.", nextStep: "Check your details and finish the readiness check.", actionLabel: "Get ready to claim", actionHref: "/claim/start", readinessSummary: "Readiness check still to do",
  },
  READY: {
    label: "Ready to submit", severity: "success", situation: "Your details are ready for the next step in this PF task.", actionRequired: true, actionMessage: "Yes, you can review and submit this claim.", nextStep: "Review your claim details before the simulated submission.", actionLabel: "Start my claim", actionHref: "/claim/start", readinessSummary: "Ready for review",
  },
  SUBMITTED: {
    label: "Received", severity: "info", situation: "Your claim has been submitted and is waiting for verification to begin.", actionRequired: false, actionMessage: "No, there is nothing you need to do right now.", nextStep: "We will show you when the verification stage begins.", actionLabel: "View my claim", actionHref: "/claim/status", readinessSummary: "Claim submitted",
  },
  UNDER_VERIFICATION: {
    label: "Under verification", severity: "info", situation: "Your claim has been received and is currently being checked.", actionRequired: false, actionMessage: "No, you do not need to do anything right now.", nextStep: "Check your claim status later for the next update.", actionLabel: "View my claim", actionHref: "/claim/status", readinessSummary: "Checks are in progress",
  },
  ACTION_REQUIRED: {
    label: "Something needs your attention", severity: "warning", situation: "Your claim has paused because one detail needs to be fixed.", actionRequired: true, actionMessage: "Yes, please review the issue before the claim can continue.", nextStep: "Understand the issue and follow the suggested fix.", actionLabel: "Fix this problem", actionHref: "/claim/status", readinessSummary: "One detail needs attention",
  },
  REJECTED: {
    label: "Your claim couldn't continue", severity: "danger", situation: "Your claim could not continue in its current form and requires attention.", actionRequired: true, actionMessage: "Yes, review why this happened before trying again.", nextStep: "Understand the reason and follow the available resolution steps.", actionLabel: "Understand the problem", actionHref: "/claim/status", readinessSummary: "Resolution needed",
  },
  RESOLUTION: {
    label: "Being resolved", severity: "warning", situation: "A problem has been identified and is being worked through.", actionRequired: true, actionMessage: "Yes, complete the suggested resolution step.", nextStep: "Finish the fix so the claim can be submitted again.", actionLabel: "Continue the fix", actionHref: "/claim/status", readinessSummary: "Resolution in progress",
  },
  RESUBMITTED: {
    label: "Submitted again", severity: "info", situation: "Your updated claim has been submitted again for checking.", actionRequired: false, actionMessage: "No, you do not need to do anything right now.", nextStep: "Watch for the next verification update.", actionLabel: "View my claim", actionHref: "/claim/status", readinessSummary: "Updated claim submitted",
  },
  APPROVED: {
    label: "Approved", severity: "success", situation: "Your claim has been approved and is moving towards settlement.", actionRequired: false, actionMessage: "No, there is nothing you need to do right now.", nextStep: "Follow the settlement progress until it is complete.", actionLabel: "View my claim", actionHref: "/claim/status", readinessSummary: "Claim approved",
  },
  SETTLEMENT: {
    label: "Being settled", severity: "info", situation: "Your approved claim is being prepared for settlement.", actionRequired: false, actionMessage: "No, there is nothing you need to do right now.", nextStep: "Check your claim status for the settlement update.", actionLabel: "View my claim", actionHref: "/claim/status", readinessSummary: "Settlement in progress",
  },
  SETTLED: {
    label: "Complete", severity: "success", situation: "This claim journey has been completed.", actionRequired: false, actionMessage: "No, there is nothing you need to do right now.", nextStep: "Review the completed claim details.", actionLabel: "View my claim", actionHref: "/claim/status", readinessSummary: "Claim complete",
  },
};

export function getClaimPresentation(status: ClaimStatus): ClaimPresentation {
  return presentations[status];
}
