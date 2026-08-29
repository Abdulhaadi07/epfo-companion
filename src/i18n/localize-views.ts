import type { ClaimStatus } from "@/domain/claims";
import type { TranslationKey } from "@/i18n/keys";
import type { Translator } from "@/i18n/server";
import type {
  CitizenHomeActiveClaimView,
  CitizenHomeView,
} from "@/application/citizen-home";
import type { MyClaimsListItemView, MyClaimsView } from "@/application/my-claims";
import type { CitizenHomeReadinessView } from "@/application/readiness";
import type { TimelinePreviewItem } from "@/application/timeline";
import {
  localizeClaimPresentation,
  localizeReasonSummaries,
  type ClaimPresentation,
} from "@/lib/claim-presentation";

export type ClaimOverviewLabels = {
  claimTitle: string;
  readyToProceed: string;
  readyToProceedMessage: string;
  reviewNeeded: string;
  reviewNeededMessage: string;
  actionNeeded: string;
  actionNeededMessage: string;
  noActionNeeded: string;
  whatNeedsFixing: string;
  whyThisMatters: string;
  yourNextStep: string;
  whatYouCanDo: string;
  whatHappensNext: string;
  recentUpdates: string;
  claimTimeline: string;
};

export type CitizenSummaryLabels = {
  accountTitle: string;
  balanceLabel: string;
  employmentLabel: string;
  readinessTitle: string;
  readinessChecksLabel: string;
  usuallyTakesFewDays: string;
};

export type LocalizedReadinessDimension = {
  key: "identity" | "bank" | "kyc";
  label: string;
  status: CitizenHomeReadinessView["dimensions"][number]["status"];
  citizenMessage: string;
  displayLabel: string;
};

export type LocalizedReadinessView = {
  overallLabel: string;
  actionRequired: boolean;
  dimensions: readonly LocalizedReadinessDimension[];
};

export type LocalizedTimelinePreviewItem = {
  id: string;
  label: string;
  occurredAtDisplay: string;
};

export type LocalizedCitizenHomeActiveClaimView = Omit<
  CitizenHomeActiveClaimView,
  "presentation" | "reasonSummaries" | "timelinePreview" | "title"
> & {
  title: string;
  presentation: ClaimPresentation;
  reasonSummaries: readonly string[];
  timelinePreview: readonly LocalizedTimelinePreviewItem[];
};

export type LocalizedCitizenHomeView = {
  greeting: {
    hiLabel: string;
    displayName: string;
  };
  prototypeDisclosure: string;
  taskHeadline: string;
  activeClaim: LocalizedCitizenHomeActiveClaimView | null;
  noClaim: {
    readyToBegin: string;
    readyToBeginMessage: string;
    startWithdrawalTitle: string;
    startWithdrawalDescription: string;
    startPfClaim: string;
  };
  accountSummary: CitizenHomeView["accountSummary"];
  employmentSummary: CitizenHomeView["employmentSummary"];
  readiness: LocalizedReadinessView;
  helpPrompt: {
    title: string;
    description: string;
    href: string;
    linkLabel: string;
  };
  claimOverviewLabels: ClaimOverviewLabels;
  citizenSummaryLabels: CitizenSummaryLabels;
  explorePublicExperience: string;
};

export type MyClaimsPageLabels = {
  title: string;
  description: string;
  backToHome: string;
  emptyTitle: string;
  emptyDescription: string;
  startPfClaim: string;
  viewDetails: string;
  updatedPrefix: string;
  whatNeedsFixing: string;
};

export type LocalizedMyClaimsListItemView = Omit<
  MyClaimsListItemView,
  "presentation" | "reasonSummaries" | "title" | "primaryAction"
> & {
  title: string;
  presentation: ClaimPresentation;
  reasonSummaries: readonly string[];
  primaryAction: {
    label: string;
    href: string;
  };
};

export type LocalizedMyClaimsView = {
  greeting: {
    hiLabel: string;
    displayName: string;
  };
  prototypeDisclosure: string;
  claims: readonly LocalizedMyClaimsListItemView[];
  isEmpty: boolean;
  pageLabels: MyClaimsPageLabels;
};

const TASK_HEADLINE_KEYS: Partial<Record<ClaimStatus, TranslationKey>> = {
  READY: "home.taskHeadlineReady",
  UNDER_VERIFICATION: "home.taskHeadlineUnderVerification",
  ACTION_REQUIRED: "home.taskHeadlineActionRequired",
  REJECTED: "home.taskHeadlineRejected",
};

export function getServiceHandoffLabels(t: Translator) {
  return {
    notImplemented: t("service.notImplemented"),
    explorePfJourney: t("service.explorePfJourney"),
    backToHome: t("common.backToHome"),
    prototypeDisclosure: t("common.prototypeDisclosure"),
  };
}

