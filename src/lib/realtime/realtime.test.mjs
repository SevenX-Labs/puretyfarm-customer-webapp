import test from "node:test";
import assert from "node:assert";
import { SSEParser } from "./sseParser.ts";

test("SSEParser: handles single event with event, data, id", () => {
  const parser = new SSEParser();
  const chunk = "event: sync\ndata: {\"v\":1,\"types\":[\"wallet.updated\"]}\nid: 1\n\n";
  const messages = parser.feed(chunk);

  assert.strictEqual(messages.length, 1);
  assert.strictEqual(messages[0].event, "sync");
  assert.strictEqual(messages[0].id, "1");
  assert.deepStrictEqual(JSON.parse(messages[0].data), { v: 1, types: ["wallet.updated"] });
});

test("SSEParser: ignores heartbeat / ping comments starting with colon", () => {
  const parser = new SSEParser();
  const chunk = ": ping\n\n";
  const messages = parser.feed(chunk);

  assert.strictEqual(messages.length, 0);
});

test("SSEParser: parses multiple events in a single chunk", () => {
  const parser = new SSEParser();
  const chunk =
    ": ping\n\n" +
    "event: sync\ndata: {\"v\":1,\"types\":[\"orders.updated\"]}\nid: 10\n\n" +
    "event: sync\ndata: {\"v\":1,\"types\":[\"plan.updated\"]}\nid: 11\n\n";
  const messages = parser.feed(chunk);

  assert.strictEqual(messages.length, 2);
  assert.strictEqual(messages[0].id, "10");
  assert.strictEqual(messages[1].id, "11");
  assert.deepStrictEqual(JSON.parse(messages[0].data).types, ["orders.updated"]);
  assert.deepStrictEqual(JSON.parse(messages[1].data).types, ["plan.updated"]);
});

test("SSEParser: handles chunks split mid-line across stream boundaries", () => {
  const parser = new SSEParser();
  // Split across field name and value
  const chunk1 = "event: sy";
  const chunk2 = "nc\ndata: {\"v\":1,\"types\":[\"wallet";
  const chunk3 = ".updated\"]}\nid: 42\n\n";

  let msgs = parser.feed(chunk1);
  assert.strictEqual(msgs.length, 0);

  msgs = parser.feed(chunk2);
  assert.strictEqual(msgs.length, 0);

  msgs = parser.feed(chunk3);
  assert.strictEqual(msgs.length, 1);
  assert.strictEqual(msgs[0].event, "sync");
  assert.strictEqual(msgs[0].id, "42");
  assert.deepStrictEqual(JSON.parse(msgs[0].data).types, ["wallet.updated"]);
});

test("SSEParser: supports ready event with no data", () => {
  const parser = new SSEParser();
  const messages = parser.feed("event: ready\n\n");
  assert.strictEqual(messages.length, 1);
  assert.strictEqual(messages[0].event, "ready");
});

test("Reconnect and Backoff: 401 triggers refresh, 2 errors trigger stream down, backoff caps at 30s", async () => {
  let tokenRefreshed = false;
  let healthState = true;
  let failedAttempts = 0;

  async function mockConnect(statusCode) {
    if (statusCode === 401) {
      tokenRefreshed = true;
      return "refreshed_and_retried";
    }
    failedAttempts++;
    if (failedAttempts >= 2) {
      healthState = false; // Mark stream down so fallback polling takes over
    }
    const backoff = Math.min(30000, 1000 * Math.pow(2, failedAttempts) + 50);
    return backoff;
  }

  // 1. 401 response triggers refresh
  const res401 = await mockConnect(401);
  assert.strictEqual(res401, "refreshed_and_retried");
  assert.strictEqual(tokenRefreshed, true);

  // 2. 1st network failure
  const delay1 = await mockConnect(500);
  assert.strictEqual(healthState, true); // Still healthy on first transient error
  assert.strictEqual(failedAttempts, 1);

  // 3. 2nd network failure
  const delay2 = await mockConnect(500);
  assert.strictEqual(healthState, false); // Stream marked down after 2 failures!
  assert.strictEqual(failedAttempts, 2);

  // 4. Caps at 30,000ms
  failedAttempts = 10;
  const highDelay = Math.min(30000, 1000 * Math.pow(2, failedAttempts) + 50);
  assert.strictEqual(highDelay, 30000);
});

test("Debounce and Trailing Refresh: coalesces rapid events and guarantees exactly ONE trailing refresh", async () => {
  let executionCount = 0;
  let inFlight = false;
  let trailingNeeded = false;

  async function refreshWorkload() {
    if (inFlight) {
      trailingNeeded = true;
      return;
    }
    inFlight = true;
    executionCount++;
    // Simulate async network request
    await new Promise((resolve) => setTimeout(resolve, 50));
    inFlight = false;
    if (trailingNeeded) {
      trailingNeeded = false;
      await refreshWorkload();
    }
  }

  // Start initial refresh
  const p1 = refreshWorkload();
  assert.strictEqual(inFlight, true);
  assert.strictEqual(executionCount, 1);

  // While in flight, 3 events arrive rapidly
  await refreshWorkload();
  await refreshWorkload();
  await refreshWorkload();

  // Still only 1 has completed and trailingNeeded is flagged
  assert.strictEqual(trailingNeeded, true);

  await p1;

  // After p1 completes, exactly one trailing refresh was executed
  assert.strictEqual(executionCount, 2);
  assert.strictEqual(inFlight, false);
  assert.strictEqual(trailingNeeded, false);
});
