// CTA action helpers and link generators
import { ENV } from "@/config/env";

export function handleTrialClick(): void {
  if (typeof window !== "undefined") {
    window.location.href = ENV.PLAY_STORE_URL;
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
  const cleanNumber = ENV.WHATSAPP_NUMBER.replace(/\D/g, "");
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}

export function handleWhatsAppClick(message?: string): void {
  if (typeof window !== "undefined") {
    window.open(getWhatsAppUrl(message), "_blank", "noopener,noreferrer");
  }
}

export function getPhoneUrl(): string {
  return `tel:${ENV.PHONE_NUMBER}`;
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
