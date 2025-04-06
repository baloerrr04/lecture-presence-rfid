// /lib/trpc/context.ts
import { inferAsyncReturnType } from '@trpc/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../db/prisma'
import { authOptions } from '../auth';
import { NextApiRequest, NextApiResponse } from 'next';

export async function createContext() {
    const session = await getServerSession(authOptions);
  
    return {
      prisma,
      session
    };
  }

export type Context = inferAsyncReturnType<typeof createContext>;