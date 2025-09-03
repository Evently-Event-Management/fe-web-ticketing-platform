import {SeatingBlockDTO} from "@/types/event";

export const NonSellableBlock = ({block}: {block: SeatingBlockDTO}) => (
    <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground font-medium">{block.name}</p>
    </div>
);

