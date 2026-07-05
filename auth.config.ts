import type { NextAuthConfig } from "next-auth";

/**
 * Config edge-safe: dipakai middleware. TANPA provider berat / Prisma.
 * Provider Credentials + verifikasi DB ada di auth.ts (Node runtime).
 */
export const authConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  trustHost: true, // Railway berada di belakang proxy
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isAdminArea =
        pathname.startsWith("/admin") && pathname !== "/admin/login";

      if (isAdminArea) return isLoggedIn; // false → redirect ke signIn page
      if (pathname === "/admin/login" && isLoggedIn) {
        return Response.redirect(new URL("/admin", request.nextUrl));
      }
      return true;
    },
  },
  providers: [], // diisi di auth.ts
} satisfies NextAuthConfig;
