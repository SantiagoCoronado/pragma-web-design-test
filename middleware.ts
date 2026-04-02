import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match root
    "/",
    // Match locale prefixed paths (excluding api, _next, and files with extensions)
    "/(en|es)/:path*",
    // Match any path that doesn't start with api, _next, or contain a dot (file extension)
    "/((?!api|_next|favicon.ico|images|fonts|.*\\.).*)",
  ],
};
