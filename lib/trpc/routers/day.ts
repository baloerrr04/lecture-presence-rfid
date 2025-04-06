// /lib/trpc/routers/day.ts
import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../index';
import { TRPCError } from '@trpc/server';

export const dayRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.day.findMany();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const day = await ctx.prisma.day.findUnique({
        where: { id: input.id },
      });

      if (!day) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Day not found',
        });
      }

      return day;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if day already exists
      const existingDay = await ctx.prisma.day.findFirst({
        where: {
          name: input.name
        }
      });

      if (existingDay) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Hari dengan nama ini sudah ada',
        });
      }

      return await ctx.prisma.day.create({
        data: input,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check if day exists
      const day = await ctx.prisma.day.findUnique({
        where: { id },
      });

      if (!day) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Hari tidak ditemukan',
        });
      }

      // Check if new name already exists (excluding current day)
      const existingDay = await ctx.prisma.day.findFirst({
        where: {
          name: input.name,
          id: { not: id }
        }
      });

      if (existingDay) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Hari dengan nama ini sudah ada',
        });
      }

      return await ctx.prisma.day.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if day exists
      const day = await ctx.prisma.day.findUnique({
        where: { id: input.id },
      });

      if (!day) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Hari tidak ditemukan',
        });
      }

      // Check if day is being used by lectures
      const dayInUse = await ctx.prisma.lectureDay.findFirst({
        where: { day_id: input.id },
      });

      if (dayInUse) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Hari ini sedang digunakan oleh dosen dan tidak dapat dihapus',
        });
      }

      return await ctx.prisma.day.delete({
        where: { id: input.id },
      });
    }),

  getCount: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.day.count();
  }),
});