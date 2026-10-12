import test from "node:test";
import assert from "node:assert";
import { SSEParser } from "./sseParser.ts";
import { RealtimeStreamClient } from "./realtimeStreamClient.ts";
import { createSyncExecutor } from "./syncExecutor.ts";

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

test("RealtimeStreamClient (production class): 401 refreshes token and reconnects, caps backoff at 30s", async () => {
  let token = "stale-token";
  let refreshCalled = false;
  let fetchCallCount = 0;

  const mockFetch = async (url, init) => {
    fetchCallCount++;
    if (fetchCallCount === 1) {
      assert.strictEqual(init.headers.Authorization, "Bearer stale-token");
      return {
        ok: false,
        status: 401,
      };
    }
    assert.strictEqual(init.headers.Authorization, "Bearer fresh-token");
    return {
      ok: true,
      status: 200,
      body: {
        getReader: () => ({
          read: async () => ({ done: true, value: undefined }),
        }),
      },
    };
  };

  const client = new RealtimeStreamClient({
    streamUrl: "http://localhost:3000/api/v1/customer/events/stream",
    getAccessToken: () => token,
    refreshSession: async () => {
      refreshCalled = true;
      token = "fresh-token";
      return "fresh-token";
    },
    onEvents: () => {},
    fetchFn: mockFetch,
  });

  await client.connect();

  assert.strictEqual(refreshCalled, true);
  assert.strictEqual(fetchCallCount, 2);
  assert.strictEqual(client.getIsHealthy(), true);

  // Backoff calculation caps at 30,000ms
  const backoffHigh = client.computeBackoff(15);
  assert.strictEqual(backoffHigh <= 30000, true);
  assert.strictEqual(backoffHigh >= 20000, true);

  client.disconnect();
  assert.strictEqual(client.getIsHealthy(), false);
});

test("RealtimeStreamClient (production class): marks stream down after 2 network failures", async () => {
  let healthChanges = [];

  const mockFailFetch = async () => ({
    ok: false,
    status: 500,
  });

  const client = new RealtimeStreamClient({
    streamUrl: "http://localhost:3000/api/v1/customer/events/stream",
    getAccessToken: () => "valid-token",
    refreshSession: async () => null,
    onEvents: () => {},
    onHealthChange: (h) => healthChanges.push(h),
    fetchFn: mockFailFetch,
  });

  // Attempt 1
  await client.connect();
  assert.strictEqual(client.getFailedAttempts(), 1);
  assert.strictEqual(client.getIsHealthy(), false);

  // Attempt 2
  await client.connect();
  assert.strictEqual(client.getFailedAttempts(), 2);
  assert.strictEqual(client.getIsHealthy(), false);

  client.disconnect();
});

test("RealtimeStreamClient (production class): streams SSE chunks into onEvents handler", async () => {
  const receivedEvents = [];
  const encoder = new TextEncoder();
  const chunks = [
    encoder.encode("event: ready\n\n"),
    encoder.encode(": ping\n\n"),
    encoder.encode("event: sync\ndata: {\"v\":1,\"types\":[\"wallet.updated\",\"orders.updated\"]}\nid: 1\n\n"),
  ];
  let chunkIdx = 0;

  const mockStreamFetch = async () => ({
    ok: true,
    status: 200,
    body: {
      getReader: () => ({
        read: async () => {
          if (chunkIdx < chunks.length) {
            return { done: false, value: chunks[chunkIdx++] };
          }
          return { done: true, value: undefined };
        },
      }),
    },
  });

  let connectedCalled = false;
  const client = new RealtimeStreamClient({
    streamUrl: "http://localhost:3000/api/v1/customer/events/stream",
    getAccessToken: () => "valid-token",
    refreshSession: async () => null,
    createParser: () => new SSEParser(),
    onEvents: (types) => receivedEvents.push(...types),
    onConnected: () => { connectedCalled = true; },
    fetchFn: mockStreamFetch,
  });

  await client.connect();

  assert.strictEqual(connectedCalled, true);
  assert.deepStrictEqual(receivedEvents, ["wallet.updated", "orders.updated"]);
  assert.strictEqual(client.getIsHealthy(), true);

  client.disconnect();
});

test("createSyncExecutor (production class): coalesces rapid triggers and executes trailing refresh when in flight", async () => {
  let executionCount = 0;

  const executor = createSyncExecutor(async () => {
    executionCount++;
    await new Promise((resolve) => setTimeout(resolve, 60));
  }, 20);

  // Initial trigger starts execution
  const p1 = executor.executeRefresh();
  assert.strictEqual(executor.isInFlight(), true);
  assert.strictEqual(executionCount, 1);

  // Rapid triggers while p1 is in flight
  await executor.executeRefresh();
  await executor.executeRefresh();

  assert.strictEqual(executor.isTrailingNeeded(), true);

  await p1;
  // Give trailing execution time to complete
  await new Promise((resolve) => setTimeout(resolve, 80));

  // After trailing completes, exactly two executions occurred
  assert.strictEqual(executionCount, 2);
  assert.strictEqual(executor.isInFlight(), false);
  assert.strictEqual(executor.isTrailingNeeded(), false);
});
