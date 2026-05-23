export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/tasks/:path*", "/messages/:path*", "/applications/:path*"],
};
