import test from "node:test";
import assert from "node:assert/strict";

// Test suite for SWR Cache, loading states, and dynamic pricing

test("SWR Cache: Scoped key by user ID", () => {
  const getScopedKey = (userId, resource) => {
    const uid = userId?.trim() || "anonymous";
    return uid + ":" + resource;
  };

  assert.equal(getScopedKey("user_sahil", "profile"), "user_sahil:profile");
  assert.equal(getScopedKey("user_harman", "dashboard"), "user_harman:dashboard");
  assert.equal(getScopedKey("", "wallet"), "anonymous:wallet");
  assert.equal(getScopedKey(null, "orders"), "anonymous:orders");
  assert.notEqual(getScopedKey("user_sahil", "wallet"), getScopedKey("user_harman", "wallet"));
});

test("SWR Cache: In-flight request deduplication", async () => {
  const inFlightRequests = new Map();
  let networkCallCount = 0;

  async function deduplicatedFetch(key, fn) {
    let promise = inFlightRequests.get(key);
    if (!promise) {
      promise = (async () => {
        try {
          return await fn();
        } finally {
          inFlightRequests.delete(key);
        }
      })();
      inFlightRequests.set(key, promise);
    }
    return promise;
  }

  const mockApiCall = async () => {
    networkCallCount++;
    await new Promise((r) => setTimeout(r, 20));
    return { balancePaise: 50000 };
  };

  // Launch 5 concurrent calls for the same key
  const results = await Promise.all([
    deduplicatedFetch("user_1:wallet", mockApiCall),
    deduplicatedFetch("user_1:wallet", mockApiCall),
    deduplicatedFetch("user_1:wallet", mockApiCall),
    deduplicatedFetch("user_1:wallet", mockApiCall),
    deduplicatedFetch("user_1:wallet", mockApiCall),
  ]);

  assert.equal(networkCallCount, 1, "Expected exactly 1 network call for 5 concurrent identical requests");
  assert.deepEqual(results[0], { balancePaise: 50000 });
  assert.deepEqual(results[4], { balancePaise: 50000 });
});

test("SWR Cache: Clear on logout or user switch scopes correctly", () => {
  const store = new Map();
  store.set("user_sahil:profile", { name: "Sahil Hode" });
  store.set("user_sahil:wallet", { balance: 100 });
  store.set("user_harman:profile", { name: "Harman" });
  store.set("user_harman:plan", { planType: "MONTHLY" });

  function clearUserCache(userId) {
    if (!userId) {
      store.clear();
      return;
    }
    const prefix = userId + ":";
    for (const k of Array.from(store.keys())) {
      if (k.startsWith(prefix)) {
        store.delete(k);
      }
    }
  }

  clearUserCache("user_sahil");
  assert.equal(store.has("user_sahil:profile"), false);
  assert.equal(store.has("user_sahil:wallet"), false);
  assert.equal(store.has("user_harman:profile"), true);
  assert.equal(store.has("user_harman:plan"), true);

  clearUserCache();
  assert.equal(store.size, 0);
});

test("SWR Cache: Last good data kept on refetch error", async () => {
  let cache = { data: { name: "Sahil Hode", ordersCount: 12 }, timestamp: Date.now(), error: null };

  async function refetchData(fail) {
    try {
      if (fail) throw new Error("Server 500 timeout");
      cache.data = { name: "Sahil Hode", ordersCount: 13 };
    } catch (err) {
      // NEVER wipe existing cache.data on error
      cache.error = err;
    }
    return cache.data;
  }

  const resultOnError = await refetchData(true);
  assert.equal(resultOnError.name, "Sahil Hode", "Must keep last good data on error");
  assert.equal(resultOnError.ordersCount, 12, "Must not wipe previous count");
  assert.ok(cache.error, "Error should be recorded without destroying data");
});

test("Loading state & Counts: Never show 0 count or fallback before data loads", () => {
  function renderOrderCountBadge(loaded, orders) {
    if (!loaded) return null; // Skeletons or hidden before loaded
    return "(" + orders.length + ")";
  }

  assert.equal(renderOrderCountBadge(false, []), null, "Count must be hidden before data loads");
  assert.equal(renderOrderCountBadge(true, [{ id: 1 }]), "(1)");
  assert.equal(renderOrderCountBadge(true, []), "(0)");
});

