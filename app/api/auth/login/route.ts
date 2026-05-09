import { NextRequest, NextResponse } from "next/server";
import { criarToken, SESSION_COOKIE } from "@/lib/session";

const USUARIO_VALIDO = "patrimonio";
const SENHA_VALIDA = "#cmpp123";

export async function POST(request: NextRequest) {
  const { login, senha } = await request.json();

  if (login !== USUARIO_VALIDO || senha !== SENHA_VALIDA) {
    return NextResponse.json(
      { erro: "Usuário ou senha incorretos" },
      { status: 401 }
    );
  }

  const token = await criarToken({ usuario: login });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 horas
  });

  return response;
}
