import { z } from "zod";

export const showSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  venue_id: z.string().uuid("Invalid venue ID"),
  date: z.string().datetime("Invalid date"),
});

export type ShowFormData = z.infer<typeof showSchema>; 