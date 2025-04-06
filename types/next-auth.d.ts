// /types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Memperluas tipe Session default untuk menambahkan properti id
   */
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"]
  }

  /**
   * Menentukan tipe user yang akan digunakan di tipe JWT dan callbacks
   */
  interface User {
    id: string;
    name: string;
    email: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Memperluas tipe JWT default untuk menambahkan properti id
   */
  interface JWT {
    id: string;
  }
}