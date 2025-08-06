import {z} from 'zod';
import {SalesStartRuleType} from "@/types/event";
// --- Seating Layout Schemas ---

const positionSchema = z.object({
    x: z.number(),
    y: z.number(),
});

const seatSchema = z.object({
    id: z.string(),
    label: z.string(),
    tierId: z.string().optional(),
    status: z.enum(['AVAILABLE', 'RESERVED']).optional(),
});

const rowSchema = z.object({
    id: z.string(),
    label: z.string(),
    seats: z.array(seatSchema),
});

const blockSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Block name is required."),
    type: z.enum(['seated_grid', 'standing_capacity', 'non_sellable']),
    position: positionSchema,
    rows: z.array(rowSchema).optional(),
    capacity: z.number().optional(),
    seats: z.array(seatSchema).optional(),
    width: z.number().optional(),
    height: z.number().optional(),
});

const layoutSchema = z.object({
    blocks: z.array(blockSchema),
});

const sessionSeatingMapRequestSchema = z.object({
    name: z.string(),
    layout: layoutSchema,
});


// --- Venue & Tier Schemas ---

const venueDetailsSchema = z.object({
    name: z.string().min(1, "Venue name is required."),
    address: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});

const tierSchema = z.object({
    id: z.string(),
    name: z.string().min(1, {message: "Tier name cannot be empty."}),
    price: z.number().min(0, {message: "Price must be a positive number."}),
    color: z.string().optional(),
});


// --- Session Schema with Conditional Logic ---

const sessionSchema = z.object({
    // Use z.string().datetime() to validate ISO 8601 strings, which matches the backend DTO.
    startTime: z.iso.datetime({message: "Invalid start date format."}),
    endTime: z.iso.datetime({message: "Invalid end date format."}),

    // ✅ Corrected: Use z.enum() for string-based enums.
    salesStartRuleType: z.enum([
        SalesStartRuleType.IMMEDIATE,
        SalesStartRuleType.ROLLING,
        SalesStartRuleType.FIXED
    ]),

    salesStartHoursBefore: z.number().optional(),
    salesStartFixedDatetime: z.string().datetime({message: "Invalid date format."}).optional(),
    isOnline: z.boolean(),
    onlineLink: z.string().optional(),
    venueDetails: venueDetailsSchema.optional(),
    layoutData: sessionSeatingMapRequestSchema,
}).refine(data => {
    // If it's an online event, the onlineLink must be a valid URL.
    if (data.isOnline) {
        return data.onlineLink && z.url().safeParse(data.onlineLink).success;
    }
    return true;
}, {
    message: "A valid URL is required for online events.",
    path: ["onlineLink"],
}).refine(data => {
    // If it's a physical event, venueDetails must be provided.
    if (!data.isOnline) {
        return !!data.venueDetails;
    }
    return true;
}, {
    message: "Venue details are required for physical events.",
    path: ["venueDetails"],
}).refine(data => {
    // End time must be after start time
    return new Date(data.endTime) > new Date(data.startTime);
}, {
    message: "End time must be after the start time.",
    path: ["endTime"],
});


// --- Final Event Schema ---

export const createEventSchema = z.object({
    title: z.string().min(3, {message: "Title must be at least 3 characters."}),
    description: z.string().optional(),
    overview: z.string().optional(),
    organizationId: z.uuid(),
    categoryId: z.uuid({message: "Please select a category."}),
    tiers: z.array(tierSchema).min(1, {message: "You must create at least one tier."}),
    sessions: z.array(sessionSchema).min(1, {message: "You must schedule at least one session."}),
});

// --- Type Inference ---

export type CreateEventFormData = z.infer<typeof createEventSchema>;

// --- Step-by-Step Validation Fields ---

export const stepValidationFields = {
    1: ['title', 'categoryId', 'description', 'overview'] as const,
    2: ['tiers'] as const,
    3: ['sessions'] as const,
    // Step 4 is for seating, which is part of the session object
    // Step 5 is for cover photos and review (handled separately)
} as const;
