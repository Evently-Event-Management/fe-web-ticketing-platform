// Helper function to convert hex to RGB values
import * as React from "react";
import {Ticket, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useEffect, useState} from "react";
import {Control, useWatch} from "react-hook-form";
import {CreateEventFormData} from "@/lib/validators/event";

// Helper function to convert hex to RGB values
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

// Helper function to determine if color is light or dark for text contrast
// const isLightColor = (hex: string): boolean => {
//     const rgb = hexToRgb(hex);
//     if (!rgb) return true;
//     const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
//     return brightness > 155;
// };

// Debounce hook for color changes
const useDebounce = <T, >(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Helper function to get complementary shades
const getColorShades = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return {
        primary: hex,
        light: '#f8f9fa',
        dark: '#343a40',
        accent: hex
    };

    return {
        primary: hex,
        light: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
        medium: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
        accent: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`,
        dark: `rgba(${Math.max(0, rgb.r - 40)}, ${Math.max(0, rgb.g - 40)}, ${Math.max(0, rgb.b - 40)}, 1)`
    };
};

interface TicketCardProps {
    name: string;
    price: number;
    color: string;
    onRemove: () => void;
    children: React.ReactNode;
    index: number;
    control: Control<CreateEventFormData>; // Properly typed control
}

export const TicketCard: React.FC<TicketCardProps> = ({
                                                          name,
                                                          price,
                                                          color,
                                                          onRemove,
                                                          children,
                                                          index,
                                                          control
                                                      }) => {
    // Watch for real-time color changes
    const watchedColor = useWatch({
        control,
        name: `tiers.${index}.color`,
        defaultValue: color
    });

    const watchedName = useWatch({
        control,
        name: `tiers.${index}.name`,
        defaultValue: name
    });

    const watchedPrice = useWatch({
        control,
        name: `tiers.${index}.price`,
        defaultValue: price
    });

    // Debounce the color changes to avoid too frequent updates
    const debouncedColor = useDebounce(watchedColor || color, 200);

    const colorShades = getColorShades(debouncedColor);
    // const isLight = isLightColor(debouncedColor);

    return (
        <div className="relative">
            {/* Ticket Container */}
            <div
                className="relative overflow-hidden rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] bg-card"
                style={{
                    borderColor: colorShades.accent,
                    background: `linear-gradient(135deg, ${colorShades.light} 0%, ${colorShades.medium} 100%)`
                }}
            >
                {/* Ticket Header with Color Band */}
                <div
                    className="h-3 w-full"
                    style={{
                        background: `linear-gradient(90deg, ${colorShades.primary} 0%, ${colorShades.accent} 100%)`
                    }}
                />

                {/* Main Content Area */}
                <div className="p-6">
                    {/* Ticket Icon and Info Header */}
                    <div className="flex items-center gap-4">
                        <div
                            className="p-2 rounded-lg"
                            style={{
                                backgroundColor: colorShades.medium
                            }}
                        >
                            <Ticket className="h-5 w-5 text-foreground"/>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg text-foreground">
                                    {watchedName || `Tier ${index + 1}`}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-foreground">
                                        ${(watchedPrice || 0).toFixed(2)}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={onRemove}
                                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                                    >
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Event Access Ticket
                            </p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4 mt-4">
                        {children}
                    </div>
                </div>

                {/* Decorative Elements */}
                <div
                    className="absolute top-1/2 -left-3 w-6 h-6 bg-background rounded-full shadow-md transform -translate-y-1/2 border border-border"/>
                <div
                    className="absolute top-1/2 -right-3 w-6 h-6 bg-background rounded-full shadow-md transform -translate-y-1/2 border border-border"/>

                {/* Perforated Line */}
                <div
                    className="absolute top-1/2 left-0 right-0 h-px transform -translate-y-1/2"
                    style={{
                        background: `repeating-linear-gradient(
                            90deg,
                            transparent,
                            transparent 4px,
                            ${colorShades.accent} 4px,
                            ${colorShades.accent} 6px
                        )`
                    }}
                />
            </div>
        </div>
    );
};