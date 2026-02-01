import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepperProps {
  steps: {
    title: string;
    description?: string;
  }[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  errorSteps?: number[];
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  errorSteps = [],
}: StepperProps) {
  return (
    <div className="w-full bg-white dark:bg-slate-950 rounded-t-lg border-slate-200 dark:border-slate-800">
      {/* Added 'w-full' to the container */}
      <div className="flex items-center w-full overflow-x-auto no-scrollbar">
        {steps.map((step, index) => {
          const isCurrent = index === currentStep;
          const isClickable = !!onStepClick;
          const hasError = errorSteps.includes(index);

          return (
            <div
              key={index}
              className={cn(
                // Added 'flex-1', 'w-full', and 'justify-center'
                'flex-1 w-full flex items-center justify-center gap-3 px-6 py-4 cursor-pointer border-b-2 transition-all duration-200 whitespace-nowrap',
                isCurrent
                  ? hasError
                    ? 'border-red-500'
                    : 'border-primary'
                  : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-900'
              )}
              onClick={() => isClickable && onStepClick && onStepClick(index)}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-200',
                  isCurrent
                    ? hasError
                      ? 'bg-red-500 text-white'
                      : 'bg-primary text-primary-foreground'
                    : hasError
                      ? 'bg-white border border-red-500 text-red-500 dark:bg-slate-900'
                      : 'bg-white border border-slate-300 text-slate-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'
                )}
              >
                {index + 1}
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  isCurrent
                    ? hasError
                      ? 'text-red-500'
                      : 'text-primary'
                    : hasError
                      ? 'text-red-500'
                      : 'text-slate-500 dark:text-slate-400'
                )}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
