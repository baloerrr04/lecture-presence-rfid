import { createTRPCReact } from "@trpc/react-query"
import type { AppRouter } from "@/app/server/routers/index"

export const trpc = createTRPCReact<AppRouter>()