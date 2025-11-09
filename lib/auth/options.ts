import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db/prisma';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            merchantsOwned: {
              select: { id: true },
            },
            merchantMemberships: {
              select: { merchantId: true },
            },
          },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await compare(credentials.password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        const merchantIds = [
          ...user.merchantsOwned.map((m) => m.id),
          ...user.merchantMemberships.map((m) => m.merchantId),
        ];

        return {
          id: user.id,
          email: user.email,
          name: user.displayName || undefined,
          userType: user.userType,
          merchantId: merchantIds[0] || undefined,
          merchantIds: merchantIds.length > 0 ? merchantIds : undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.userType = user.userType;
        token.merchantId = user.merchantId;
        token.merchantIds = user.merchantIds;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.userType = token.userType as string;
        session.user.merchantId = token.merchantId as string | undefined;
        session.user.merchantIds = token.merchantIds as string[] | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
