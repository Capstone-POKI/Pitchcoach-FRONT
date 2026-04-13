"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

type Step = {
  key: string;
  label: string;
};

interface StepNavbarProps {
  steps: Step[];
  currentStep: number; // 0-based index
}

export default function StepNavbar({ steps, currentStep }: StepNavbarProps) {
  const router = useRouter();

  return (
    <div className="w-full border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mr-6 flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <Icon icon="mdi:arrow-left" className="h-4 w-4" />
          뒤로가기
        </button>

        {/* Steps */}
        <div className="flex flex-1 items-center justify-center">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={step.key} className="flex items-center">
                {/* Circle */}
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold
                    ${
                      isActive || isCompleted
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-white"
                    }
                  `}
                >
                  {index + 1}
                </div>

                {/* Label */}
                <span
                  className={`ml-2 text-sm font-medium
                    ${
                      isActive || isCompleted
                        ? "text-blue-600"
                        : "text-gray-400"
                    }
                  `}
                >
                  {step.label}
                </span>

                {/* Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`mx-4 h-[1px] w-12
                      ${index < currentStep ? "bg-blue-600" : "bg-gray-300"}
                    `}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
