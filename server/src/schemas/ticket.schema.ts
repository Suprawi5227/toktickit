import { z } from "zod";

export const CreateTicketSchema = z.object({
  summary: z.string().min(1, "Summary is required"),
  description: z.string().min(1, "Description is required"),
  requestedPriority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  categoryId: z.number().int().positive("Category ID must be a valid ID"),
  relatedSystemId: z.number().int().positive("Related System ID must be a valid ID"),
  requesterId: z.number().int().positive("Requester ID must be a valid ID"),
});

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;
