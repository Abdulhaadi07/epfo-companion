import { z } from "zod";

export const UAN_LENGTH = 12;

export const uanSchema = z
  .string()
  .trim()
  .regex(/^\d{12}$/, `UAN must be exactly ${UAN_LENGTH} digits.`);

export type Uan = z.infer<typeof uanSchema>;

export function parseUan(value: string): Uan | null {
  const result = uanSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function isValidUan(value: string): boolean {
  return uanSchema.safeParse(value).success;
}
