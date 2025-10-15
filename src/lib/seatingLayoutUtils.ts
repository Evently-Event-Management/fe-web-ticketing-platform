export type SeatingLayoutBlockLike = {
    id: string;
    type: 'seated_grid' | 'standing_capacity' | 'non_sellable';
    position?: {
        x: number;
        y: number;
    } | null;
    width?: number | null;
    height?: number | null;
    rows?: Array<{
        seats?: Array<unknown> | null;
    }> | number | null;
    columns?: number | null;
    seats?: Array<unknown> | null;
};

export interface NormalizeOptions {
    padding?: number;
    seatSize?: number;
    seatGap?: number;
    blockPadding?: number;
    headerHeight?: number;
    defaultStandingSize?: {
        width: number;
        height: number;
    };
    defaultNonSellableSize?: {
        width: number;
        height: number;
    };
}

export interface NormalizedSeatingLayout<T extends SeatingLayoutBlockLike> {
    blocks: Array<NormalizedSeatingBlock<T>>;
    contentWidth: number;
    contentHeight: number;
    canvasWidth: number;
    canvasHeight: number;
    padding: number;
}

export type NormalizedSeatingBlock<T extends SeatingLayoutBlockLike> = T & {
    position: {
        x: number;
        y: number;
    };
    width: number;
    height: number;
};

export const DEFAULTS = {
    padding: 48,
    seatSize: 24,
    seatGap: 6,
    blockPadding: 24,
    headerHeight: 32,
    defaultStandingSize: {width: 220, height: 160},
    defaultNonSellableSize: {width: 180, height: 120},
} satisfies Required<NormalizeOptions>;

const toNumberOr = (value: unknown, fallback: number): number => {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

const clampPositive = (value: number) => Math.max(0, value);

const getRowCount = (rows: SeatingLayoutBlockLike["rows"]): number => {
    if (Array.isArray(rows)) {
        return rows.length;
    }
    if (typeof rows === "number") {
        return rows;
    }
    return 0;
};

const getMaxSeatsPerRow = (rows: SeatingLayoutBlockLike["rows"], columns?: number | null): number => {
    if (Array.isArray(rows)) {
        return rows.reduce((max, row) => {
            if (!row) return max;
            const seatCount = Array.isArray(row.seats) ? row.seats.length : 0;
            return seatCount > max ? seatCount : max;
        }, 0);
    }
    if (typeof columns === "number") {
        return columns;
    }
    return 0;
};

export const estimateBlockDimensions = <T extends SeatingLayoutBlockLike>(
    block: T,
    options?: NormalizeOptions
) => {
    const merged = {
        seatSize: options?.seatSize ?? DEFAULTS.seatSize,
        seatGap: options?.seatGap ?? DEFAULTS.seatGap,
        blockPadding: options?.blockPadding ?? DEFAULTS.blockPadding,
        headerHeight: options?.headerHeight ?? DEFAULTS.headerHeight,
        defaultStandingSize: options?.defaultStandingSize ?? DEFAULTS.defaultStandingSize,
        defaultNonSellableSize: options?.defaultNonSellableSize ?? DEFAULTS.defaultNonSellableSize,
    } satisfies Omit<Required<NormalizeOptions>, "padding">;

    const widthFromData = toNumberOr(block.width, NaN);
    const heightFromData = toNumberOr(block.height, NaN);

    if (Number.isFinite(widthFromData) && Number.isFinite(heightFromData)) {
        return {width: widthFromData, height: heightFromData};
    }

    if (block.type === 'seated_grid') {
        const rowCount = getRowCount(block.rows);
        const seatsPerRow = getMaxSeatsPerRow(block.rows, block.columns);

        const effectiveRows = rowCount > 0 ? rowCount : 1;
        const effectiveCols = seatsPerRow > 0 ? seatsPerRow : 1;

        const seatWidth = effectiveCols * merged.seatSize + (effectiveCols - 1) * merged.seatGap;
        const seatHeight = effectiveRows * merged.seatSize + (effectiveRows - 1) * merged.seatGap;

        const width = Number.isFinite(widthFromData)
            ? widthFromData
            : seatWidth + merged.blockPadding;

        const height = Number.isFinite(heightFromData)
            ? heightFromData
            : seatHeight + merged.blockPadding + merged.headerHeight;

        return {
            width: clampPositive(width),
            height: clampPositive(height),
        };
    }

    if (block.type === 'standing_capacity') {
        return {
            width: Number.isFinite(widthFromData) ? widthFromData : merged.defaultStandingSize.width,
            height: Number.isFinite(heightFromData) ? heightFromData : merged.defaultStandingSize.height,
        };
    }

    return {
        width: Number.isFinite(widthFromData) ? widthFromData : merged.defaultNonSellableSize.width,
        height: Number.isFinite(heightFromData) ? heightFromData : merged.defaultNonSellableSize.height,
    };
};

export const normalizeSeatingLayout = <T extends SeatingLayoutBlockLike>(
    blocks: ReadonlyArray<T>,
    options: NormalizeOptions = {}
): NormalizedSeatingLayout<T> => {
    const mergedOptions: Required<NormalizeOptions> = {
        padding: options.padding ?? DEFAULTS.padding,
        seatSize: options.seatSize ?? DEFAULTS.seatSize,
        seatGap: options.seatGap ?? DEFAULTS.seatGap,
        blockPadding: options.blockPadding ?? DEFAULTS.blockPadding,
        headerHeight: options.headerHeight ?? DEFAULTS.headerHeight,
        defaultStandingSize: options.defaultStandingSize ?? DEFAULTS.defaultStandingSize,
        defaultNonSellableSize: options.defaultNonSellableSize ?? DEFAULTS.defaultNonSellableSize,
    };

    if (!blocks.length) {
        const emptyCanvas = mergedOptions.padding * 2;
        return {
            blocks: [],
            contentWidth: 0,
            contentHeight: 0,
            canvasWidth: emptyCanvas,
            canvasHeight: emptyCanvas,
            padding: mergedOptions.padding,
        };
    }

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    const blockMetrics = blocks.map((block) => {
        const positionX = toNumberOr(block.position?.x, 0);
        const positionY = toNumberOr(block.position?.y, 0);
        const dimensions = estimateBlockDimensions(block, mergedOptions);

        minX = Math.min(minX, positionX);
        minY = Math.min(minY, positionY);
        maxX = Math.max(maxX, positionX + dimensions.width);
        maxY = Math.max(maxY, positionY + dimensions.height);

        return {
            block,
            dimensions,
            positionX,
            positionY,
        };
    });

    if (!Number.isFinite(minX)) {
        minX = 0;
    }
    if (!Number.isFinite(minY)) {
        minY = 0;
    }
    if (!Number.isFinite(maxX)) {
        maxX = minX;
    }
    if (!Number.isFinite(maxY)) {
        maxY = minY;
    }

    const contentWidth = clampPositive(maxX - minX);
    const contentHeight = clampPositive(maxY - minY);
    const canvasWidth = contentWidth + mergedOptions.padding * 2;
    const canvasHeight = contentHeight + mergedOptions.padding * 2;

    const normalizedBlocks = blockMetrics.map(({block, dimensions, positionX, positionY}) => {
        return {
            ...block,
            position: {
                x: positionX - minX + mergedOptions.padding,
                y: positionY - minY + mergedOptions.padding,
            },
            width: dimensions.width,
            height: dimensions.height,
        } satisfies NormalizedSeatingBlock<T>;
    });

    return {
        blocks: normalizedBlocks,
        contentWidth,
        contentHeight,
        canvasWidth,
        canvasHeight,
        padding: mergedOptions.padding,
    };
};
