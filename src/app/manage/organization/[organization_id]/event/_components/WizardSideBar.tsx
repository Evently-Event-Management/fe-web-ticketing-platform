import {cn} from "@/lib/utils";
import {Check} from "lucide-react";

interface WizardSidebarProps {
    currentStep: number;
    steps: { number: number; title: string; description: string }[];
}

export function WizardSidebar({currentStep, steps}: WizardSidebarProps) {
    return (
        <aside className="hidden md:block w-72 border-r bg-background p-6">
            <h2 className="text-lg font-semibold mb-8">Create New Event</h2>
            <nav className="flex flex-col gap-6">
                {steps.map((s) => (
                    <div key={s.number} className="flex items-start gap-4">
                        <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full border-2 font-semibold transition-all",
                            currentStep === s.number && "bg-primary text-primary-foreground border-primary",
                            currentStep > s.number && "bg-green-500 text-white border-green-500",
                        )}>
                            {currentStep > s.number ? <Check className="h-5 w-5"/> : s.number}
                        </div>
                        <div>
                            <p className={cn("font-medium", currentStep === s.number && "text-primary")}>{s.title}</p>
                            <p className="text-sm text-muted-foreground">{s.description}</p>
                        </div>
                    </div>
                ))}
            </nav>
        </aside>
    );
}