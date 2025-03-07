import { test, expect } from "@playwright/test";
import { argsToString, toCamelCase, toPhrase } from "../../src";

test("should be able to convert array args into a readable short string", () => {
  expect(argsToString([[]])).toEqual("[]");
  expect(argsToString([[1]])).toEqual("[1]");
  expect(argsToString([[1, 2]])).toEqual("[1, ...]");
  expect(argsToString([[1, 2], []])).toEqual("[1, ...], ...");
  expect(argsToString([[1, 2], []], 2)).toEqual("[1, ...], []");
  expect(argsToString([[1, 2], []], 2, 2)).toEqual("[1, 2], []");
});

test("should be able to convert object args into a readable short string", () => {
  expect(argsToString([{}])).toEqual("{}");
  expect(argsToString([{ key: "value" }])).toEqual("{key: value}");
  expect(argsToString([{ key1: 1, key2: 2 }])).toEqual("{key1: 1, ...}");
  expect(argsToString([{ key1: 1, key2: 2 }, {}])).toEqual("{key1: 1, ...}, ...");
  expect(argsToString([{ key1: 1, key2: 2 }, {}], 2)).toEqual("{key1: 1, ...}, {}");
  expect(argsToString([{ key1: 1, key2: 2 }, {}], 2, 2)).toEqual("{key1: 1, key2: 2}, {}");
});

test("should be able to convert primitive args into a readable short string", () => {
  expect(argsToString([])).toEqual("");
  expect(argsToString(["string"])).toEqual("string");
  expect(argsToString([1])).toEqual("1");
  expect(argsToString([true])).toEqual("true");
  expect(argsToString([false, 0, "false"])).toEqual("false, ...");
  expect(argsToString([false, 0, "false"], 2)).toEqual("false, 0, ...");
  expect(argsToString([false, 0, "false"], 3)).toEqual("false, 0, false");
});

test("should be able to convert a phrase into a camel case word", () => {
  expect(toCamelCase("small")).toEqual("small");
  expect(toCamelCase("A bit more medium")).toEqual("aBitMoreMedium");
  expect(
    toCamelCase("One Very very Long And big and ODD List of words"),
  ).toEqual("oneVeryVeryLongAndBigAndOddListOfWords");
});

test("should be able to convert a camel case word into a phrase", () => {
  expect(toPhrase("small")).toEqual("Small");
  expect(toPhrase("aBitMoreMedium")).toEqual("A bit more medium");
  expect(toPhrase("oneVeryVeryLongAndBigAndOddListOfWords")).toEqual(
    "One very very long and big and odd list of words",
  );
});
