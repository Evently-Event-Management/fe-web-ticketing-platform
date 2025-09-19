import {z} from 'zod';

import {SessionType} from "@/types/enums/sessionType";
import {DiscountType} from "@/types/enums/discountType";


// --- Reusable Atomic Schemas ---

const positionSchema = z.object({
    x: z.number().min(0, {message: "X position must be non-negative."}),
    y: z.number().min(0, {message: "Y position must be non-negative."}),
})

export const tierSchema = z.object({
    id: z.string(),
    name: z.string().min(1, {message: "Tier name cannot be empty."}),
    price: z.number().min(0, {message: "Price must be a positive number."}),
    color: z.string().optional(),
});


export const percentageParamsSchema = z.object({
    percentage: z.number().min(0.1, "Percentage must be greater than 0."),
});

export const flatOffParamsSchema = z.object({
    amount: z.number().min(0.01, "Amount must be greater than 0."),
    currency: z.string().min(3, "Currency code is required.").max(3, "Currency code is invalid."),
});

export const bogoParamsSchema = z.object({
    buyQuantity: z.number().int().min(1, "Buy quantity must be at least 1."),
    getQuantity: z.number().int().min(1, "Get quantity must be at least 1."),
});


const baseDiscountSchema = z.object({
    code: z.string().min(1, { message: "Discount code cannot be empty." }).transform(val => val.toUpperCase()),
    maxUsage: z.number().int().min(1).optional().nullable(),
    currentUsage: z.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
    isPublic: z.boolean().default(false),
    activeFrom: z.iso.datetime({ offset: true }).nullable(),
    expiresAt: z.iso.datetime({ offset: true }).nullable(),
    applicableTierIds: z.array(z.uuid()).min(1, {
        message: "You must select at least one tier",
    }),
    applicableSessionIds: z.array(z.uuid()).min(1, {
        message: "You must select at least one session",
    }),
});

export const discountSchema = z
    .discriminatedUnion("type", [
        baseDiscountSchema.extend({
            type: z.literal(DiscountType.PERCENTAGE),
            parameters: percentageParamsSchema,
        }),
        baseDiscountSchema.extend({
            type: z.literal(DiscountType.FLAT_OFF),
            parameters: flatOffParamsSchema,
        }),
        baseDiscountSchema.extend({
            type: z.literal(DiscountType.BUY_N_GET_N_FREE),
            parameters: bogoParamsSchema,
        }),
    ])
    .superRefine((data, ctx) => {
        const now = new Date();

        if (data.activeFrom) {
            const activeFromDate = new Date(data.activeFrom);
            if (activeFromDate <= now) {
                ctx.addIssue({
                    path: ["activeFrom"],
                    code: z.ZodIssueCode.custom,
                    message: "Active from date must be in the future.",
                });
            }
        }

        if (data.expiresAt) {
            const expiresAtDate = new Date(data.expiresAt);
            if (expiresAtDate <= now) {
                ctx.addIssue({
                    path: ["expiresAt"],
                    code: z.ZodIssueCode.custom,
                    message: "Expiry date must be in the future.",
                });
            }
        }

        if (data.activeFrom && data.expiresAt) {
            if (new Date(data.expiresAt) <= new Date(data.activeFrom)) {
                ctx.addIssue({
                    path: ["expiresAt"],
                    code: z.ZodIssueCode.custom,
                    message: "Expiry date must be after the active from date.",
                });
            }
        }
    });



const venueDetailsSchema = z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    onlineLink: z.string().optional(),
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

const sessionSeatingMapRequestSchema = z.object({
    name: z.string().nullable(),
    layout: z.object({
        blocks: z.array(blockSchema),
    }),
});


// --- Composable Session Schemas ---

// 1. The most basic session, as created in the dialogs.
// It has optional fields and only universal time-based rules.
export const baseSessionSchema = z.object({
    id: z.uuid(),
    startTime: z.iso.datetime({message: "Invalid start date format."}),
    endTime: z.iso.datetime({message: "Invalid end date format."}),
    salesStartTime: z.iso.datetime({message: "Invalid sales start date format."}),
    sessionType: z.enum([SessionType.PHYSICAL, SessionType.ONLINE]).nullable(),
    venueDetails: venueDetailsSchema.optional(),
    layoutData: sessionSeatingMapRequestSchema.optional(),
})
    .refine(data => new Date(data.endTime) > new Date(data.startTime), {
        message: "End time must be after the start time.",
        path: ["endTime"],
    })
    .refine(data => new Date(data.startTime) > new Date(), {
        message: "Start time must be in the future.",
        path: ["startTime"],
    })
    .refine(data => new Date(data.salesStartTime) < new Date(data.startTime), {
        message: "Sales start time must be before the session start time.",
        path: ["salesStartTime"],
    });

// 2. A session that is "complete" for Step 3.
const sessionWithVenueSchema = baseSessionSchema
    .refine(data => data.sessionType !== null, {
        message: "A session type (Physical or Online) must be selected.",
        path: ["sessionType"],
    })
    .refine(data => {
        // 2. Now, the rest of the refinements can safely assume sessionType is not null.
        if (data.sessionType === SessionType.ONLINE) {
            return data.venueDetails?.onlineLink && z.url().safeParse(data.venueDetails.onlineLink).success;
        }
        return true;
    }, {
        message: "A valid URL is required for online sessions.",
        path: ["venueDetails", "onlineLink"],
    })
    .refine(data => {
        if (data.sessionType === SessionType.PHYSICAL) {
            // This is the check for the venue details you mentioned.
            return !!data.venueDetails?.name?.trim();
        }
        return true;
    }, {
        message: "Venue name is required for physical sessions.",
        path: ["venueDetails", "name"],
    });


