import * as React from "react";
import {CheckCircle2} from "lucide-react";
import {cn} from "@/lib/utils";

type Step = {
    id: string;
    label: string;
}

interface ProgressStepsProps {
    steps: Step[];
    currentMode: string;
    onStepClick: (step: string) => void;
}

export function ProgressSteps({ steps, currentMode, onStepClick }: ProgressStepsProps) {
    return (
        <div className="mb-6">
            <div className="flex items-center justify-center">
                {steps.map((step, idx) => {
                    // Determine if this step is clickable (can't skip ahead, but can go back)
                    const currentStepIndex = steps.findIndex(s => s.id === currentMode);
                    const isClickable = idx <= currentStepIndex;

                    return (
                        <React.Fragment key={step.id}>
                            {/* Step indicator */}
                            <div
                                className={cn(
                                    "flex flex-col items-center",
                                    isClickable && "cursor-pointer"
                                )}
                                onClick={() => {
                                    if (!isClickable) return;
                                    onStepClick(step.id);
                                }}
                            >
                                <div
                                    className={cn(
                                        "flex items-center justify-center h-8 w-8 rounded-full border-2",
                                        currentMode === step.id
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : idx < steps.findIndex(s => s.id === currentMode)
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-muted-foreground text-muted-foreground"
                                    )}
                                >
                                    {idx < steps.findIndex(s => s.id === currentMode) ? (
                                        <CheckCircle2 className="h-5 w-5"/>
                                    ) : (
                                        <span>{idx + 1}</span>
                                    )}
                                </div>
                                <span className={cn(
                                    "text-xs mt-1",
                                    currentMode === step.id ? "text-primary font-medium" : "text-muted-foreground"
                                )}>
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector line between steps */}
                            {idx < steps.length - 1 && (
                                <div
                                    className={cn(
                                        "w-12 h-[2px] mx-1",
                                        idx < steps.findIndex(s => s.id === currentMode)
                                            ? "bg-primary"
                                            : "bg-muted-foreground/30"
                                    )}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
