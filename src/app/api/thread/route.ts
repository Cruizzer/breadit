import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { ThreadValidator } from '@/lib/validators/thread'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { name } = ThreadValidator.parse(body)

    // check if thread already exists
    const threadExists = await db.thread.findFirst({
      where: {
        name,
      },
    })

    if (threadExists) {
      return new Response('Thread already exists', { status: 409 })
    }

    // create thread and associate it with the user
    const thread = await db.thread.create({
      data: {
        name,
        creatorId: session.user.id,
      },
    })

    // creator also has to be subscribed
    await db.subscription.create({
      data: {
        userId: session.user.id,
        threadId: thread.id,
      },
    })

    return new Response(thread.name)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 })
    }

    return new Response('Could not create thread', { status: 500 })
  }
}
