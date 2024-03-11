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
 * toPhrase("helloWorld"); // hello World
 * ```
 */
export const toPhrase = (camelCase: string): string =>
  camelCase.replace(/([A-Z])/g, " $1");
