import {Button} from "@/components/ui/button";
import {ArrowLeft, ArrowRight} from "lucide-react";
import * as React from "react";

interface NavigationButtonsProps {
    currentMode: 'select' | 'create' | 'assign';
    canProgress: boolean;
    onPrevious: () => void;
    onNext: () => void;
}

export function NavigationButtons({
    currentMode,
    canProgress,
    onPrevious,
    onNext
}: NavigationButtonsProps) {
    return (
        <div className="flex justify-between mt-4">
            {currentMode !== 'select' && (
                <Button
                    variant="outline"
                    type={'button'}
                    onClick={onPrevious}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4"/>
                    Back
                </Button>
            )}

            {currentMode !== 'assign' && (
                <Button
                    type={"button"}
                    onClick={onNext}
                    className="flex items-center gap-2 ml-auto"
                    disabled={currentMode === 'select' && !canProgress}
                >
                    Next
                    <ArrowRight className="w-4 h-4"/>
                </Button>
            )}
        </div>
    );
}
