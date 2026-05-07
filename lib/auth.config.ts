import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

// This config is used by Edge middleware - no MongoDB/Node.js APIs
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/login");
      const isPublicPage = nextUrl.pathname === "/";
      const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");

      // Allow API auth routes
      if (isApiAuthRoute) {
        return true;
      }

      // Redirect logged-in users away from login page
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/notes", nextUrl));
      }

      // Allow public pages
      if (isPublicPage || isAuthPage) {
        return true;
      }

      // Require auth for all other pages
      return isLoggedIn;
    },
  },
  trustHost: true,
};
