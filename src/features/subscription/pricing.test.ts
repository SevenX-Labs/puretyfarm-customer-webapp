import {
  runAllPricingTestCases,
  calculateSubscriptionPricing,
  MIN_LITRES,
  MAX_LITRES,
} from "./pricing";

console.log("=================================================");
console.log("RUNNING REWORKED PURETYFARM SUBSCRIPTION PRICING TESTS");
console.log("=================================================");

const report = runAllPricingTestCases();

for (const res of report.results) {
  if (res.passed) {
    console.log(`[PASS] Case #${res.id}: ${res.name}`);
    console.log(`       Deliveries: ${res.actual.totalDeliveries}, Litres: ${res.actual.totalLitres}L, Price: ₹${res.actual.totalPrice}`);
    console.log(`       Breakdown: "${res.actual.breakdownText}"`);
  } else {
    console.error(`[FAIL] Case #${res.id}: ${res.name}`);
    console.error(`       ${res.diff}`);
  }
}

console.log("=================================================");
console.log(`SUMMARY: ${report.passedTests} / ${report.totalTests} canonical tests passed`);
console.log(`ALL PASSED: ${report.allPassed}`);
console.log("=================================================");

if (!report.allPassed) {
  process.exit(1);
}

// Additional Boundary and Clamping Checks
console.log("TESTING BOUNDARIES & CLAMPING (1-5L CAP):");

// Test clamping below 1L
const underFixed = calculateSubscriptionPricing({
  frequency: "daily",
  mode: "fixed",
  fixedLitres: 0,
});
if (underFixed.fixedLitres === MIN_LITRES && underFixed.isValid === false) {
  console.log("[PASS] Values below 1L clamped to 1L and flagged invalid");
} else {
  console.error("[FAIL] Values below 1L failed:", underFixed);
  process.exit(1);
}

// Test clamping above 5L
const overFixed = calculateSubscriptionPricing({
  frequency: "alternate",
  mode: "fixed",
  fixedLitres: 9,
});
if (overFixed.fixedLitres === MAX_LITRES && overFixed.isValid === false) {
  console.log("[PASS] Values above 5L clamped to 5L and flagged invalid");
} else {
  console.error("[FAIL] Values above 5L failed:", overFixed);
  process.exit(1);
}

// Test pattern mode boundaries
const patternBoundaries = calculateSubscriptionPricing({
  frequency: "daily",
  mode: "pattern",
  day1Litres: -2,
  day2Litres: 12,
});
if (
  patternBoundaries.day1Litres === MIN_LITRES &&
  patternBoundaries.day2Litres === MAX_LITRES &&
  patternBoundaries.isValid === false
) {
  console.log("[PASS] Pattern day1 and day2 correctly clamped to [1, 5] and flagged invalid");
} else {
  console.error("[FAIL] Pattern boundaries failed:", patternBoundaries);
  process.exit(1);
}

// Test Day 1 == Day 2 allowed
const equalDays = calculateSubscriptionPricing({
  frequency: "alternate",
  mode: "pattern",
  day1Litres: 3,
  day2Litres: 3,
});
if (equalDays.totalLitres === 45 && equalDays.isValid === true) {
  console.log("[PASS] Equal Day 1 and Day 2 allowed and calculated cleanly (15 × 3L = 45L)");
} else {
  console.error("[FAIL] Equal days failed:", equalDays);
  process.exit(1);
}

console.log("=================================================");
console.log("ALL UNIT TESTS & BOUNDARY VALIDATIONS SUCCEEDED!");
console.log("=================================================");
