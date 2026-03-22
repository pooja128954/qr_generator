import { useMemo } from "react";
import { useProfile } from "./useProfile";
import { PLANS, TRIAL_DURATION_DAYS, PlanConfig } from "@/lib/plans";
import { PlanType } from "@/lib/database.types";

export function usePlan() {
  const { data: profile, isLoading } = useProfile();

  const planInfo = useMemo(() => {
    if (!profile) {
      return {
        plan: "economic" as PlanType,
        effectivePlan: "economic" as PlanType,
        isTrial: false,
        isTrialExpired: false,
        trialDaysLeft: 0,
        limits: PLANS.economic,
      };
    }

    const currentPlan = profile.plan;
    let effectivePlan = currentPlan;
    let isTrialExpired = false;
    let trialDaysLeft = 0;

    if (currentPlan === "trial" && profile.trial_end_date) {
      const end = new Date(profile.trial_end_date).getTime();
      const now = new Date().getTime();
      const diffDays = (end - now) / (1000 * 60 * 60 * 24);

      trialDaysLeft = Math.max(0, Math.ceil(diffDays));
      isTrialExpired = diffDays <= 0;

      if (isTrialExpired) {
        effectivePlan = "economic"; // Fallback to economic if trial is over
      } else {
        effectivePlan = "elegant"; // Explicitly map active trials to elegant tier limits
      }
    }

    const limits = PLANS[effectivePlan];

    return {
      plan: currentPlan,
      effectivePlan,
      isTrial: currentPlan === "trial",
      isTrialExpired,
      trialDaysLeft,
      limits: limits as PlanConfig,
    };
  }, [profile]);

  return { ...planInfo, isLoading };
}
