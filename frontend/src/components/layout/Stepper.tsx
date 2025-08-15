// components/Stepper.tsx
import { CheckCircleIcon } from "lucide-react";

export default function Stepper({ steps, currentStep }) {
  return (
    <div className="flex items-center mb-8">
      {steps.map((label, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              currentStep > index + 1
                ? "bg-green-500 text-white"
                : currentStep === index + 1
                ? "bg-indigo-600 text-white"
                : "bg-gray-300 text-gray-700"
            }`}
          >
            {currentStep > index + 1 ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              index + 1
            )}
          </div>
          <span className="ml-2 mr-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          {index < steps.length - 1 && <div className="w-8 border-t border-gray-400" />}
        </div>
      ))}
    </div>
  );
}