// 3. A session that is "complete" for Step 4.
const sessionWithSeatingSchema = sessionWithVenueSchema
    .safeExtend({
        layoutData: sessionSeatingMapRequestSchema.extend({
            layout: z.object({
                blocks: z.array(blockSchema).min(1, {message: "Seating layout must be set up."}),
            }),
        }),
    })
    .superRefine((session, ctx) => {
        // The session object is guaranteed to have layoutData here because of the .extend() above.
        session.layoutData.layout.blocks.forEach((block, blockIndex) => {
            let totalSellableItems = 0;
            session.layoutData.layout.blocks.forEach(block => {
                if (block.type === 'standing_capacity' && block.capacity) {
                    totalSellableItems += block.capacity;
                } else if (block.type === 'seated_grid') {
                    totalSellableItems += (block.seats?.length || 0);
                    // Or iterate through rows if seats are nested there
                    block.rows?.forEach(row => totalSellableItems += row.seats.length);
                }
            });

            if (totalSellableItems === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "The layout must contain at least one sellable seat or capacity.",
                    path: ['layoutData', 'layout', 'blocks'],
                });
                // return early if the layout is fundamentally empty
                return;
            }

            const checkSeat = (seat: Seat, seatPath: (string | number)[]) => {
                const hasTier = !!seat.tierId;
                const isReserved = seat.status === 'RESERVED';

                // The core validation logic: if a seat is not reserved, it must have a tier.
                if (!hasTier && !isReserved) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        // Provide a clear, actionable error message
                        message: `Seat '${seat.label}' in block '${block.name}' must be assigned a tier.`,
                        // Provide a precise path to the field that has the error
                        path: [...seatPath, 'tierId'],
                    });
                }
            };

            // Scenario 1: Seats are nested inside rows (e.g., for 'seated_grid')
            if (block.rows) {
                block.rows.forEach((row, rowIndex) => {
                    row.seats.forEach((seat, seatIndex) => {
                        const path = ['layoutData', 'layout', 'blocks', blockIndex, 'rows', rowIndex, 'seats', seatIndex];
                        checkSeat(seat, path);
                    });
                });
            }

            // Scenario 2: Seats are directly in the block (e.g., for other types)
            if (block.seats) {
                block.seats.forEach((seat, seatIndex) => {
                    const path = ['layoutData', 'layout', 'blocks', blockIndex, 'seats', seatIndex];
                    checkSeat(seat, path);
                });
            }
        });
    });


// --- Progressive Event Schemas (The Chain) ---

// This is the base schema for Step 1
export const step1Schema = z.object({
    title: z.string().min(3, {message: "Title must be at least 3 characters."}),
    description: z.string().optional(),
    overview: z.string().optional(),
    organizationId: z.uuid(),
    categoryId: z.uuid({message: "Please select a category."}),
    categoryName: z.string().optional().nullable(),
});

// Step 2 adds the 'tiers' requirement
export const step2Schema = step1Schema.extend({
    tiers: z.array(tierSchema).min(1, {message: "You must create at least one tier."}),
});

// Step 3 adds the 'sessions' requirement with venue validation
export const step3Schema = step2Schema.extend({
    sessions: z.array(sessionWithVenueSchema)
        .min(1, {message: "You must schedule at least one session."}),
});

// Step 4 makes the 'sessions' validation stricter with seating checks
export const step4Schema = step3Schema.extend({
    sessions: z.array(sessionWithSeatingSchema)
        .min(1, {message: "You must schedule at least one session."}),
});

export const step5Schema = step4Schema.extend({
    discounts: z.array(discountSchema).optional(),
})

// The final, complete schema for the entire form submission
export const finalCreateEventSchema = step5Schema;


// --- Type Inference ---

export type CreateEventFormData = z.input<typeof finalCreateEventSchema>;
export type CreateEventParsed = z.infer<typeof finalCreateEventSchema>;
export type SessionBasicData = z.infer<typeof baseSessionSchema>;
export type SessionWithVenueData = z.infer<typeof sessionWithVenueSchema>;
export type SessionWithSeatingData = z.infer<typeof sessionWithSeatingSchema>;
export type SessionFormData = z.infer<typeof sessionWithSeatingSchema>;
export type TierFormData = z.infer<typeof tierSchema>;
export type VenueDetails = z.infer<typeof venueDetailsSchema>;
export type Block = z.infer<typeof blockSchema>;
export type Seat = z.infer<typeof seatSchema>;
export type SessionSeatingMapRequest = z.infer<typeof sessionSeatingMapRequestSchema>;
export type Row = z.infer<typeof rowSchema>;
export type DiscountFormData = z.input<typeof discountSchema>;
export type DiscountParsed = z.infer<typeof discountSchema>;


// --- API Response Schemas ---


export enum EventStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
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
    salesStartTime: z.iso.datetime(),
    sessionType: z.enum([SessionType.PHYSICAL, SessionType.ONLINE]),
    venueDetails: venueDetailsSchema,
    status: z.string(), // Corresponds to SessionStatus enum
    layoutData: sessionSeatingMapRequestSchema, // Assuming this is the correct shape
});

export const eventDetailSchema = z.object({
    id: z.uuid(),
    title: z.string(),
    description: z.string(),
    overview: z.string(),
    status: z.enum(Object.values(EventStatus)),
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
