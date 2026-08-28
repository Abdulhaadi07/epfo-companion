import {
  createActionRequiredScenario,
  createReadyScenario,
  createRejectedScenario,
  createUnderVerificationScenario,
} from "./factories";
import { DEMO_SCENARIO_IDS, type DemoScenario, type DemoScenarioId } from "./types";

export const demoScenarioFactories: Record<DemoScenarioId, () => DemoScenario> = {
  READY: createReadyScenario,
  UNDER_VERIFICATION: createUnderVerificationScenario,
  ACTION_REQUIRED: createActionRequiredScenario,
  REJECTED: createRejectedScenario,
};

export function createDemoScenario(id: DemoScenarioId): DemoScenario {
  return demoScenarioFactories[id]();
}

export function isDemoScenarioId(value: string): value is DemoScenarioId {
  return (DEMO_SCENARIO_IDS as readonly string[]).includes(value);
}
