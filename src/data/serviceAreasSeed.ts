import { ServiceArea } from "@/lib/db/types";

/**
 * Seed data for PuretyFarm serviceable delivery coverage across Raipur, Chhattisgarh.
 * Keyed by 6-digit pincode and area/locality name.
 * Admin can add, edit, or toggle areas here or via the ServiceArea table.
 */
export const SEED_SERVICE_AREAS: Omit<ServiceArea, "id">[] = [
  { pincode: "492001", areaName: "Civil Lines", city: "Raipur", active: true },
  { pincode: "492001", areaName: "Byron Bazar", city: "Raipur", active: true },
  { pincode: "492001", areaName: "Tagore Nagar", city: "Raipur", active: true },
  { pincode: "492001", areaName: "Katora Talab", city: "Raipur", active: true },
  { pincode: "492002", areaName: "Bhanpuri", city: "Raipur", active: true },
  { pincode: "492004", areaName: "Devendra Nagar", city: "Raipur", active: true },
  { pincode: "492004", areaName: "Pandri", city: "Raipur", active: true },
  { pincode: "492004", areaName: "Fafadih", city: "Raipur", active: true },
  { pincode: "492006", areaName: "Telibandha", city: "Raipur", active: true },
  { pincode: "492006", areaName: "VIP Road", city: "Raipur", active: true },
  { pincode: "492006", areaName: "Khamardih", city: "Raipur", active: true },
  { pincode: "492007", areaName: "Shankar Nagar", city: "Raipur", active: true },
  { pincode: "492007", areaName: "Avanti Vihar", city: "Raipur", active: true },
  { pincode: "492009", areaName: "Pachpedi Naka", city: "Raipur", active: true },
  { pincode: "492009", areaName: "Gudhiyari", city: "Raipur", active: true },
  { pincode: "492010", areaName: "Tatibandh", city: "Raipur", active: true },
  { pincode: "492010", areaName: "Amanaka", city: "Raipur", active: true },
  { pincode: "492010", areaName: "Kota", city: "Raipur", active: true },
  { pincode: "492013", areaName: "Samta Colony", city: "Raipur", active: true },
  { pincode: "492013", areaName: "Sundar Nagar", city: "Raipur", active: true },
  { pincode: "492014", areaName: "Mowa", city: "Raipur", active: true },
  { pincode: "492014", areaName: "Daldal Seoni", city: "Raipur", active: true },
  { pincode: "492099", areaName: "Kabir Nagar", city: "Raipur", active: true },
];
