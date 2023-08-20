'use client'

import { db } from '@/lib/db'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { FC, useCallback, useEffect, useRef, useState } from 'react'

import { Thread } from '@prisma/client'

interface ThreadFeedProps { }

const ThreadFeed: FC<ThreadFeedProps> = ({ }) => {
    const {
        isFetching,
        data: queryResults,
        isFetched,
    } = useQuery({
        queryKey: ['thread-query'],
        queryFn: async () => {
            const { data } = await axios.get(`/api/thread`)
            return data as Thread[]

        },
    })

    console.log(queryResults)

    return (
        <h1>
            {queryResults?.map((thread) => (
                <h1 key={thread.id}>
                    <a href={`/forum/${thread.name}`}>forum/{thread.name}</a>
                </h1>
            ))}
        </h1>
    )
}

export default ThreadFeed
