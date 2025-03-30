import { t } from "../trpc"
import { adminRouter } from "./admin.routers"

export const appRouter = t.router({
    admin: adminRouter
})

export type AppRouter = typeof appRouter