import { PlanType } from "./database.types";

export type ExportFormat = "png" | "svg" | "pdf";
export type AnalyticsLevel = "basic" | "premium" | "full";

export interface PlanConfig {
  name: string;
  qrLimit: number;
  scanLimit: number;
  analytics: AnalyticsLevel;
  canCustomize: boolean;
  exports: ExportFormat[];
}

export const TRIAL_DURATION_DAYS = 3;

export const PLANS: Record<PlanType, PlanConfig> = {
  trial: {
    name: "Free Trial (Premium)",
    qrLimit: 300,
    scanLimit: 10000,
    analytics: "premium",
    canCustomize: true,
    exports: ["png", "svg", "pdf"],
  },
  economic: {
    name: "Economic",
    qrLimit: 50,
    scanLimit: 1000,
    analytics: "basic",
    canCustomize: false,
    exports: ["png"],
  },
  premium: {
    name: "Premium",
    qrLimit: 300,
    scanLimit: 10000,
    analytics: "premium",
    canCustomize: true,
    exports: ["png", "svg", "pdf"],
  },
  elegant: {
    name: "Elegant",
    qrLimit: Infinity,
    scanLimit: Infinity,
    analytics: "full",
    canCustomize: true,
    exports: ["png", "svg", "pdf"],
  },
};