test("Profile source of truth: Never flash Customer fallback if name exists or loading", () => {
  function resolveDisplayName(isProfileLoaded, profile, fallbackMobile) {
    if (!isProfileLoaded && !profile?.name) {
      return { type: "skeleton" };
    }
    if (profile?.name) {
      return { type: "name", value: profile.name };
    }
    const last4 = fallbackMobile ? fallbackMobile.slice(-4) : "1566";
    return { type: "fallback", value: "Customer (" + last4 + ")" };
  }

  // Initial state: profile not yet loaded
  assert.deepEqual(resolveDisplayName(false, null, "9876541566"), { type: "skeleton" });

  // Loaded with real name:
  assert.deepEqual(resolveDisplayName(true, { name: "Sahil Hode" }, "9876541566"), {
    type: "name",
    value: "Sahil Hode",
  });

  // Transient error during revalidation: keep existing profile name
  assert.deepEqual(resolveDisplayName(false, { name: "Sahil Hode" }, "9876541566"), {
    type: "name",
    value: "Sahil Hode",
  });

  // Genuinely nameless customer after successful load:
  assert.deepEqual(resolveDisplayName(true, { name: "" }, "9876541566"), {
    type: "fallback",
    value: "Customer (1566)",
  });
});

test("Plan pricing: Dynamically renders from API data matching Admin PlanConfig without hardcoded ₹75", () => {
  function getPlanDisplayPrices(monthlyConfig, trialQuote, buyOnceQuote) {
    const trialRate = trialQuote?.sellingPricePerLitre
      ? Math.round(trialQuote.sellingPricePerLitre / 100)
      : null;
    const trialTotal = trialQuote?.totalSellingAmount
      ? Math.round(trialQuote.totalSellingAmount / 100)
      : trialRate ? trialRate * 7 : null;

    const monthlyRate = monthlyConfig?.sellingPricePerLitre
      ? Math.round(monthlyConfig.sellingPricePerLitre / 100)
      : null;
    const monthlyTotal = monthlyRate ? monthlyRate * 30 : null;

    const buyOncePrice = buyOnceQuote?.totalSellingAmount
      ? Math.round(buyOnceQuote.totalSellingAmount / 100)
      : buyOnceQuote?.sellingPricePerLitre
      ? Math.round(buyOnceQuote.sellingPricePerLitre / 100)
      : null;

    return {
      trial: trialTotal ? { price: trialTotal, rate: trialRate } : { skeleton: true },
      monthly: monthlyTotal ? { price: monthlyTotal, rate: monthlyRate } : { skeleton: true },
      buyOnce: buyOncePrice ? { price: buyOncePrice } : { skeleton: true },
    };
  }

  // Skeletons when data is loading:
  const loadingDisplay = getPlanDisplayPrices(null, null, null);
  assert.deepEqual(loadingDisplay.trial, { skeleton: true });
  assert.deepEqual(loadingDisplay.monthly, { skeleton: true });
  assert.deepEqual(loadingDisplay.buyOnce, { skeleton: true });

  // Live Raipur Admin rates (Monthly ₹90, Trial ₹95, Buy Once ₹100):
  const mockMonthlyConfig = { sellingPricePerLitre: 9000 };
  const mockTrialQuote = { sellingPricePerLitre: 9500, totalSellingAmount: 66500 };
  const mockBuyOnceQuote = { sellingPricePerLitre: 10000, totalSellingAmount: 10000 };

  const loadedDisplay = getPlanDisplayPrices(mockMonthlyConfig, mockTrialQuote, mockBuyOnceQuote);
  assert.deepEqual(loadedDisplay.monthly, { price: 2700, rate: 90 });
  assert.deepEqual(loadedDisplay.trial, { price: 665, rate: 95 });
  assert.deepEqual(loadedDisplay.buyOnce, { price: 100 });
});
