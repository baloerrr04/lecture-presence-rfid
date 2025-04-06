// /lib/trpc/routers/lecture.ts
import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../index';
import { TRPCError } from '@trpc/server';

export const lectureRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.lecture.findMany({
      include: {
        day: {
          include: {
            day: true
          }
        }
      }
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const lecture = await ctx.prisma.lecture.findUnique({
        where: { id: input.id },
        include: {
          day: {
            include: {
              day: true
            }
          }
        }
      });

      if (!lecture) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lecture not found',
        });
      }

      return lecture;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        rfid_id: z.string().min(1),
        photo: z.string().optional(),
        code: z.string().min(1),
        dayIds: z.array(z.string())
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { dayIds, ...lectureData } = input;
      
      return await ctx.prisma.$transaction(async (tx) => {
        // Create lecture
        const lecture = await tx.lecture.create({
          data: lectureData
        });

        // Connect days
        if (dayIds.length > 0) {
          await Promise.all(
            dayIds.map((dayId) => 
              tx.lectureDay.create({
                data: {
                  lecture_id: lecture.id,
                  day_id: dayId
                }
              })
            )
          );
        }

        return lecture;
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        rfid_id: z.string().min(1),
        photo: z.string().optional(),
        code: z.string().min(1),
        dayIds: z.array(z.string())
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, dayIds, ...updateData } = input;

      return await ctx.prisma.$transaction(async (tx) => {
        // Update lecture data
        const lecture = await tx.lecture.update({
          where: { id },
          data: updateData
        });

        // Delete existing day connections
        await tx.lectureDay.deleteMany({
          where: { lecture_id: id }
        });

        // Create new day connections
        if (dayIds.length > 0) {
          await Promise.all(
            dayIds.map((dayId) => 
              tx.lectureDay.create({
                data: {
                  lecture_id: lecture.id,
                  day_id: dayId
                }
              })
            )
          );
        }

        return lecture;
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.lecture.delete({
        where: { id: input.id }
      });
    }),

  getByDay: publicProcedure
    .input(z.object({ dayId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.lecture.findMany({
        where: {
          day: {
            some: {
              day_id: input.dayId
            }
          }
        },
        include: {
          presence: {
            where: {
              day_id: input.dayId
            }
          }
        }
      });
    }),

  getByRfid: publicProcedure
    .input(z.object({ rfidId: z.string() }))
    .query(async ({ ctx, input }) => {
      const lecture = await ctx.prisma.lecture.findFirst({
        where: { rfid_id: input.rfidId }
      });

      if (!lecture) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lecture not found with this RFID',
        });
      }

      return lecture;
    }),

    getCount: publicProcedure.query(async ({ ctx }) => {
        return await ctx.prisma.lecture.count();
      }),
});