import { PricingOptions, PricingResult } from "./types";

/**
 * Standard business constants for PuretyFarm Milk Subscriptions
 */
export const BASE_PRICE_PER_LITRE = 75;
export const BILLING_CYCLE_DAYS = 30;
export const DAILY_DELIVERIES = 30;
export const ALTERNATE_DELIVERIES = 15;
export const MIN_LITRES = 1;
export const MAX_LITRES = 5;
export const CUT_OFF_HOUR = 22; // 10:00 PM cutoff

/**
 * Validates and clamps quantity between MIN_LITRES and MAX_LITRES.
 */
export function sanitizeLitres(
  val: number | undefined,
  defaultLitres: number = 1
): {
  clamped: number;
  isValid: boolean;
  error?: string;
} {
  if (typeof val !== "number" || isNaN(val)) {
    return {
      clamped: defaultLitres,
      isValid: false,
      error: `Quantity must be a valid number between ${MIN_LITRES}L and ${MAX_LITRES}L.`,
    };
  }

  const rounded = Math.round(val);

  if (rounded < MIN_LITRES) {
    return {
      clamped: MIN_LITRES,
      isValid: false,
      error: `Minimum delivery is ${MIN_LITRES} Litre.`,
    };
  }

  if (rounded > MAX_LITRES) {
    return {
      clamped: MAX_LITRES,
      isValid: false,
      error: `Maximum limit is ${MAX_LITRES} Litres per delivery.`,
    };
  }

  return {
    clamped: rounded,
    isValid: true,
  };
}

/**
 * Pure calculation function for PuretyFarm subscription pricing.
 * Computes exact deliveries, litres, price, and dynamic breakdown string.
 */
export function calculateSubscriptionPricing(options: PricingOptions): PricingResult {
  const { frequency, mode } = options;

  // 1. Total deliveries for the cycle
  const totalDeliveries = frequency === "daily" ? DAILY_DELIVERIES : ALTERNATE_DELIVERIES;

  let isValid = true;
  let validationError: string | undefined = undefined;

  let fixedLitres = 1;
  let day1Litres = 1;
  let day2Litres = 2;
  let oddDeliveriesCount = 0;
  let evenDeliveriesCount = 0;
  let totalLitres = 0;
  let breakdownText = "";

  if (mode === "fixed") {
    const check = sanitizeLitres(options.fixedLitres, 1);
    fixedLitres = check.clamped;
    if (!check.isValid) {
      isValid = false;
      validationError = check.error;
    }

    oddDeliveriesCount = totalDeliveries;
    evenDeliveriesCount = 0;
    totalLitres = totalDeliveries * fixedLitres;

    // Fixed format: "${totalDeliveries} deliveries × ${fixedLitres}L = ${totalLitres}L"
    breakdownText = `${totalDeliveries} deliveries × ${fixedLitres}L = ${totalLitres}L`;
  } else {
    // Mode: "pattern" (Day 1 → Day 2)
    const check1 = sanitizeLitres(options.day1Litres, 1);
    const check2 = sanitizeLitres(options.day2Litres, 2);

    day1Litres = check1.clamped;
    day2Litres = check2.clamped;

    if (!check1.isValid) {
      isValid = false;
      validationError = check1.error;
    } else if (!check2.isValid) {
      isValid = false;
      validationError = check2.error;
    }

    // Delivery indexing: oddCount = ceil(D/2), evenCount = floor(D/2)
    // Daily (30): 15 odd deliveries, 15 even deliveries
    // Alternate (15): 8 odd deliveries, 7 even deliveries
    oddDeliveriesCount = Math.ceil(totalDeliveries / 2);
    evenDeliveriesCount = Math.floor(totalDeliveries / 2);

    totalLitres = oddDeliveriesCount * day1Litres + evenDeliveriesCount * day2Litres;

    // Pattern format: "${oddCount} × ${day1}L + ${evenCount} × ${day2}L = ${totalLitres}L"
    breakdownText = `${oddDeliveriesCount} × ${day1Litres}L + ${evenDeliveriesCount} × ${day2Litres}L = ${totalLitres}L`;
  }

  const totalPrice = totalLitres * BASE_PRICE_PER_LITRE;

  return {
    frequency,
    mode,
    totalDeliveries,
    totalLitres,
    pricePerLitre: BASE_PRICE_PER_LITRE,
    totalPrice,
    breakdownText,
    oddDeliveriesCount,
    evenDeliveriesCount,
    day1Litres,
    day2Litres,
    fixedLitres,
    isValid,
    validationError,
  };
}

/**
 * 8 Required Canonical Test Cases from Spec
 */
export interface PricingTestCase {
  id: number;
  frequency: "daily" | "alternate";
  mode: "fixed" | "pattern";
  litresDesc: string;
  input: PricingOptions;
  expected: {
    totalDeliveries: number;
    totalLitres: number;
    totalPrice: number;
    breakdownText: string;
    oddDeliveriesCount: number;
    evenDeliveriesCount: number;
  };
}

