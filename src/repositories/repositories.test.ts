import { describe, expect, it } from "vitest";
import { claimEvents, claims, employmentRecords, pfAccounts, users } from "@/db/schema";
import { createClaimEventRepository } from "./claim-event-repository";
import { createClaimRepository } from "./claim-repository";
import { createEmploymentRepository } from "./employment-repository";
import { createPFAccountRepository } from "./pf-account-repository";
import { createUserRepository } from "./user-repository";

function mockDatabase(rowsByTable: Map<unknown, unknown[]>) {
  return {
    select: () => ({
      from: (table: unknown) => {
        const rows = rowsByTable.get(table) ?? [];
        const orderedRows = [...rows].sort((left, right) => {
          const leftOccurredAt = (left as { occurredAt?: Date | string }).occurredAt;
          const rightOccurredAt = (right as { occurredAt?: Date | string }).occurredAt;

          if (leftOccurredAt === undefined || rightOccurredAt === undefined) return 0;
          return new Date(leftOccurredAt).getTime() - new Date(rightOccurredAt).getTime();
        });
        const result = {
          limit: async () => rows,
          orderBy: () => orderedRows,
          then: (resolve: (value: unknown[]) => unknown, reject?: (reason: unknown) => unknown) => Promise.resolve(rows).then(resolve, reject),
        };
        return { where: () => result };
      },
    }),
  };
}

describe("read-only repositories", () => {
  it("exposes the required scoped reads without a live database", async () => {
    const user = { id: "u1" };
    const employment = { id: "e1", userId: "u1" };
    const account = { id: "p1", userId: "u1" };
    const claim = { id: "c1", userId: "u1" };
    const event = { id: "ev1", claimId: "c1" };
    const db = mockDatabase(new Map<unknown, unknown[]>([
      [users, [user]], [employmentRecords, [employment]], [pfAccounts, [account]],
      [claims, [claim]], [claimEvents, [event]],
    ]));

    const userRepository = createUserRepository(db as never);
    const employmentRepository = createEmploymentRepository(db as never);
    const accountRepository = createPFAccountRepository(db as never);
    const claimRepository = createClaimRepository(db as never);
    const eventRepository = createClaimEventRepository(db as never);

    expect(await userRepository.findById("u1")).toBe(user);
    expect(await userRepository.findByLoginId("login-1")).toBe(user);
    expect(await employmentRepository.findById("e1")).toBe(employment);
    expect(await employmentRepository.listByUserId("u1")).toEqual([employment]);
    expect(await accountRepository.findById("p1")).toBe(account);
    expect(await accountRepository.listByUserId("u1")).toEqual([account]);
    expect(await claimRepository.findById("c1")).toBe(claim);
    expect(await claimRepository.listByUserId("u1")).toEqual([claim]);
    expect(await eventRepository.findById("ev1")).toBe(event);
    expect(await eventRepository.listByClaimId("c1")).toEqual([event]);
  });
});
