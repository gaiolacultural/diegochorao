import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Protege todas as rotas da aplicação, exceto as imagens e api/auth
  matcher: [
    "/((?!login|presave|api|_next/static|_next/image|favicon.ico).*)",
  ],
};
