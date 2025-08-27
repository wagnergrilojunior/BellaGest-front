import React from 'react';
import { Check } from 'lucide-react';

const StepIndicator = ({ currentStep, steps }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0 mb-8">
        {steps.map((step, index) => {
          const stepIndex = index + 1;
          const isCompleted = currentStep > stepIndex;
          const isCurrent = currentStep === stepIndex;
          const Icon = step.icon;

          return (
            <li key={step.name} className="md:flex-1">
              <div
                className="group flex items-start gap-x-3 border-l-4 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                style={{
                  borderColor: isCompleted
                    ? 'rgb(34 197 94)' // green-500
                    : isCurrent
                    ? 'rgb(244 63 94)' // rose-500
                    : 'rgb(229 231 235)', // gray-200
                }}
              >
                <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors ${isCompleted ? 'bg-green-500' : isCurrent ? 'bg-rose-500' : 'bg-gray-200'}`}>
                  {isCompleted ? (
                    <Check className="h-6 w-6 text-white" />
                  ) : (
                    <Icon className={`h-6 w-6 ${isCurrent ? 'text-white' : 'text-gray-500'}`} />
                  )}
                </span>
                <span className="ml-4 flex min-w-0 flex-col md:ml-0 md:mt-4">
                  <span
                    className="text-sm font-medium transition-colors"
                     style={{
                        color: isCurrent ? 'rgb(244 63 94)' : 'rgb(17 24 39)',
                     }}
                  >
                    {step.name}
                  </span>
                  <span className="text-sm text-gray-500">{`Passo ${stepIndex}`}</span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default StepIndicator;