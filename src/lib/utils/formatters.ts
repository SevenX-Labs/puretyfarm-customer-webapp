/**
 * Currency formatter for Indian Rupees (₹)
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * Standard Indian date formatter
 */
export function formatDate(dateString: string | number | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Standard phone number normalization and display helpers
 */
export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

/**
 * Clean 10-digit number from any raw input
 */
export function extract10DigitPhone(raw: string): string {
  return raw.replace(/\D/g, "").slice(-10);
}
