import "server-only";
import fs from "fs";
import path from "path";
import {
  User,
  OtpRecord,
  Address,
  Order,
  Subscription,
  ServiceArea,
  WaitlistRequest,
  OnboardingStatus,
  deriveOnboardingStatus,
} from "./types";
import { SEED_SERVICE_AREAS } from "@/data/serviceAreasSeed";

interface DbSchema {
  users: Record<string, User>; // userId -> User
  usersByPhone: Record<string, string>; // phone -> userId
  otps: Record<string, OtpRecord>; // phone -> OtpRecord
  addresses: Record<string, Address>; // addressId -> Address
  orders: Record<string, Order>; // orderId -> Order
  subscriptions: Record<string, Subscription>; // userId -> Subscription
  serviceAreas: Record<string, ServiceArea>; // areaId -> ServiceArea
  waitlistRequests: Record<string, WaitlistRequest>; // id -> WaitlistRequest
}

// Global in-memory cache to survive hot reloads in dev
declare global {
  var __pf_db__: DbSchema | undefined;
}

const DB_FILE_PATH = path.join(process.cwd(), ".dev-db.json");

function loadDb(): DbSchema {
  if (global.__pf_db__) {
    return global.__pf_db__;
  }

  const initialData: DbSchema = {
    users: {},
    usersByPhone: {},
    otps: {},
    addresses: {},
    orders: {},
    subscriptions: {},
    serviceAreas: {},
    waitlistRequests: {},
  };

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      const merged: DbSchema = {
        ...initialData,
        ...parsed,
        serviceAreas: parsed.serviceAreas || {},
        waitlistRequests: parsed.waitlistRequests || {},
      };

      // Auto-seed service areas if empty
      if (Object.keys(merged.serviceAreas).length === 0) {
        SEED_SERVICE_AREAS.forEach((item, idx) => {
          const id = `sa_${item.pincode}_${idx}`;
          merged.serviceAreas[id] = { id, ...item };
        });
      }

      global.__pf_db__ = merged;
      return merged;
    }
  } catch {
    // If file read fails (e.g. read-only filesystem or invalid JSON), use memory
  }

  // Seed initial memory
  SEED_SERVICE_AREAS.forEach((item, idx) => {
    const id = `sa_${item.pincode}_${idx}`;
    initialData.serviceAreas[id] = { id, ...item };
  });

  global.__pf_db__ = initialData;
  return initialData;
}

function saveDb(): void {
  const db = global.__pf_db__;
  if (!db) return;

  try {
    // Only attempt disk write in non-production local environments
    if (process.env.NODE_ENV !== "production") {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
    }
  } catch {
    // Graceful fallback for serverless or read-only filesystems
  }
}

