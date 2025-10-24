'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Input} from '@/components/ui/input';
import {cn} from '@/lib/utils';
import {CalendarRange, CircleDollarSign} from 'lucide-react';
import {
    addMonths,
    endOfDay,
    endOfMonth,
    endOfWeek,
    endOfYear,
    startOfDay,
    startOfMonth,
    startOfWeek,
    startOfYear,
} from 'date-fns';

interface DateRange {
    from: string;
    to: string;
}

type PeriodKey = 'anytime' | 'this_week' | 'this_month' | 'next_three_months' | 'this_year';

interface PeriodOption {
    key: PeriodKey;
    label: string;
    getRange: () => DateRange | null;
}

const weekOptions = {weekStartsOn: 1 as const};

function buildPeriodOptions(): PeriodOption[] {
    const today = startOfDay(new Date());
    return [
        {
            key: 'anytime',
            label: 'Anytime',
            getRange: () => null,
        },
        {
            key: 'this_week',
            label: 'This Week',
            getRange: () => ({
                from: startOfWeek(today, weekOptions).toISOString(),
                to: endOfDay(endOfWeek(today, weekOptions)).toISOString(),
            }),
        },
        {
            key: 'this_month',
            label: 'This Month',
            getRange: () => ({
                from: startOfMonth(today).toISOString(),
                to: endOfDay(endOfMonth(today)).toISOString(),
            }),
        },
        {
            key: 'next_three_months',
            label: 'Next 3 Months',
            getRange: () => {
                const from = today;
                const to = endOfMonth(addMonths(today, 2));
                return {
                    from: from.toISOString(),
                    to: endOfDay(to).toISOString(),
                };
            },
        },
        {
            key: 'this_year',
            label: 'This Year',
            getRange: () => ({
                from: startOfYear(today).toISOString(),
                to: endOfDay(endOfYear(today)).toISOString(),
            }),
        },
    ];
}

export function EventAdvancedFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const periodOptions = useMemo(() => buildPeriodOptions(), []);

    const currentDateFrom = searchParams.get('dateFrom');
    const currentDateTo = searchParams.get('dateTo');
    const currentPriceMin = searchParams.get('priceMin') || '';
    const currentPriceMax = searchParams.get('priceMax') || '';

    const [priceOpen, setPriceOpen] = useState(false);
    const [priceMin, setPriceMin] = useState(currentPriceMin);
    const [priceMax, setPriceMax] = useState(currentPriceMax);
    const [priceError, setPriceError] = useState<string | null>(null);

    useEffect(() => {
        if (!priceOpen) {
            setPriceMin(currentPriceMin);
            setPriceMax(currentPriceMax);
            setPriceError(null);
        }
    }, [priceOpen, currentPriceMin, currentPriceMax]);

    const activePeriodKey = useMemo(() => {
        for (const option of periodOptions) {
            const range = option.getRange();
            if (!range) {
                if (!currentDateFrom && !currentDateTo) {
                    return option.key;
                }
                continue;
            }
            if (range.from === currentDateFrom && range.to === currentDateTo) {
                return option.key;
            }
        }
        return currentDateFrom || currentDateTo ? null : 'anytime';
    }, [currentDateFrom, currentDateTo, periodOptions]);

    const updateParams = useCallback((updater: (params: URLSearchParams) => void) => {
        const params = new URLSearchParams(searchParams.toString());
        updater(params);
        params.delete('page');
        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname, {scroll: false});
    }, [pathname, router, searchParams]);

    const handlePeriodSelect = useCallback((option: PeriodOption) => {
        updateParams((params) => {
            const range = option.getRange();
            if (!range) {
                params.delete('dateFrom');
                params.delete('dateTo');
            } else {
                params.set('dateFrom', range.from);
                params.set('dateTo', range.to);
            }
        });
    }, [updateParams]);

    const priceActive = Boolean(currentPriceMin || currentPriceMax);

    const applyPriceFilter = () => {
        const min = priceMin.trim();
        const max = priceMax.trim();
        const minNumber = min ? Number(min) : undefined;
        const maxNumber = max ? Number(max) : undefined;

        if ((min && Number.isNaN(minNumber)) || (max && Number.isNaN(maxNumber))) {
            setPriceError('Prices must be valid numbers.');
            return;
        }
        if (minNumber !== undefined && minNumber < 0) {
            setPriceError('Minimum price cannot be negative.');
            return;
        }
        if (maxNumber !== undefined && maxNumber < 0) {
            setPriceError('Maximum price cannot be negative.');
            return;
        }
        if (minNumber !== undefined && maxNumber !== undefined && minNumber > maxNumber) {
            setPriceError('Minimum price cannot exceed maximum price.');
            return;
        }

        updateParams((params) => {
            if (min) {
                params.set('priceMin', minNumber!.toString());
            } else {
                params.delete('priceMin');
            }
            if (max) {
                params.set('priceMax', maxNumber!.toString());
            } else {
                params.delete('priceMax');
            }
        });
        setPriceOpen(false);
    };

    const resetPriceFilter = () => {
        setPriceMin('');
        setPriceMax('');
        setPriceError(null);
        updateParams((params) => {
            params.delete('priceMin');
            params.delete('priceMax');
        });
        setPriceOpen(false);
    };

    return (
        <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <CalendarRange className="h-4 w-4 text-muted-foreground" />
                {periodOptions.map((option) => (
                    <Button
                        key={option.key}
                        size="sm"
                        variant={activePeriodKey === option.key ? 'default' : 'outline'}
                        onClick={() => handlePeriodSelect(option)}
                    >
                        {option.label}
                    </Button>
                ))}
            </div>
            <Popover open={priceOpen} onOpenChange={setPriceOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn('relative flex items-center gap-2', priceActive && 'border-primary text-primary')}
                    >
                        <CircleDollarSign className="h-4 w-4" />
                        Price
                        {priceActive && (
                            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 space-y-4">
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold">Set price range</h4>
                        <p className="text-xs text-muted-foreground">Filter events by minimum and maximum ticket prices.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label htmlFor="price-min" className="text-xs font-medium text-muted-foreground">Min price</label>
                            <Input
                                id="price-min"
                                type="number"
                                min={0}
                                inputMode="decimal"
                                value={priceMin}
                                onChange={(event) => {
                                    setPriceMin(event.target.value);
                                    setPriceError(null);
                                }}
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="price-max" className="text-xs font-medium text-muted-foreground">Max price</label>
                            <Input
                                id="price-max"
                                type="number"
                                min={0}
                                inputMode="decimal"
                                value={priceMax}
                                onChange={(event) => {
                                    setPriceMax(event.target.value);
                                    setPriceError(null);
                                }}
                                placeholder="Any"
                            />
                        </div>
                    </div>
                    {priceError && (<p className="text-xs text-destructive">{priceError}</p>)}
                    <div className="flex items-center justify-between gap-2">
                        <Button variant="ghost" size="sm" onClick={resetPriceFilter}>
                            Clear
                        </Button>
                        <Button size="sm" onClick={applyPriceFilter}>
                            Apply
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
