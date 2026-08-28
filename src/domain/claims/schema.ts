import { z } from "zod";
import { CLAIM_REASON_CODES, CLAIM_STATUSES } from "./types";

export const claimStatusSchema = z.enum(CLAIM_STATUSES);
export const claimReasonCodeSchema = z.enum(CLAIM_REASON_CODES);

export const claimDomainEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("CLAIM_MARKED_READY") }),
  z.object({ type: z.literal("CLAIM_SUBMITTED") }),
  z.object({ type: z.literal("VERIFICATION_STARTED") }),
  z.object({ type: z.literal("ACTION_REQUIRED"), reasonCode: claimReasonCodeSchema }),
  z.object({ type: z.literal("CLAIM_REJECTED"), reasonCode: claimReasonCodeSchema.optional() }),
  z.object({ type: z.literal("CLAIM_RESOLVED") }),
  z.object({ type: z.literal("CLAIM_RESUBMITTED") }),
  z.object({ type: z.literal("CLAIM_APPROVED") }),
  z.object({ type: z.literal("SETTLEMENT_STARTED") }),
  z.object({ type: z.literal("SETTLEMENT_COMPLETED") }),
]);

export const claimSchema = z.object({
  id: z.string().min(1), type: z.literal("FINAL_SETTLEMENT"), citizenId: z.string().min(1),
  status: claimStatusSchema, reasonCodes: z.array(claimReasonCodeSchema),
  createdAt: z.string().datetime(), updatedAt: z.string().datetime(),
  timeline: z.array(claimDomainEventSchema.and(z.object({ id: z.string().min(1), occurredAt: z.string().datetime() }))),
});
