import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { ThreadSubscriptionValidator } from '@/lib/validators/thread'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { threadId } = ThreadSubscriptionValidator.parse(body)

    // check if user has already subscribed to thread
    const subscriptionExists = await db.subscription.findFirst({
      where: {
        threadId,
        userId: session.user.id,
      },
    })

    if (subscriptionExists) {
      return new Response("You've already subscribed to this thread", {
        status: 400,
      })
    }

    // create thread and associate it with the user
    await db.subscription.create({
      data: {
        threadId,
        userId: session.user.id,
      },
    })

    return new Response(threadId)
  } catch (error) {
    (error)
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 })
    }

    return new Response(
      'Could not subscribe to thread at this time. Please try later',
      { status: 500 }
    )
  }
}
