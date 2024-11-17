import { z } from "zod";

export const showSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  venue_id: z.string().uuid(),
  description: z.string().optional(),
  scheduledPerformers: z.array(z.string().uuid()).optional(),
});

export const showPerformerSchema = z.object({
  show_id: z.string().uuid(),
  member_id: z.string().uuid(),
  status: z.enum(["scheduled", "performed"]),
});

export type Show = z.infer<typeof showSchema>;
export type ShowPerformer = z.infer<typeof showPerformerSchema>; 