import { z } from 'zod'

export const showSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  date: z.string().min(1, 'Date is required'),
  venue_id: z.string().min(1, 'Venue is required'),
  price: z.union([z.string(), z.number()]).optional(),
  ticket_link: z.string().optional(),
  status: z.enum(['scheduled', 'cancelled', 'performed', 'completed'])
})

export type ShowFormValues = z.infer<typeof showSchema> 