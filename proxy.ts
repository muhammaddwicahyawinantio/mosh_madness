import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Next 16: proxy.ts menggantikan middleware.ts.
 * NextAuth edge-safe config → proteksi halaman /admin.
 */
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/admin/:path*"],
};
