import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getUserByEmail, upsertUser } from "./db";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Google OAuth credentials are not set");
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      await upsertUser({
        email: user.email,
        display_name: user.name || undefined,
        image: user.image || undefined,
      });
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
      }
      if (token.email) {
        const dbUser = await getUserByEmail(token.email as string);
        if (dbUser) {
          token.id = dbUser.id;
          token.onboardingCompleted = dbUser.onboarding_completed;
          token.annualIncome = dbUser.annual_income;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
        session.user.annualIncome = token.annualIncome as number | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      onboardingCompleted: boolean;
      annualIncome: number | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    onboardingCompleted?: boolean;
    annualIncome?: number | null;
  }
}
