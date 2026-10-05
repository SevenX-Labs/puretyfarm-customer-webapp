import { env } from "@/lib/config/env";

export const CONTACT_INFO = {
  phone: {
    number: env.NEXT_PUBLIC_PHONE_NUMBER,
    display: env.NEXT_PUBLIC_PHONE_DISPLAY,
    hours: "5:30 AM – 7:00 PM",
  },
  whatsapp: {
    number: env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    display: env.NEXT_PUBLIC_WHATSAPP_DISPLAY,
  },
  email: {
    address: env.NEXT_PUBLIC_SUPPORT_EMAIL,
    supportHours: "Customer service & corporate supply",
  },
  hub: {
    title: "VIP Road Delivery Hub & Cold Chaining Center",
    city: "Raipur",
    state: "Chhattisgarh",
    fullAddress: "VIP Road Delivery Hub & Cold Chaining Center, Raipur, Chhattisgarh",
  },
} as const;
