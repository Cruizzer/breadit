import { z } from 'zod'

export const ThreadValidator = z.object({
  name: z.string().min(3).max(21),
})

export const ThreadSubscriptionValidator = z.object({
  threadId: z.string(),
})

export type CreateThreadPayload = z.infer<typeof ThreadValidator>
export type SubscribeToThreadPayload = z.infer<
  typeof ThreadSubscriptionValidator
>
