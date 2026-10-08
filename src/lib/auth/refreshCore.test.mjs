import assert from "node:assert/strict";
import test from "node:test";
import { createRefreshCore } from "./refreshCore.mjs";

function createHarness(overrides = {}) {
  let refreshToken = "refresh-0";
  let accessToken = null;
  let clearCount = 0;
  const requests = [];
  const core = createRefreshCore({
    getRefreshToken: () => refreshToken,
    getAccessToken: (forRefreshToken) =>
      forRefreshToken === refreshToken ? accessToken : null,
    setTokens: (tokens) => {
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
    },
    clearTokens: () => {
      clearCount += 1;
      refreshToken = null;
      accessToken = null;
    },
    requestRefresh: async (token) => {
      requests.push(token);
      return {
        success: true,
        accessToken: `access-${requests.length}`,
        refreshToken: `refresh-${requests.length}`,
      };
    },
    wait: async () => {},
    ...overrides,
  });
  return {
    core,
    requests,
    getRefreshToken: () => refreshToken,
    getAccessToken: () => accessToken,
    getClearCount: () => clearCount,
  };
}

test("valid refresh token authenticates during bootstrap", async () => {
  const harness = createHarness();
  const result = await harness.core.bootstrap(async () => ({ id: "customer-1" }));
  assert.equal(result.status, "authenticated");
  assert.deepEqual(result.value, { id: "customer-1" });
  assert.deepEqual(harness.requests, ["refresh-0"]);
});

test("missing refresh token skips refresh and bootstraps unauthenticated", async () => {
  const harness = createHarness({
    getRefreshToken: () => null,
  });
  const result = await harness.core.bootstrap(async () => {
    throw new Error("loader should not run");
  });
  assert.equal(result.status, "unauthenticated");
  assert.deepEqual(harness.requests, []);
});

test("a rejected refresh token clears the session", async () => {
  const harness = createHarness({
    requestRefresh: async () => {
      const error = new Error("Refresh token expired");
      error.status = 401;
      throw error;
    },
  });
  await assert.rejects(harness.core.refresh(), { status: 401 });
  assert.equal(harness.getClearCount(), 1);
  assert.equal(harness.getRefreshToken(), null);
});

test("five parallel 401s share one refresh and replay all requests", async () => {
  let refreshCount = 0;
  const harness = createHarness({
    requestRefresh: async () => {
      refreshCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 5));
      return {
        success: true,
        accessToken: "new-access",
        refreshToken: "new-refresh",
      };
    },
  });
  let replayCount = 0;
  const results = await Promise.all(
    Array.from({ length: 5 }, (_, index) =>
      harness.core.retryAfterUnauthorized(async (token) => {
        replayCount += 1;
        assert.equal(token, "new-access");
        return `response-${index}`;
      })
    )
  );
  assert.equal(refreshCount, 1);
  assert.equal(replayCount, 5);
  assert.equal(results.length, 5);
  assert.equal(harness.getRefreshToken(), "new-refresh");
});

test("the rotated refresh token is used by the next refresh", async () => {
  const harness = createHarness();
  await harness.core.refresh();
  await harness.core.refresh();
  assert.deepEqual(harness.requests, ["refresh-0", "refresh-1"]);
});

test("a tab reuses a rotation completed while it waited for the cross-tab lock", async () => {
  let currentRefreshToken = "old-refresh";
  let currentAccessToken = null;
  let refreshCalls = 0;
  const core = createRefreshCore({
    getRefreshToken: () => currentRefreshToken,
    getAccessToken: () => currentAccessToken,
    setTokens: (tokens) => {
      currentRefreshToken = tokens.refreshToken;
      currentAccessToken = tokens.accessToken;
    },
    clearTokens: () => {
      currentRefreshToken = null;
      currentAccessToken = null;
    },
    withLock: async (callback) => {
      currentRefreshToken = "new-refresh";
      return callback();
    },
    waitForRotatedAccess: async () => "new-access",
    requestRefresh: async () => {
      refreshCalls += 1;
      throw new Error("must not refresh the rotated token again");
    },
  });
  assert.equal(await core.refresh(), "new-access");
  assert.equal(refreshCalls, 0);
});

test("network errors preserve the refresh token after bounded retries", async () => {
  let attempts = 0;
  const harness = createHarness({
    requestRefresh: async () => {
      attempts += 1;
      const error = new Error("offline");
      error.code = "NETWORK_ERROR";
      throw error;
    },
  });
  await assert.rejects(harness.core.refresh(), /offline/);
  assert.equal(attempts, 3);
  assert.equal(harness.getClearCount(), 0);
  assert.equal(harness.getRefreshToken(), "refresh-0");
});

test("5xx errors preserve the refresh token after bounded retries", async () => {
  let attempts = 0;
  const harness = createHarness({
    requestRefresh: async () => {
      attempts += 1;
      const error = new Error("service unavailable");
      error.status = 503;
      throw error;
    },
  });
  await assert.rejects(harness.core.refresh(), /service unavailable/);
  assert.equal(attempts, 3);
  assert.equal(harness.getClearCount(), 0);
  assert.equal(harness.getRefreshToken(), "refresh-0");
});

test("a 401 on the replay ends the session without another refresh loop", async () => {
  const harness = createHarness();
  let replayCount = 0;
  await assert.rejects(
    harness.core.retryAfterUnauthorized(async () => {
      replayCount += 1;
      const error = new Error("unauthorized");
      error.status = 401;
      throw error;
    }),
    { status: 401 }
  );
  assert.equal(harness.requests.length, 1);
  assert.equal(replayCount, 1);
  assert.equal(harness.getClearCount(), 1);
});

test("StrictMode-style duplicate bootstrap calls share the same refresh", async () => {
  const harness = createHarness();
  let loadCount = 0;
  const load = async () => {
    loadCount += 1;
    await new Promise((resolve) => setTimeout(resolve, 5));
    return { id: "customer-1" };
  };
  const [first, second] = await Promise.all([
    harness.core.bootstrap(load),
    harness.core.bootstrap(load),
  ]);
  assert.equal(harness.requests.length, 1);
  assert.equal(loadCount, 1);
  assert.equal(first.status, "authenticated");
  assert.equal(second.status, "authenticated");
});
