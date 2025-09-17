import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

interface StepConfig {
    id: number;
    title: string;
    description: string;
    icon: React.ElementType;
}

interface WizardProgressBarProps {
    currentStep: number;
    totalSteps: number;
    stepConfig: StepConfig[];
}

export function WizardProgressBar({ currentStep, totalSteps, stepConfig }: WizardProgressBarProps) {
    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

    return (
        <div>
            {/* Step indicators */}
            <div className="relative mb-8">
                {/* Background line */}
                <div className="absolute top-6 left-6 right-6 h-0.5 bg-border rounded-full" />

                {/* Progress line */}
                <div
                    className="absolute top-6 left-6 h-0.5 bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `calc(${progressPercentage}% - 12px)` }}
                />

                {/* Step circles */}
                <div className="relative flex justify-between">
                    {stepConfig.map((stepItem, index) => {
                        const Icon = stepItem.icon;
                        const isActive = currentStep === stepItem.id;
                        const isCompleted = currentStep > stepItem.id;
                        const isPending = currentStep < stepItem.id;

                        return (
                            <div key={stepItem.id} className="flex flex-col items-center group">
                                {/* Circle with icon */}
                                <div className="relative mb-4">
                                    <div
                                        className={`
                                            relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ease-out transform
                                            ${
                                                isActive
                                                    ? "bg-primary text-primary-foreground shadow-md scale-110 ring-2 ring-primary/20"
                                                    : isCompleted
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-background border-2 border-border text-muted-foreground hover:border-primary/50"
                                            }
                                        `}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <Icon className="w-5 h-5" />
                                        )}
                                    </div>

                                    {/* Simple pulse effect for active step */}
                                    {isActive && (
                                        <div className="absolute inset-0 w-12 h-12 rounded-full bg-primary opacity-20 animate-pulse-slow" />
                                    )}
                                </div>

                                {/* Step info */}
                                <div className="text-center max-w-28">
                                    <p
                                        className={`text-sm font-semibold mb-1 transition-colors duration-300 ${
                                            isActive
                                                ? "text-primary"
                                                : isCompleted
                                                    ? "text-primary/80"
                                                    : "text-muted-foreground"
                                        }`}
                                    >
                                        {stepItem.title}
                                    </p>
                                    <p className={`text-xs leading-relaxed transition-colors duration-300 
                                        ${isActive ? "text-foreground" : "text-muted-foreground"} 
                                        hidden sm:block`}
                                    >
                                        {stepItem.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Progress bar section */}
            <div className="space-y-4">
                {/* Main progress bar */}
                <div className="relative">
                    <Progress
                        value={progressPercentage}
                        className="h-2 bg-muted"
                    />
                </div>

                {/* Progress info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-sm font-medium">
                                Step {currentStep} of {totalSteps}
                            </span>
                        </div>
                        <div className="h-4 w-px bg-border" />
                        <span className="text-sm text-muted-foreground">
                            {stepConfig.find(s => s.id === currentStep)?.title}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold">
                            {Math.round(progressPercentage)}%
                        </span>
                        <span className="text-sm text-muted-foreground">complete</span>
                    </div>
                </div>
            </div>
        </div>
    );
}