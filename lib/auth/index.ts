import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "../db/prisma";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const admin = await prisma.admin.findFirst({
          where: {
            email: credentials.email
          }
        });

        if (!admin) {
          return null;
        }

        const passwordValid = await compare(credentials.password, admin.password);

        if (!passwordValid) {
          return null;
        }

        return {
          id: admin.id,
          email: admin.email,
          name: admin.username,
        };
      }
    })
  ],
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Untuk setup awal database connection
export const createAdminAccount = async () => {
  const existingAdmin = await prisma.admin.findFirst();
  
  // Hanya buat admin baru jika belum ada admin di database
  if (!existingAdmin) {
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    await prisma.admin.create({
      data: {
        username: "admin",
        email: "admin@example.com",
        password: hashedPassword
      }
    });
    
    console.log("Admin account created successfully");
  }
};