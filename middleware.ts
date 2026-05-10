import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas que requerem autenticacao
const PROTECTED_ROUTES = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verifica se a rota precisa de autenticacao
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Verifica se existe o cookie de sessao
    const sessionToken = request.cookies.get("admin_session");

    if (!sessionToken || sessionToken.value !== "authenticated") {
      // Redireciona para a pagina de login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Se o usuario ja esta logado e tenta acessar /login, redireciona para /admin
  if (pathname === "/login") {
    const sessionToken = request.cookies.get("admin_session");
    if (sessionToken && sessionToken.value === "authenticated") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
