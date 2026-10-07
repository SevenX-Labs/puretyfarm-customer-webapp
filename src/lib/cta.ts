// CTA action helpers and link generators
import { ENV } from "@/config/env";

export function handleTrialClick(): void {
  if (typeof window !== "undefined") {
    window.location.href = "/account?tab=subscription";
  }
}

export function handleDownloadClick(): void {
  if (typeof window !== "undefined") {
    window.location.href = ENV.PLAY_STORE_URL;
  }
}

export function getWhatsAppUrl(
  message = "Hi PuretyFarm, I would like to know more about the A2 milk 7-day trial in Raipur."
): string {
  let cleanNumber = ENV.WHATSAPP_NUMBER.replace(/\D/g, "");
  if (cleanNumber.length === 10) {
    cleanNumber = `91${cleanNumber}`;
  }
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}

export function handleWhatsAppClick(message?: string): void {
  if (typeof window !== "undefined") {
    window.open(getWhatsAppUrl(message), "_blank", "noopener,noreferrer");
  }
}

export function getPhoneUrl(): string {
  let cleanNumber = ENV.PHONE_NUMBER.replace(/[^\d+]/g, "");
  if (!cleanNumber.startsWith("+")) {
    const digits = cleanNumber.replace(/\D/g, "");
    cleanNumber = digits.length === 10 ? `+91${digits}` : `+${digits}`;
  }
  return `tel:${cleanNumber}`;
}

export function handlePhoneClick(): void {
  if (typeof window !== "undefined") {
    window.location.href = getPhoneUrl();
  }
}

export function getEmailUrl(subject = "PuretyFarm Inquiry"): string {
  const encodedSub = encodeURIComponent(subject);
  return `mailto:${ENV.SUPPORT_EMAIL}?subject=${encodedSub}`;
}

export function handleEmailClick(subject?: string): void {
  if (typeof window !== "undefined") {
    window.location.href = getEmailUrl(subject);
  }
}
