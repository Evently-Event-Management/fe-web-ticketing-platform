'use client'

import {SeatDTO, SeatingBlockDTO,} from "@/types/event";
import {SelectedSeat} from "@/app/(home-app)/events/[event_id]/[session_id]/_components/SessionBooking";
import {SeatedGridBlock} from "./SeatedGridBlock";
import {StandingCapacityBlock} from "./StandingCapacityBlock";
import {NonSellableBlock} from "./NonSellableBlock";

const SeatingBlock = ({
                          block,
                          selectedSeats,
                          onSeatSelect,
                      }: {
    block: SeatingBlockDTO;
    selectedSeats?: SelectedSeat[];
    onSeatSelect?: (seat: SeatDTO, blockName: string) => void;
}) => {
    const getStandingAreaTierColor = (block: SeatingBlockDTO) => {
        if (block.type !== 'standing_capacity') return undefined;

        // Find first seat with tier info or return undefined
        return block.seats?.[0]?.tier?.color;
    };

    const blockContent = () => {
        switch (block.type) {
            case 'seated_grid':
                return <SeatedGridBlock block={block} selectedSeats={selectedSeats} onSeatSelect={onSeatSelect} />;
            case 'standing_capacity':
                return <StandingCapacityBlock block={block} selectedSeats={selectedSeats} onSeatSelect={onSeatSelect} />;
            case 'non_sellable':
                return <NonSellableBlock block={block} />;
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
                width: block.width ? `${block.width}px` : 'auto',
                height: block.height ? `${block.height}px` : 'auto',
                borderStyle: block.type === 'non_sellable' ? 'dashed' : 'solid',
                backgroundColor: getBlockBackgroundColor(block)
            }}>
            {blockContent()}
        </div>
    );
};

export {SeatingBlock};