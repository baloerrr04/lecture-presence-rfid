"use client"

import { trpc } from "@/utils/trpc"
import { httpBatchLink } from "@trpc/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"