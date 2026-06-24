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
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }
        const allUsers = await prisma.user.findMany();
        let user = allUsers.find(u => u.email.trim().toLowerCase() === credentials.email.trim().toLowerCase());

        if (!user) {
          // Se o usuário não existir, cria ele automaticamente na hora
          user = await prisma.user.create({
            data: {
              email: credentials.email.toLowerCase().trim(),
            },
          });
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
    signIn: "/poesiadeboteco/login",
    error: "/poesiadeboteco/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