export function getClaimOverviewLabels(t: Translator): ClaimOverviewLabels {
  return {
    claimTitle: t("claim.title"),
    readyToProceed: t("claim.overview.readyToProceed"),
    readyToProceedMessage: t("claim.overview.readyToProceedMessage"),
    reviewNeeded: t("claim.overview.reviewNeeded"),
    reviewNeededMessage: t("claim.overview.reviewNeededMessage"),
    actionNeeded: t("claim.overview.actionNeeded"),
    actionNeededMessage: t("claim.overview.actionNeededMessage"),
    noActionNeeded: t("claim.overview.noActionNeeded"),
    whatNeedsFixing: t("claim.overview.whatNeedsFixing"),
    whyThisMatters: t("claim.overview.whyThisMatters"),
    yourNextStep: t("claim.overview.yourNextStep"),
    whatYouCanDo: t("claim.overview.whatYouCanDo"),
    whatHappensNext: t("claim.overview.whatHappensNext"),
    recentUpdates: t("claim.overview.recentUpdates"),
    claimTimeline: t("a11y.claimTimeline"),
  };
}

export function getCitizenSummaryLabels(t: Translator): CitizenSummaryLabels {
  return {
    accountTitle: t("account.title"),
    balanceLabel: t("account.balance"),
    employmentLabel: t("account.employment"),
    readinessTitle: t("account.readiness"),
    readinessChecksLabel: t("a11y.readinessChecks"),
    usuallyTakesFewDays: t("account.usuallyTakesFewDays"),
  };
}

function localizeReadiness(t: Translator, readiness: CitizenHomeReadinessView): LocalizedReadinessView {
  return {
    overallLabel: t(readiness.overallLabelKey),
    actionRequired: readiness.actionRequired,
    dimensions: readiness.dimensions.map((dimension) => ({
      key: dimension.key,
      label: t(dimension.labelKey),
      status: dimension.status,
      citizenMessage: t(dimension.citizenMessageKey),
      displayLabel: t(dimension.displayLabelKey),
    })),
  };
}

function localizeTimelinePreview(
  t: Translator,
  items: readonly TimelinePreviewItem[],
): readonly LocalizedTimelinePreviewItem[] {
  return items.map((item) => ({
    id: item.id,
    label: t(item.labelKey),
    occurredAtDisplay: item.occurredAtDisplay,
  }));
}

function resolveTaskHeadline(t: Translator, activeClaim: CitizenHomeActiveClaimView | null): string {
  if (!activeClaim) {
    return t("home.taskHeadlineDefault");
  }

  return t(TASK_HEADLINE_KEYS[activeClaim.status] ?? "home.taskHeadlineActive");
}

export function localizeCitizenHomeView(t: Translator, view: CitizenHomeView): LocalizedCitizenHomeView {
  return {
    greeting: {
      hiLabel: t("common.hi"),
      displayName: view.greeting.displayName,
    },
    prototypeDisclosure: t("common.prototypeDisclosure"),
    taskHeadline: resolveTaskHeadline(t, view.activeClaim),
    activeClaim: view.activeClaim
      ? {
          ...view.activeClaim,
          title: t("claim.title"),
          presentation: localizeClaimPresentation(t, view.activeClaim.presentation),
          reasonSummaries: localizeReasonSummaries(t, view.activeClaim.reasonSummaryKeys),
          timelinePreview: localizeTimelinePreview(t, view.activeClaim.timelinePreview),
        }
      : null,
    noClaim: {
      readyToBegin: t("home.readyToBegin"),
      readyToBeginMessage: t("home.readyToBeginMessage"),
      startWithdrawalTitle: t("home.startWithdrawalTitle"),
      startWithdrawalDescription: t("home.startWithdrawalDescription"),
      startPfClaim: t("claim.action.startPfClaim"),
    },
    accountSummary: view.accountSummary,
    employmentSummary: view.employmentSummary,
    readiness: localizeReadiness(t, view.readiness),
    helpPrompt: {
      title: t(view.helpPrompt.titleKey),
      description: t(view.helpPrompt.descriptionKey),
      href: view.helpPrompt.href,
      linkLabel: t(view.helpPrompt.linkLabelKey),
    },
    claimOverviewLabels: getClaimOverviewLabels(t),
    citizenSummaryLabels: getCitizenSummaryLabels(t),
    explorePublicExperience: t("common.explorePublicExperience"),
  };
}

export function localizeMyClaimsView(t: Translator, view: MyClaimsView): LocalizedMyClaimsView {
  return {
    greeting: {
      hiLabel: t("common.hi"),
      displayName: view.greeting.displayName,
    },
    prototypeDisclosure: t("common.prototypeDisclosure"),
    claims: view.claims.map((claim) => {
      const presentation = localizeClaimPresentation(t, claim.presentation);

      return {
        ...claim,
        title: t("claim.title"),
        presentation,
        reasonSummaries: localizeReasonSummaries(t, claim.reasonSummaryKeys),
        primaryAction: {
          label: presentation.actionLabel,
          href: claim.primaryAction.href,
        },
      };
    }),
    isEmpty: view.isEmpty,
    pageLabels: {
      title: t("claims.title"),
      description: t("claims.description"),
      backToHome: t("common.backToHome"),
      emptyTitle: t("claims.emptyTitle"),
      emptyDescription: t("claims.emptyDescription"),
      startPfClaim: t("claim.action.startPfClaim"),
      viewDetails: t("claims.viewDetails"),
      updatedPrefix: t("claims.updated"),
      whatNeedsFixing: t("claim.overview.whatNeedsFixing"),
    },
  };
}
