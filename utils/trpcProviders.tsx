"use client"

import { trpc } from "@/utils/trpc"
import { httpBatchLink } from "@trpc/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

const queryClient = new QueryClient()

export default function TrpcProviders({children} : {children: React.ReactNode}) {
    const trpcClient = trpc.createClient({
        links: [httpBatchLink({
            url: "/api/trpc"
        })]
    })

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient} >
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    )
}