export const db = {
  // --- USERS ---
  async getUserByPhone(phone: string): Promise<User | null> {
    const data = loadDb();
    const userId = data.usersByPhone[phone];
    if (!userId) return null;
    return data.users[userId] || null;
  },

  async getUserById(id: string): Promise<User | null> {
    const data = loadDb();
    return data.users[id] || null;
  },

  async createUser(userData: {
    phone: string;
    name: string;
    email?: string;
    avatarUrl?: string;
  }): Promise<User> {
    const data = loadDb();
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newUser: User = {
      id,
      phone: userData.phone,
      name: userData.name,
      email: userData.email || "",
      avatarUrl: userData.avatarUrl || "",
      createdAt: now,
      updatedAt: now,
    };

    data.users[id] = newUser;
    data.usersByPhone[userData.phone] = id;
    saveDb();
    return newUser;
  },

  async updateUser(
    id: string,
    updates: Partial<Pick<User, "name" | "email" | "avatarUrl">>
  ): Promise<User | null> {
    const data = loadDb();
    const existing = data.users[id];
    if (!existing) return null;

    const updatedUser: User = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    data.users[id] = updatedUser;
    saveDb();
    return updatedUser;
  },

  async getUserOnboardingStatus(userId: string): Promise<OnboardingStatus> {
    const data = loadDb();
    const user = data.users[userId] || null;
    const addresses = Object.values(data.addresses).filter((a) => a.userId === userId);
    const orders = Object.values(data.orders).filter((o) => o.userId === userId);
    const subscription = data.subscriptions[userId] || null;

    return deriveOnboardingStatus(user, addresses, orders, subscription);
  },

  // --- OTPs ---
  async getOtp(phone: string): Promise<OtpRecord | null> {
    const data = loadDb();
    return data.otps[phone] || null;
  },

  async saveOtp(otp: OtpRecord): Promise<void> {
    const data = loadDb();
    data.otps[otp.phone] = otp;
    saveDb();
  },

  async incrementOtpAttempts(phone: string): Promise<number> {
    const data = loadDb();
    const record = data.otps[phone];
    if (!record) return 0;
    record.attempts += 1;
    saveDb();
    return record.attempts;
  },

  async deleteOtp(phone: string): Promise<void> {
    const data = loadDb();
    delete data.otps[phone];
    saveDb();
  },

  // --- ADDRESSES ---
  async getAddressesByUserId(userId: string): Promise<Address[]> {
    const data = loadDb();
    return Object.values(data.addresses)
      .filter((addr) => addr.userId === userId)
      .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
  },

  async getAddressById(id: string, userId: string): Promise<Address | null> {
    const data = loadDb();
    const addr = data.addresses[id];
    if (!addr || addr.userId !== userId) return null;
    return addr;
  },

  async createAddress(
    addressData: Omit<Address, "id" | "createdAt">
  ): Promise<Address> {
    const data = loadDb();
    const id = `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // If marked default, unset default on other addresses for this user
    if (addressData.isDefault) {
      for (const key of Object.keys(data.addresses)) {
        if (data.addresses[key].userId === addressData.userId) {
          data.addresses[key].isDefault = false;
        }
      }
    } else {
      // If this is user's first address, make default
      const existing = Object.values(data.addresses).filter(
        (a) => a.userId === addressData.userId
      );
      if (existing.length === 0) {
        addressData.isDefault = true;
      }
    }

    const newAddress: Address = {
      ...addressData,
      id,
      createdAt: new Date().toISOString(),
    };

    data.addresses[id] = newAddress;
    saveDb();
    return newAddress;
  },

  async updateAddress(
    id: string,
    userId: string,
    updates: Partial<Omit<Address, "id" | "userId" | "createdAt">>
  ): Promise<Address | null> {
    const data = loadDb();
    const existing = data.addresses[id];
    if (!existing || existing.userId !== userId) return null;

    if (updates.isDefault) {
      for (const key of Object.keys(data.addresses)) {
        if (data.addresses[key].userId === userId) {
          data.addresses[key].isDefault = false;
        }
      }
    }

    const updated = { ...existing, ...updates };
    data.addresses[id] = updated;
    saveDb();
    return updated;
  },

  async deleteAddress(id: string, userId: string): Promise<boolean> {
    const data = loadDb();
    const existing = data.addresses[id];
    if (!existing || existing.userId !== userId) return false;

    delete data.addresses[id];
    saveDb();
    return true;
  },

  // --- ORDERS ---
  async getOrdersByUserId(userId: string): Promise<Order[]> {
    const data = loadDb();
    return Object.values(data.orders)
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getOrderById(id: string, userId: string): Promise<Order | null> {
    const data = loadDb();
    const order = data.orders[id];
    if (!order || order.userId !== userId) return null;
    return order;
  },

  async createOrder(
    orderData: Omit<Order, "id" | "createdAt" | "updatedAt">
  ): Promise<Order> {
    const data = loadDb();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const id = `PF-${Date.now().toString().slice(-4)}${randomSuffix}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    data.orders[id] = newOrder;
    saveDb();
    return newOrder;
  },

  // --- SUBSCRIPTIONS ---
  async getSubscriptionByUserId(userId: string): Promise<Subscription | null> {
    const data = loadDb();
    return data.subscriptions[userId] || null;
  },

  async setSubscription(
    subData: Omit<Subscription, "id" | "startedAt" | "updatedAt">
  ): Promise<Subscription> {
    const data = loadDb();
    const existing = data.subscriptions[subData.userId];
    const now = new Date().toISOString();

    const subscription: Subscription = {
      ...subData,
      id: existing ? existing.id : `sub_${Date.now()}`,
      startedAt: existing ? existing.startedAt : now,
      updatedAt: now,
    };

    data.subscriptions[subData.userId] = subscription;
    saveDb();
    return subscription;
  },

  async updateSubscriptionStatus(
    userId: string,
    status: "active" | "paused" | "cancelled"
  ): Promise<Subscription | null> {
    const data = loadDb();
    const existing = data.subscriptions[userId];
    if (!existing) return null;

    existing.status = status;
    existing.updatedAt = new Date().toISOString();
    saveDb();
    return existing;
  },

  // --- SERVICE AREAS ---
  async getAllServiceAreas(): Promise<ServiceArea[]> {
    const data = loadDb();
    return Object.values(data.serviceAreas);
  },

  async checkServiceability(
    pincode?: string,
    areaName?: string
  ): Promise<{
    serviceable: boolean;
    areaName?: string;
    pincode?: string;
    reason?: string;
  }> {
    const data = loadDb();
    const areas = Object.values(data.serviceAreas).filter((a) => a.active);

    const cleanPin = pincode ? pincode.replace(/\D/g, "").trim() : "";
    const cleanArea = areaName ? areaName.toLowerCase().trim() : "";

    // 1. Direct match by 6-digit Pincode
    if (cleanPin.length === 6) {
      const pinMatches = areas.filter((a) => a.pincode === cleanPin);
      if (pinMatches.length > 0) {
        // If an area name was also provided, look for exact area in this pin
        if (cleanArea) {
          const areaMatch = pinMatches.find((a) =>
            a.areaName.toLowerCase().includes(cleanArea) ||
            cleanArea.includes(a.areaName.toLowerCase())
          );
          if (areaMatch) {
            return {
              serviceable: true,
              areaName: areaMatch.areaName,
              pincode: cleanPin,
            };
          }
        }
        return {
          serviceable: true,
          areaName: pinMatches[0].areaName,
          pincode: cleanPin,
        };
      }
    }

    // 2. Fallback: match by Area / Locality name in Raipur
    if (cleanArea && cleanArea.length >= 3) {
      const areaMatch = areas.find((a) =>
        a.areaName.toLowerCase() === cleanArea ||
        a.areaName.toLowerCase().includes(cleanArea) ||
        cleanArea.includes(a.areaName.toLowerCase())
      );
      if (areaMatch) {
        return {
          serviceable: true,
          areaName: areaMatch.areaName,
          pincode: areaMatch.pincode,
        };
      }
    }

    // Development phase: accept all pincodes and localities so no customer is blocked
    return {
      serviceable: true,
      areaName: (areaName && areaName.trim()) || "Raipur Delivery Route",
      pincode: cleanPin.length === 6 ? cleanPin : "492001",
    };
  },

  async addServiceArea(area: Omit<ServiceArea, "id">): Promise<ServiceArea> {
    const data = loadDb();
    const id = `sa_${area.pincode}_${Date.now().toString().slice(-4)}`;
    const newArea: ServiceArea = { id, ...area };
    data.serviceAreas[id] = newArea;
    saveDb();
    return newArea;
  },

  async deleteServiceArea(id: string): Promise<boolean> {
    const data = loadDb();
    if (!data.serviceAreas[id]) return false;
    delete data.serviceAreas[id];
    saveDb();
    return true;
  },

  // --- WAITLIST ---
  async createWaitlistRequest(
    data: Omit<WaitlistRequest, "id" | "createdAt">
  ): Promise<WaitlistRequest> {
    const dbData = loadDb();
    const id = `wl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newReq: WaitlistRequest = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    dbData.waitlistRequests[id] = newReq;
    saveDb();
    return newReq;
  },

  async getWaitlistRequests(): Promise<WaitlistRequest[]> {
    const data = loadDb();
    return Object.values(data.waitlistRequests).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
};
