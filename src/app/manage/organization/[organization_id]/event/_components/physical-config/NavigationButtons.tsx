import {Button} from "@/components/ui/button";
import {ArrowLeft, ArrowRight, Check} from "lucide-react";
import * as React from "react";
import {SessionSeatingMapRequest} from "@/lib/validators/event";

interface NavigationButtonsProps {
    currentMode: 'select' | 'create' | 'assign';
    canProgress: boolean;
    onPrevious: () => void;
    onNext: () => void;
    onFinish?: () => void;
    layoutData?: SessionSeatingMapRequest;
}

export function NavigationButtons({
                                      currentMode,
                                      canProgress,
                                      onPrevious,
                                      onNext,
                                      onFinish,
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

            {currentMode === 'assign' ? (
                <Button
                    type="button"
                    onClick={() => onFinish && onFinish()}
                    className="flex items-center gap-2 ml-auto"
                    variant="default"
                >
                    <Check className="w-4 h-4"/>
                    Confirm Tier Assignments
                </Button>
            ) : (
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
