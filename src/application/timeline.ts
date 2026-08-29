import type { ClaimTimelineEvent } from "@/domain/claims";
import type { TranslationKey } from "@/i18n/keys";
import { formatDateTime } from "@/lib/format";
import { TIMELINE_EVENT_LABEL_KEYS, TIMELINE_REASON_EVENT_LABEL_KEYS } from "@/lib/timeline-keys";

export type TimelinePreviewItem = {
  id: string;
  labelKey: TranslationKey;
  occurredAtDisplay: string;
};

function labelKeyForEvent(event: ClaimTimelineEvent): TranslationKey {
  if (event.type === "ACTION_REQUIRED" && "reasonCode" in event) {
    return TIMELINE_REASON_EVENT_LABEL_KEYS[event.reasonCode] ?? TIMELINE_EVENT_LABEL_KEYS.ACTION_REQUIRED;
  }
  if (event.type === "CLAIM_REJECTED" && "reasonCode" in event && event.reasonCode) {
    return TIMELINE_REASON_EVENT_LABEL_KEYS[event.reasonCode] ?? TIMELINE_EVENT_LABEL_KEYS.CLAIM_REJECTED;
  }
  return TIMELINE_EVENT_LABEL_KEYS[event.type];
}

export const TIMELINE_PREVIEW_LIMIT = 3;

export function buildTimelinePreview(timeline: readonly ClaimTimelineEvent[]): readonly TimelinePreviewItem[] {
  return timeline
    .slice(-TIMELINE_PREVIEW_LIMIT)
    .map((event) => ({
      id: event.id,
      labelKey: labelKeyForEvent(event),
      occurredAtDisplay: formatDateTime(event.occurredAt),
    }));
}
