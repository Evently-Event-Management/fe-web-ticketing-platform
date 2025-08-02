import {LayoutBlock, SeatingLayoutTemplateResponse} from "@/types/seating-layout";
import {useRouter} from "next/navigation"; // Changed from next/router to next/navigation
import {useEffect, useState} from "react";
import {Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {formatDistanceToNow} from "date-fns";
import {Edit, MoreVertical, Trash2} from "lucide-react";

interface LayoutPreviewCardProps {
    layout: SeatingLayoutTemplateResponse;
    onDelete: (id: string, name: string) => void;
}

interface LayoutPreviewCardProps {
    layout: SeatingLayoutTemplateResponse;
    onDelete: (id: string, name: string) => void;
}

function LayoutPreviewCard({layout, onDelete}: LayoutPreviewCardProps) {
    const router = useRouter();
    const [viewBox, setViewBox] = useState('0 0 100 100');
    const [blocks, setBlocks] = useState<LayoutBlock[]>([]);

    useEffect(() => {
        const originalBlocks = layout.layoutData.layout.blocks;
        if (originalBlocks.length === 0) return;

        // ✅ Pre-process blocks to calculate dimensions for seated grids
        const processedBlocks = originalBlocks.map(block => {
            if (block.type === 'seated_grid') {
                // Estimate size based on rows/columns. Adjust multipliers as needed.
                const estimatedWidth = (block.columns || 10) * 30;
                const estimatedHeight = (block.rows || 5) * 30;
                return {...block, width: estimatedWidth, height: estimatedHeight};
            }
            return block;
        });

        // Calculate bounding box using the processed blocks
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        processedBlocks.forEach(block => {
            minX = Math.min(minX, block.position.x);
            minY = Math.min(minY, block.position.y);
            maxX = Math.max(maxX, block.position.x + (block.width || 100));
            maxY = Math.max(maxY, block.position.y + (block.height || 50));
        });

        // Add some padding to the viewbox
        const padding = 20;
        const finalMinX = minX - padding;
        const finalMinY = minY - padding;
        const width = (maxX - minX) + (padding * 2);
        const height = (maxY - minY) + (padding * 2);

        setViewBox(`${finalMinX} ${finalMinY} ${width} ${height}`);
        setBlocks(processedBlocks);
    }, [layout]);

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>{layout.name}</CardTitle>
                <CardDescription>
                    Updated {formatDistanceToNow(new Date(layout.updatedAt), {addSuffix: true})}
                </CardDescription>
                <CardAction>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => router.push(`/manage/organization/${layout.organizationId}/seating/${layout.id}`)}>
                                <Edit className="mr-2 h-4 w-4"/> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onSelect={() => onDelete(layout.id, layout.name)}
                            >
                                <Trash2 className="mr-2 h-4 w-4"/> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardAction>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center bg-muted/50 aspect-video p-4">
                <svg viewBox={viewBox} className="w-full h-full">
                    {blocks.map(block => (
                        <rect
                            key={block.id}
                            x={block.position.x}
                            y={block.position.y}
                            width={block.width}
                            height={block.height}
                            rx="4" // Rounded corners for the blocks
                            className="fill-primary/20 stroke-primary"
                            strokeWidth="2"
                        />
                    ))}
                </svg>
            </CardContent>
        </Card>
    );
}

export default LayoutPreviewCard;