export const PRICING_TEST_CASES: PricingTestCase[] = [
  {
    id: 1,
    frequency: "daily",
    mode: "fixed",
    litresDesc: "1L",
    input: { frequency: "daily", mode: "fixed", fixedLitres: 1 },
    expected: {
      totalDeliveries: 30,
      totalLitres: 30,
      totalPrice: 2250,
      breakdownText: "30 deliveries × 1L = 30L",
      oddDeliveriesCount: 30,
      evenDeliveriesCount: 0,
    },
  },
  {
    id: 2,
    frequency: "alternate",
    mode: "fixed",
    litresDesc: "1L",
    input: { frequency: "alternate", mode: "fixed", fixedLitres: 1 },
    expected: {
      totalDeliveries: 15,
      totalLitres: 15,
      totalPrice: 1125,
      breakdownText: "15 deliveries × 1L = 15L",
      oddDeliveriesCount: 15,
      evenDeliveriesCount: 0,
    },
  },
  {
    id: 3,
    frequency: "daily",
    mode: "fixed",
    litresDesc: "5L",
    input: { frequency: "daily", mode: "fixed", fixedLitres: 5 },
    expected: {
      totalDeliveries: 30,
      totalLitres: 150,
      totalPrice: 11250,
      breakdownText: "30 deliveries × 5L = 150L",
      oddDeliveriesCount: 30,
      evenDeliveriesCount: 0,
    },
  },
  {
    id: 4,
    frequency: "alternate",
    mode: "fixed",
    litresDesc: "5L",
    input: { frequency: "alternate", mode: "fixed", fixedLitres: 5 },
    expected: {
      totalDeliveries: 15,
      totalLitres: 75,
      totalPrice: 5625,
      breakdownText: "15 deliveries × 5L = 75L",
      oddDeliveriesCount: 15,
      evenDeliveriesCount: 0,
    },
  },
  {
    id: 5,
    frequency: "daily",
    mode: "pattern",
    litresDesc: "1 / 2",
    input: { frequency: "daily", mode: "pattern", day1Litres: 1, day2Litres: 2 },
    expected: {
      totalDeliveries: 30,
      totalLitres: 45,
      totalPrice: 3375,
      breakdownText: "15 × 1L + 15 × 2L = 45L",
      oddDeliveriesCount: 15,
      evenDeliveriesCount: 15,
    },
  },
  {
    id: 6,
    frequency: "alternate",
    mode: "pattern",
    litresDesc: "1 / 2",
    input: { frequency: "alternate", mode: "pattern", day1Litres: 1, day2Litres: 2 },
    expected: {
      totalDeliveries: 15,
      totalLitres: 22,
      totalPrice: 1650,
      breakdownText: "8 × 1L + 7 × 2L = 22L",
      oddDeliveriesCount: 8,
      evenDeliveriesCount: 7,
    },
  },
  {
    id: 7,
    frequency: "daily",
    mode: "pattern",
    litresDesc: "2 / 5",
    input: { frequency: "daily", mode: "pattern", day1Litres: 2, day2Litres: 5 },
    expected: {
      totalDeliveries: 30,
      totalLitres: 105,
      totalPrice: 7875,
      breakdownText: "15 × 2L + 15 × 5L = 105L",
      oddDeliveriesCount: 15,
      evenDeliveriesCount: 15,
    },
  },
  {
    id: 8,
    frequency: "alternate",
    mode: "pattern",
    litresDesc: "2 / 5",
    input: { frequency: "alternate", mode: "pattern", day1Litres: 2, day2Litres: 5 },
    expected: {
      totalDeliveries: 15,
      totalLitres: 51,
      totalPrice: 3825,
      breakdownText: "8 × 2L + 7 × 5L = 51L",
      oddDeliveriesCount: 8,
      evenDeliveriesCount: 7,
    },
  },
];

export function runAllPricingTestCases() {
  let passedTests = 0;
  const results = PRICING_TEST_CASES.map((tc) => {
    const actual = calculateSubscriptionPricing(tc.input);
    const passed =
      actual.totalDeliveries === tc.expected.totalDeliveries &&
      actual.totalLitres === tc.expected.totalLitres &&
      actual.totalPrice === tc.expected.totalPrice &&
      actual.breakdownText === tc.expected.breakdownText &&
      actual.oddDeliveriesCount === tc.expected.oddDeliveriesCount &&
      actual.evenDeliveriesCount === tc.expected.evenDeliveriesCount;

    if (passed) passedTests++;

    return {
      id: tc.id,
      name: `${tc.frequency} | ${tc.mode} | ${tc.litresDesc}`,
      passed,
      actual,
      expected: tc.expected,
      diff: passed
        ? undefined
        : `Expected ${JSON.stringify(tc.expected)} but got ${JSON.stringify(actual)}`,
    };
  });

  return {
    allPassed: passedTests === PRICING_TEST_CASES.length,
    totalTests: PRICING_TEST_CASES.length,
    passedTests,
    results,
  };
}

/**
 * Generates an unambiguous schedule preview of the first 4 deliveries with dates and litres.
 */
export function getDeliverySchedulePreview(
  frequency: "daily" | "alternate",
  mode: "fixed" | "pattern",
  fixedLitres: number,
  day1Litres: number,
  day2Litres: number,
  startDate?: Date | string
): {
  deliveryNumber: number;
  formattedDate: string;
  litres: number;
}[] {
  const baseDate = startDate ? new Date(startDate) : new Date();
  if (!startDate) {
    baseDate.setDate(baseDate.getDate() + 1); // Default to tomorrow dawn
  }

  const items: {
    deliveryNumber: number;
    formattedDate: string;
    litres: number;
  }[] = [];
  const stepDays = frequency === "daily" ? 1 : 2;

  const formatter = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
  });

  for (let i = 0; i < 4; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i * stepDays);

    const litres =
      mode === "fixed"
        ? fixedLitres
        : i % 2 === 0
        ? day1Litres
        : day2Litres;

    items.push({
      deliveryNumber: i + 1,
      formattedDate: formatter.format(d),
      litres,
    });
  }

  return items;
}
