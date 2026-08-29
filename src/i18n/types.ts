export type NestedMessages = {
  readonly [key: string]: string | NestedMessages;
};

export type FlattenKeys<T, Prefix extends string = ""> = T extends string
  ? Prefix
  : {
      [K in keyof T & string]: FlattenKeys<T[K], Prefix extends "" ? K : `${Prefix}.${K}`>;
    }[keyof T & string];

export type Dictionary = Readonly<Record<string, string>>;

export type AvailableDictionaryLocale = "en" | "hi";
