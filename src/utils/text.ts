/**
 * Transforms any args into a short string representation.
 *
 * @param args - The args to transform
 * @param maxArgs - The maximum number of args to show
 * @param maxElems - The maximum number of elements of each arg to show
 * @returns The string representation
 *
 * @example
 * ```
 * argsToString([{"a": 1}]); // {a: 1}
 * argsToString([{"a": 1, "b": 2}]); // {a: 1, ...}
 *
 * // using maxArgs
 * argsToString([1, 2]); // 1, ...
 * argsToString([1, 2], 2); // 1, 2
 *
 * // using maxElems
 * argsToString([{"a": 1, "b": 2}, "second"]); // {a: 1, ...}, ...
 * argsToString([{"a": 1, "b": 2}, "second"], 2, 2); // {a: 1, b: 2}, second
 * ```
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const argsToString = (args: any, maxArgs = 1, maxElems = 1): string => {
  if (!args || args.length === 0) return "";

  if (args.length <= maxArgs)
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    return `${args.map((arg: any) => argToString(arg, maxElems)).join(", ")}`;

  return `${args
    .slice(0, maxArgs)
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    .map((arg: any) => argToString(arg, maxElems))
    .join(", ")}, ...`;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const argToString = (arg: any, maxElems: number): string => {
  if (Array.isArray(arg)) {
    if (arg.length === 0) return "[]";
    if (arg.length <= maxElems) return `[${arg.join(", ")}]`;
    return `[${arg.slice(0, maxElems).join(", ")}, ...]`;
  }

  if (typeof arg === "object") {
    const keys = Object.keys(arg);

    if (keys.length === 0) return "{}";
    if (keys.length <= maxElems)
      return `{${keys.map((k) => `${k}: ${arg[k]}`).join(", ")}}`;
    return `{${keys
      .slice(0, maxElems)
      .map((k) => `${k}: ${arg[k]}`)
      .join(", ")}, ...}`;
  }

  return `${arg}`;
};

/**
 * Transforms a phrase like string into camel case.
 *
 * @param phrase - The phrase like string
 * @returns The camel case string
 *
 * @example
 * ```
 * toCamelCase("Hello World"); // helloWorld
 * ```
 */
export const toCamelCase = (phrase: string): string => {
  return phrase
    .split(" ")
    .map((word, i) =>
      i === 0
        ? word.toLowerCase()
        : `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`,
    )
    .join("");
};

/**
 * Transforms a camel case string into phrase.
 *
 * @param camelCase - The camel case string
 * @returns The phrase string
 *
 * @example
 * ```
 * toPhrase("helloWorld"); // Hello World
 * ```
 */
export const toPhrase = (camelCase: string): string => {
  const result = camelCase.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
};
