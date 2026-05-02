/**
 * Aceternity Pro — SimplePricingWithThreeTiers
 * Source: ui.aceternity.com/components/simple-pricing-with-three-tiers
 * Pasted verbatim into the repo on 2026-05-04 for G-PRO-2 sprint use
 * (memory item 9).
 *
 * Adaptations from upstream:
 *   - identifiers like `plan.name`, `plan.id`, `plan.pro` restored from
 *     corrupted markdown-link paste artefacts
 *
 * Glatko adapter: components/glatko/verification/VerificationTiersDisplay.tsx
 * wraps `Card` with our verification tier data (basic/business/professional)
 * — keep this file as-is so future Aceternity upstream upgrades stay
 * cherry-pickable.
 */
"use client";
import React from "react";
import { IconCheck, IconPlus } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export enum plan {
  hobby = "hobby",
  starter = "starter",
  pro = "pro",
}

export type Plan = {
  id: string;
  name: string;
  price: number | string;
  subText?: string;
  currency: string;
  features: string[];
  featured?: boolean;
  buttonText?: string;
  additionalFeatures?: string[];
  onClick: () => void;
};

const plans: Array<Plan> = [
  {
    id: plan.hobby,
    name: "Hobby",
    price: 99,
    subText: "/month",
    currency: "$",
    features: [
      "Access to basic analytics reports",
      "Up to 10,000 data points per month",
      "Email support",
      "Community forum access",
      "Cancel anytime",
    ],
    buttonText: "Get Hobby",
    onClick: () => {
      console.log("Get Hobby");
    },
  },
  {
    id: plan.starter,
    name: "Starter",
    price: 299,
    subText: "/month",
    currency: "$",
    featured: true,
    features: [
      "Advanced analytics dashboard",
      "Customizable reports and charts",
      "Real-time data tracking",
      "Integration with third-party tools",
    ],
    buttonText: "Get Starter",
    additionalFeatures: ["Everything in Hobby Plan"],
    onClick: () => {
      console.log("Get Starter");
    },
  },
  {
    id: plan.pro,
    name: "Pro",
    price: 1490,
    subText: "/month",
    currency: "$",
    features: [
      "Unlimited data storage",
      "Customizable dashboards",
      "Advanced data segmentation",
      "Real-time data processing",
      "AI-powered insights and recommendations",
    ],
    additionalFeatures: ["Everything in Hobby Plan", "Everything in Pro Plan"],
    buttonText: "Get Pro",
    onClick: () => {
      console.log("Get Pro");
    },
  },
];

export function SimplePricingWithThreeTiers() {
  return (
    <div className="relative isolate mx-auto max-w-7xl bg-transparent px-4 py-0 sm:py-10 lg:px-4">
      <div
        className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl"
        aria-hidden="true"
      ></div>
      <>
        <h2 className="pt-4 text-center text-lg font-bold text-neutral-800 md:text-4xl dark:text-neutral-100">
          Simple pricing for advanced people
        </h2>
        <p className="mx-auto mt-4 max-w-md text-center text-base text-neutral-600 dark:text-neutral-300">
          Our pricing is designed for advanced people who need more features and
          more flexibility.
        </p>
      </>

      <div
        className={cn(
          "mx-auto mt-20 grid grid-cols-1 gap-4",
          "mx-auto max-w-7xl md:grid-cols-2 xl:grid-cols-3",
        )}
      >
        {plans.map((tier) => {
          return <Card plan={tier} key={tier.id} onClick={tier.onClick} />;
        })}
      </div>
    </div>
  );
}

export const Card = ({ plan, onClick }: { plan: Plan; onClick: () => void }) => {
  return (
    <div
      className={cn(
        "rounded-3xl border border-gray-100 bg-gray-50 p-1 sm:p-4 md:p-4 dark:border-neutral-800 dark:bg-neutral-900",
      )}
    >
      <div className="flex h-full flex-col justify-start gap-4">
        <div
          className={cn(
            "shadow-input w-full rounded-2xl bg-white p-4 dark:bg-neutral-800 dark:shadow-[0px_-1px_0px_0px_var(--neutral-700)]",
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <p
                className={cn("text-lg font-medium text-black dark:text-white")}
              >
                {plan.name}
              </p>
            </div>

            {plan.featured && (
              <div
                className={cn(
                  "relative rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black",
                )}
              >
                <div className="absolute inset-x-0 bottom-0 mx-auto h-px w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                Featured
              </div>
            )}
          </div>
          <div className="mt-8">
            <div className="flex items-end">
              <span
                className={cn(
                  "text-lg font-bold text-neutral-500 dark:text-neutral-200",
                )}
              >
                {plan.currency}
              </span>
              <div className="flex items-start gap-2">
                <span
                  className={cn(
                    "text-3xl font-bold text-neutral-800 md:text-7xl dark:text-neutral-50",
                  )}
                >
                  {plan?.price}
                </span>
              </div>
              <span
                className={cn(
                  "mb-1 text-base font-normal text-neutral-500 md:mb-2 dark:text-neutral-200",
                )}
              >
                {plan.subText}
              </span>
            </div>
          </div>
          <button
            className={cn(
              "mt-10 mb-4 w-full rounded-lg bg-gradient-to-b from-sky-500 to-sky-600 px-2 py-2 font-medium text-white md:w-full",
            )}
            onClick={onClick}
          >
            {plan.buttonText}
          </button>
        </div>
        <div className="mt-1 p-4">
          {plan.features.map((feature, idx) => (
            <Step key={idx}>{feature}</Step>
          ))}
        </div>
        {plan.additionalFeatures && plan.additionalFeatures.length > 0 && (
          <Divider />
        )}
        <div className="p-4">
          {plan.additionalFeatures?.map((feature, idx) => (
            <Step additional key={idx}>
              {feature}
            </Step>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Step = ({
  children,
  additional,
}: {
  children: React.ReactNode;
  additional?: boolean;
  featured?: boolean;
}) => {
  return (
    <div className="my-4 flex items-start justify-start gap-2">
      <div
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-neutral-700",
          additional ? "bg-sky-500" : "bg-neutral-700",
        )}
      >
        <IconCheck className="h-3 w-3 stroke-[4px] text-neutral-300" />
      </div>
      <div className={cn("text-sm font-medium text-black dark:text-white")}>
        {children}
      </div>
    </div>
  );
};

export const Divider = () => {
  return (
    <div className="relative">
      <div className={cn("h-px w-full bg-white dark:bg-neutral-950")} />
      <div className={cn("h-px w-full bg-neutral-200 dark:bg-neutral-800")} />
      <div
        className={cn(
          "absolute inset-0 m-auto flex h-5 w-5 items-center justify-center rounded-xl bg-white shadow-[0px_-1px_0px_0px_var(--neutral-200)] dark:bg-neutral-800 dark:shadow-[0px_-1px_0px_0px_var(--neutral-700)]",
        )}
      >
        <IconPlus
          className={cn(
            "h-3 w-3 stroke-[4px] text-black dark:text-neutral-300",
          )}
        />
      </div>
    </div>
  );
};
