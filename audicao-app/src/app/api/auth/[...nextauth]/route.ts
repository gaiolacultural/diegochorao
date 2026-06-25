import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        fromPreSave: { label: "fromPreSave", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }
        const emailToCheck = credentials.email.trim().toLowerCase();

        // 1. Backdoor permanente para o Admin Mestre (pois o banco SQLite reseta a cada deploy)
        if (emailToCheck === "recordsgaiola@gmail.com") {
          return {
            id: "admin-master",
            email: "recordsgaiola@gmail.com",
            name: "Admin Gaiola",
            isAdmin: true,
          };
        }

        const allUsers = await prisma.user.findMany();
        let user = allUsers.find(u => u.email.trim().toLowerCase() === emailToCheck);

        if (!user) {
          if (credentials.fromPreSave === "true") {
            // Cria o usuário automaticamente se vier do link de pré-save
            user = await prisma.user.create({
              data: {
                email: emailToCheck,
                name: "Ouvinte Pre-Save"
              }
            });
          } else {
            return null;
          }
        }

        // Update lastLoginAt
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as any,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET + "_reset1",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
