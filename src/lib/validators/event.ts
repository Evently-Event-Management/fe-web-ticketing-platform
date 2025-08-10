import {z} from 'zod';

// ✅ NEW: Enum to match the backend SessionType
export enum SessionType {
    PHYSICAL = 'PHYSICAL',
    ONLINE = 'ONLINE',
}

export enum SalesStartRuleType {
    IMMEDIATE = 'IMMEDIATE',
    ROLLING = 'ROLLING',
    FIXED = 'FIXED',
}


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

export const blockSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Block name is required."),
    type: z.enum(['seated_grid', 'standing_capacity', 'non_sellable']),
    position: positionSchema,
    rows: z.array(rowSchema).optional(),
    capacity: z.number().nullable().optional(),
    width: z.number().nullable().optional(),
    height: z.number().nullable().optional(),
    seats: z.array(seatSchema).optional(),
});

const layoutSchema = z.object({
    blocks: z.array(blockSchema),
});

const sessionSeatingMapRequestSchema = z.object({
    name: z.string().nullable(),
    layout: layoutSchema,
});


// --- Venue & Tier Schemas ---

// ✅ UPDATED: This DTO now holds details for both physical and online locations
const venueDetailsSchema = z.object({
    name: z.string().optional(), // Optional for online, required for physical
    address: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    onlineLink: z.string().optional(),
});

const tierSchema = z.object({
    id: z.string(),
    name: z.string().min(1, {message: "Tier name cannot be empty."}),
    price: z.number().min(0, {message: "Price must be a positive number."}),
    color: z.string().optional(),
});


// --- Session Schema with Conditional Logic ---

const sessionSchema = z.object({
    startTime: z.iso.datetime({message: "Invalid start date format."}),
    endTime: z.iso.datetime({message: "Invalid end date format."}),
    salesStartRuleType: z.enum([
        SalesStartRuleType.IMMEDIATE,
        SalesStartRuleType.ROLLING,
        SalesStartRuleType.FIXED
    ]),
    salesStartHoursBefore: z.number().optional().nullable(),
    salesStartFixedDatetime: z.iso.datetime({message: "Invalid date format."}).optional().nullable(),

    // ✅ UPDATED: Use the new SessionType enum
    sessionType: z.enum([SessionType.PHYSICAL, SessionType.ONLINE]),
    venueDetails: venueDetailsSchema.optional(),
    layoutData: sessionSeatingMapRequestSchema,

}).refine(data => {
    // If it's an online session, the onlineLink must be a valid URL.
    if (data.sessionType === SessionType.ONLINE) {
        return data.venueDetails?.onlineLink && z.url().safeParse(data.venueDetails.onlineLink).success;
    }
    return true;
}, {
    message: "A valid URL is required for online sessions.",
    path: ["venueDetails", "onlineLink"], // Point error to the correct field
}).refine(data => {
    // If it's a physical session, venueDetails and its name must be provided.
    if (data.sessionType === SessionType.PHYSICAL) {
        return !!data.venueDetails && !!data.venueDetails.name && data.venueDetails.name.length > 0;
    }
    return true;
}, {
    message: "Venue details are required for physical sessions.",
    path: ["venueDetails", "name"], // Point error to the correct field
}).refine(data => {
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
    categoryName: z.string().optional().nullable(),
    tiers: z.array(tierSchema).min(1, {message: "You must create at least one tier."}),
    sessions: z.array(sessionSchema).min(1, {message: "You must schedule at least one session."}),
});

// --- Type Inference ---

export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type SessionFormData = z.infer<typeof sessionSchema>;
export type Tier = z.infer<typeof tierSchema>;
export type VenueDetails = z.infer<typeof venueDetailsSchema>;
export type SessionSeatingMapRequest = z.infer<typeof sessionSeatingMapRequestSchema>;
export type Seat = z.infer<typeof seatSchema>;
export type Row = z.infer<typeof rowSchema>;
export type Block = z.infer<typeof blockSchema>;

// --- Step-by-Step Validation Fields ---

export const stepValidationFields = {
    1: ['title', 'categoryId', 'description', 'overview'] as const,
    2: ['tiers'] as const,
    3: ['sessions'] as const,
    4: ['sessions'] as const,
} as const;


// --- API Response Schemas ---


export enum EventStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export const eventSummarySchema = z.object({
    id: z.uuid(),
    title: z.string(),
    status: z.enum(Object.values(EventStatus)),
    organizationName: z.string(),
    organizationId: z.uuid(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    description: z.string(),
    coverPhoto: z.url(),
    sessionCount: z.number(),
    earliestSessionDate: z.iso.datetime(),
});

export const sessionDetailSchema = z.object({
    id: z.uuid(),
    startTime: z.iso.datetime(),
    endTime: z.iso.datetime(),
    sessionType: z.enum([SessionType.PHYSICAL, SessionType.ONLINE]),
    venueDetails: venueDetailsSchema,
    salesStartRuleType: z.enum(Object.values(SalesStartRuleType)),
    salesStartHoursBefore: z.number().nullable(),
    salesStartFixedDatetime: z.iso.datetime().nullable(),
    status: z.string(), // Corresponds to SessionStatus enum
    layoutData: sessionSeatingMapRequestSchema, // Assuming this is the correct shape
});

export const eventDetailSchema = z.object({
    id: z.uuid(),
    title: z.string(),
    description: z.string(),
    overview: z.string(),
    status: z.enum(EventStatus),
    rejectionReason: z.string().nullable(),
    coverPhotos: z.array(z.url()),
    organizationId: z.uuid(),
    organizationName: z.string(),
    categoryId: z.uuid(),
    categoryName: z.string(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    tiers: z.array(tierSchema),
    sessions: z.array(sessionDetailSchema),
});

// --- Type Inference for API Responses ---
export type EventSummaryDTO = z.infer<typeof eventSummarySchema>;
export type SessionDetailDTO = z.infer<typeof sessionDetailSchema>;
export type EventDetailDTO = z.infer<typeof eventDetailSchema>;