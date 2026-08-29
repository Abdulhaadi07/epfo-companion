import type { enMessages } from "./dictionaries/en";
import type { FlattenKeys } from "./types";

export type TranslationKey = FlattenKeys<typeof enMessages>;
