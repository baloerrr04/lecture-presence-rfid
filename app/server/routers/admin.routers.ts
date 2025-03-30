import { t } from "../trpc"
import { z } from "zod"
import bcrypt from "bcrypt"
import jwt from"jsonwebtoken"

const jwtsecret = process.env.JWT_SECRET 

export const adminRouter = t.router({
    register: t.procedure
    .input(z.object({username: z.string(), email: z.string().email(), password: z.string().min(6)}))
    .mutation(async ({input, ctx}) => {
        const hashedPassword = await bcrypt.hash(input.password, 10)
        const admin = await ctx.prisma.admin.create({data: {...input, password:hashedPassword}})
        return { message: "Admin registered", admin }
    }),

    login: t.procedure
    .input(z.object({ username: z.string(), password: z.string().min(6) }))
    .mutation(async ({ input, ctx }) => {
      const admin = await ctx.prisma.admin.findFirst({ where: { username: input.username } });
      if (!admin || !(await bcrypt.compare(input.password, admin.password))) {
        throw new Error("Invalid credentials");
      }
      const token = await jwt.sign({ id: admin.id, username: admin.username }, jwtsecret!, { expiresIn: "1h" });
      return { message: "Login successful", token };
    }),

    getAdmins: t.procedure
    .query( async ({ctx}) => {
        const admin = await ctx.prisma.admin.findMany()

        if(!admin) {
            throw new Error("admins not found")
        } 

        return admin
            
    })
})