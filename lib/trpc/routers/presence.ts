// /lib/trpc/routers/presence.ts
import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../index';
import { TRPCError } from '@trpc/server';

export const presenceRouter = router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.prisma.presence.findMany({
            include: {
                lecture: true,
                day: true,
            },
            orderBy: {
                created_at: 'desc',
            },
        });
    }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const presence = await ctx.prisma.presence.findUnique({
                where: { id: input.id },
                include: {
                    lecture: true,
                    day: true,
                },
            });

            if (!presence) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Presensi tidak ditemukan',
                });
            }

            return presence;
        }),

    getByDate: protectedProcedure
        .input(
            z.object({
                date: z.date(),
            })
        )
        .query(async ({ ctx, input }) => {
            const { date } = input;

            // Set time to start of day and end of day
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            return await ctx.prisma.presence.findMany({
                where: {
                    created_at: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                include: {
                    lecture: true,
                    day: true,
                },
                orderBy: {
                    created_at: 'desc',
                },
            });
        }),

    getByLecture: protectedProcedure
        .input(
            z.object({
                lectureId: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.presence.findMany({
                where: {
                    lecture_id: input.lectureId,
                },
                include: {
                    day: true,
                },
                orderBy: {
                    created_at: 'desc',
                },
            });
        }),

    create: protectedProcedure
        .input(
            z.object({
                lecture_id: z.string(),
                day_id: z.string(),
                status: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Check if lecture exists
            const lecture = await ctx.prisma.lecture.findUnique({
                where: { id: input.lecture_id },
            });

            if (!lecture) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Dosen tidak ditemukan',
                });
            }

            // Check if day exists
            const day = await ctx.prisma.day.findUnique({
                where: { id: input.day_id },
            });

            if (!day) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Hari tidak ditemukan',
                });
            }

            // Create presence
            return await ctx.prisma.presence.create({
                data: input,
            });
        }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                status: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;

            // Check if presence exists
            const presence = await ctx.prisma.presence.findUnique({
                where: { id },
            });

            if (!presence) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Presensi tidak ditemukan',
                });
            }

            return await ctx.prisma.presence.update({
                where: { id },
                data,
            });
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Check if presence exists
            const presence = await ctx.prisma.presence.findUnique({
                where: { id: input.id },
            });

            if (!presence) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Presensi tidak ditemukan',
                });
            }

            return await ctx.prisma.presence.delete({
                where: { id: input.id },
            });
        }),

    getCount: publicProcedure.query(async ({ ctx }) => {
        return await ctx.prisma.presence.count();
    }),

    getTodayCount: publicProcedure.query(async ({ ctx }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return await ctx.prisma.presence.count({
            where: {
                created_at: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });
    }),

    // Tambahkan ini ke /lib/trpc/routers/presence.ts

    // Query untuk mendapatkan presensi terbaru
    getRecent: publicProcedure
        .input(
            z.object({
                limit: z.number().default(5)
            })
        )
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.presence.findMany({
                take: input.limit,
                orderBy: {
                    created_at: 'desc'
                },
                include: {
                    lecture: true,
                    day: true
                }
            });
        }),
});