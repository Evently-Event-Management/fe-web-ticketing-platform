import {z} from 'zod';

export const coreDetailsSchema = z.object({
    title: z.string().min(3, {message: "Title must be at least 3 characters long."}).max(100),
    description: z.string().max(500).optional(),
    overview: z.string().optional(),
    categoryId: z.string().min(1, {message: "Please select a category."}),
    isOnline: z.boolean(),
    venueId: z.string().optional(),
    onlineLink: z.string().optional(),
    locationDescription: z.string().optional(),
}).refine(data => !data.isOnline ? !!data.venueId : true, {
    message: "A venue is required for physical events.",
    path: ["venueId"],
}).refine(data => data.isOnline ? !!data.onlineLink : true, {
    message: "An online link is required for online events.",
    path: ["onlineLink"],
});

export type CoreDetailsData = z.infer<typeof coreDetailsSchema>;
