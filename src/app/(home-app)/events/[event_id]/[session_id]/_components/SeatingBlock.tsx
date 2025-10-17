'use client'

import {SeatDTO, SeatingBlockDTO,} from "@/types/event";
import {SeatedGridBlock} from "./SeatedGridBlock";
import {StandingCapacityBlock} from "./StandingCapacityBlock";
import {NonSellableBlock} from "./NonSellableBlock";
import React from "react";

const SeatingBlock = ({
                          block,
                          selectedSeats,
                          onSeatSelect,
                      }: {
    block: SeatingBlockDTO;
    selectedSeats?: string[];
    onSeatSelect?: (seat: SeatDTO, blockName: string) => void;
}) => {
    const getStandingAreaTierColor = (block: SeatingBlockDTO) => {
        if (block.type !== 'standing_capacity') return undefined;

        // Find first seat with tier info or return undefined
        return block.seats?.[0]?.tier?.color;
    };

    const blockDimensions = React.useMemo(() => {
        if (block.type !== 'seated_grid') {
            return {
                width: block.width ?? 0,
                height: block.height ?? 0,
            };
        }

        const seatSize = 24; // Tailwind h-6
        const seatGap = 6; // Tailwind gap-1.5
        const padding = 24; // Horizontal padding from p-3 on container (12 * 2)
        const headerHeight = 48; // Space for block title and margin

        const rowCount = block.rows?.length ?? 0;
        const maxSeatsPerRow = block.rows?.reduce((max, row) => {
            const seatCount = row?.seats?.length ?? 0;
            return seatCount > max ? seatCount : max;
        }, 0) ?? 0;

        const seatGridWidth = maxSeatsPerRow > 0
            ? maxSeatsPerRow * seatSize + Math.max(0, maxSeatsPerRow - 1) * seatGap
            : 0;

        const seatGridHeight = rowCount > 0
            ? rowCount * seatSize + Math.max(0, rowCount - 1) * seatGap
            : 0;

        const minWidth = seatGridWidth + padding;
        const minHeight = seatGridHeight + padding + headerHeight;
        
        return {
            width: Math.max(block.width ?? 0, minWidth),
            height: Math.max(block.height ?? 0, minHeight),
        };
    }, [block]);

    const blockContent = () => {
        switch (block.type) {
            case 'seated_grid':
                return <SeatedGridBlock block={block} selectedSeats={selectedSeats} onSeatSelect={onSeatSelect}/>;
            case 'standing_capacity':
                return <StandingCapacityBlock block={block} selectedSeats={selectedSeats} onSeatSelect={onSeatSelect}/>;
            case 'non_sellable':
                return <NonSellableBlock block={block}/>;
            default:
                return null;
        }
    };

    const getBlockBackgroundColor = (block: SeatingBlockDTO) => {
        if (block.type === 'standing_capacity') {
            const tierColor = getStandingAreaTierColor(block);
            return tierColor ? `${tierColor}40` : undefined; // Light opacity for background
        }
        return undefined;
    };
    return (
        <div
            className="absolute bg-card/80 backdrop-blur-sm border rounded-lg p-3 shadow-md"
            style={{
                left: block.position.x,
                top: block.position.y,
                width: blockDimensions.width ? `${blockDimensions.width}px` : 'auto',
                height: blockDimensions.height ? `${blockDimensions.height}px` : 'auto',
                borderStyle: block.type === 'non_sellable' ? 'dashed' : 'solid',
                backgroundColor: getBlockBackgroundColor(block)
            }}>
            {blockContent()}
        </div>
    );
};

export {SeatingBlock};