import { z } from 'zod'

export const ThreadValidator = z.object({
  name: z.string().min(3).max(21),
})



export type CreateThreadPayload = z.infer<typeof ThreadValidator>
