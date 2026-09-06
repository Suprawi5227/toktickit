import { z } from "zod";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
export const CreateTicketSchema = z.object({
    summary: z.string().min(1, "Summary is required"),
    description: z.string().min(1, "Description is required"),
    categoryId: z.coerce.number({ invalid_type_error: "Category is required" }).int().positive("Category is required"),
    relatedSystemId: z.coerce.number({ invalid_type_error: "Related System is required" }).int().positive("Related System is required"),
    requestedPriority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    attachments: z.any()
        .refine((files) => !files || files.length <= 5, "Maximum of 5 files are allowed.")
        .refine((files) => {
        if (!files)
            return true;
        for (let i = 0; i < files.length; i++) {
            if (files[i].size > MAX_FILE_SIZE)
                return false;
        }
        return true;
    }, "Max file size is 5MB.")
        .refine((files) => {
        if (!files)
            return true;
        for (let i = 0; i < files.length; i++) {
            if (!ACCEPTED_IMAGE_TYPES.includes(files[i].type))
                return false;
        }
        return true;
    }, "Only JPG, PNG, WEBP, and PDF files are allowed.")
        .optional(),
});
