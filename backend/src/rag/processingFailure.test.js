import test from "node:test";
import assert from "node:assert/strict";
import { handleProcessingFailure } from "./processingFailure.js";

test("cleans up chunks and marks the document as failed", async () => {
  const calls = [];

  await handleProcessingFailure({
    documentId: 42,
    error: new Error("Embedding failed"),
    deleteChunks: async (id) => calls.push(["cleanup", id]),
    updateStatus: async (...args) => calls.push(["status", ...args]),
    logError: () => {},
  });

  assert.deepEqual(calls, [
    ["cleanup", 42],
    ["status", 42, "failed", "Embedding failed"],
  ]);
});

test("marks the document as failed even if chunk cleanup fails", async () => {
  const calls = [];
  const logs = [];

  await handleProcessingFailure({
    documentId: 42,
    error: new Error("Embedding failed"),
    deleteChunks: async () => {
      throw new Error("Database unavailable");
    },
    updateStatus: async (...args) => calls.push(args),
    logError: (...args) => logs.push(args),
  });

  assert.deepEqual(calls, [[42, "failed", "Embedding failed"]]);
  assert.equal(logs.length, 1);
  assert.match(logs[0][0], /Could not clean up chunks/);
});

test("logs a status-update failure without throwing", async () => {
  const logs = [];

  await assert.doesNotReject(
    handleProcessingFailure({
      documentId: 42,
      error: new Error("Embedding failed"),
      deleteChunks: async () => {},
      updateStatus: async () => {
        throw new Error("Database unavailable");
      },
      logError: (...args) => logs.push(args),
    }),
  );

  assert.equal(logs.length, 1);
  assert.match(logs[0][0], /Could not mark RAG document 42 as failed/);
});
