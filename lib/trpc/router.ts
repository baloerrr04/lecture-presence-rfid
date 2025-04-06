import { router } from './index';
// import { adminRouter } from './routers/admin';
import { lectureRouter } from './routers/lecture';
import { dayRouter } from './routers/day';
import { presenceRouter } from './routers/presence';

export const appRouter = router({
//   admin: adminRouter,
  lecture: lectureRouter,
  day: dayRouter,
  presence: presenceRouter,
});

export type AppRouter = typeof appRouter;