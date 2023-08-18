import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

export async function GET(req: Request) {
  const url = new URL(req.url)

  const session = await getAuthSession()

  let followedCommunitiesIds: string[] = []

  if (session) {
    const followedCommunities = await db.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        thread: true,
      },
    })

    followedCommunitiesIds = followedCommunities.map((sub) => sub.thread.id)
  }

  try {
    const { limit, page, threadName } = z
      .object({
        limit: z.string(),
        page: z.string(),
        threadName: z.string().nullish().optional(),
      })
      .parse({
        threadName: url.searchParams.get('threadName'),
        limit: url.searchParams.get('limit'),
        page: url.searchParams.get('page'),
      })

    let whereClause = {}

    if (threadName) {
      whereClause = {
        thread: {
          name: threadName,
        },
      }
    } else if (session) {
      whereClause = {
        thread: {
          id: {
            in: followedCommunitiesIds,
          },
        },
      }
    }

    const posts = await db.post.findMany({
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit), // skip should start from 0 for page 1
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        thread: true,
        votes: true,
        author: true,
        comments: true,
      },
      where: whereClause,
    })

    return new Response(JSON.stringify(posts))
  } catch (error) {
    return new Response('Could not fetch posts', { status: 500 })
  }
}
