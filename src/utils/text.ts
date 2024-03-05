export const toCamelCase = (phrase: string): string => {
  return phrase
    .split(" ")
    .map((word, i) =>
      i === 0
        ? word.toLowerCase()
        : `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`
    )
    .join("");
};
