import { SERVICEABLE_AREAS_DATA } from "@/content/serviceAreas";
import { ServiceArea } from "@/types/models";

export const SEED_SERVICE_AREAS: Omit<ServiceArea, "id">[] = SERVICEABLE_AREAS_DATA;
