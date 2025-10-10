"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

interface StepperProps {
  currentStep: number
  steps: {
    label: string
    description?: string
    icon?: React.ReactNode
  }[]
  className?: string
}

export function Stepper({ currentStep, steps, className }: StepperProps) {
  return (
    <div className={cn("flex w-full", className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber === currentStep
        const isCompleted = stepNumber < currentStep
        
        return (
          <React.Fragment key={index}>
            {/* Step */}
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2",
                  isActive && "border-primary bg-primary text-primary-foreground",
                  isCompleted && "border-primary bg-primary/10 text-primary",
                  !isActive && !isCompleted && "border-muted-foreground/20 bg-muted-foreground/10 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  step.icon || <span className="text-sm font-medium">{stepNumber}</span>
                )}
              </div>
              
              <div className="mt-2 text-center">
                <div 
                  className={cn(
                    "text-sm font-medium",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </div>
                {step.description && (
                  <div className="text-xs text-muted-foreground">
                    {step.description}
                  </div>
                )}
              </div>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-grow flex items-center mx-4 mt-5">
                <div className="h-[2px] w-full bg-muted-foreground/20 relative">
                  {isCompleted && (
                    <div 
                      className="absolute inset-0 bg-primary" 
                      style={{ width: stepNumber + 1 === currentStep ? "50%" : "100%" }} 
                    />
                  )}
                </div>
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// Legacy Step component for backwards compatibility
export function Step({ 
  icon
                     }: {
    icon?: React.ReactNode,
  label?: string,
  description?: string 
}) {
  return <>{icon || null}</>
}