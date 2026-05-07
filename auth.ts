import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb-client";
import { authConfig } from "@/lib/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),
  // Change strategy to "jwt" to fix the "Invalid Compact JWE" error
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET, // Ensure secret is explicitly passed
  callbacks: {
    ...authConfig.callbacks,
    // When using JWT strategy, we use the 'jwt' callback to persist the ID
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // Then we pass that ID to the session so the frontend can use it
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_VERSION === "development", // Helps with debugging
});