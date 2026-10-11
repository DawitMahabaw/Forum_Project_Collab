import test from "node:test";
import assert from "node:assert/strict";
import { splitText } from "./chunking.js";

test("returns an empty array for invalid text input", () => {
  assert.deepEqual(splitText(null), []);
  assert.deepEqual(splitText(123), []);
});

test("returns an empty array for empty or whitespace-only text", () => {
  assert.deepEqual(splitText(""), []);
  assert.deepEqual(splitText("   \n\t "), []);
});

test("normalizes whitespace before chunking", () => {
  assert.deepEqual(splitText("  hello   world \n from   RAG  ", 100, 0), [
    "hello world from RAG",
  ]);
});

test("splits text into chunks with the requested overlap", () => {
  assert.deepEqual(splitText("abcdefghij", 4, 1), ["abcd", "defg", "ghij"]);
});

test("uses default chunk size and overlap", () => {
  const text = "a".repeat(2000);
  const chunks = splitText(text);

  assert.equal(chunks.length, 3);
  assert.equal(chunks[0].length, 1000);
  assert.equal(chunks[1].length, 1000);
  assert.equal(chunks[2].length, 240);
});

test("rejects invalid chunk sizes", () => {
  assert.throws(() => splitText("hello", 0), RangeError);
  assert.throws(() => splitText("hello", -1), RangeError);
  assert.throws(() => splitText("hello", 1.5), RangeError);
});

test("rejects invalid chunk overlap", () => {
  assert.throws(() => splitText("hello", 5, -1), RangeError);
  assert.throws(() => splitText("hello", 5, 5), RangeError);
  assert.throws(() => splitText("hello", 5, 1.5), RangeError);
});
