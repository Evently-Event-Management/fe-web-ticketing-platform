'use client';

import { useEffect, useState, useRef } from "react";

interface CounterAnimationProps {
    value: number;
    duration?: number; // in milliseconds
    prefix?: string;
    suffix?: string;
    className?: string;
    startOnView?: boolean; // Whether to start the animation when the element comes into view
}

export default function CounterAnimation({
                                             value,
                                             duration = 2000,
                                             prefix = '',
                                             suffix = '',
                                             className = '',
                                             startOnView = true, // Defaulting to true is more common
                                         }: CounterAnimationProps) {
    const [count, setCount] = useState(0);
    const [isInView, setIsInView] = useState(!startOnView);
    const ref = useRef<HTMLDivElement>(null); // Use useRef for the element reference

    // Intersection Observer to detect when the element is in view
    useEffect(() => {
        if (!startOnView) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect(); // Disconnect after it comes into view
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [startOnView]);

    // The animation effect
    useEffect(() => {
        if (!isInView) return;

        setCount(0); // Start animation from 0 when value changes or it comes into view

        const endValue = value;
        const startTime = Date.now();

        const frame = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const currentValue = Math.floor(progress * endValue);
            setCount(currentValue);

            if (progress < 1) {
                requestAnimationFrame(frame);
            } else {
                setCount(endValue); // Ensure it ends on the exact value
            }
        };

        const animationFrameId = requestAnimationFrame(frame);

        // Cleanup function to cancel animation frame if component unmounts
        return () => cancelAnimationFrame(animationFrameId);

    }, [value, duration, isInView]); // Rerun animation if value or isInView changes

    return (
        <div ref={ref} className={className}>
            {prefix}{count.toLocaleString()}{suffix}
        </div>
    );
}
