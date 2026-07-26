import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Credenciais validas (em producao, isso deve estar em um banco de dados com hash de senha)
const VALID_CREDENTIALS = [
  { login: "patrimonio", senha: "#cmpp123" },
  { login: "Gestor", senha: "#gestor123" },
];

export async function POST(request: Request) {
  try {
    const { login, senha } = await request.json();

    // Verifica se as credenciais sao validas
    const isValid = VALID_CREDENTIALS.some(
      (cred) =>
        cred.login.toLowerCase() === login.toLowerCase() && cred.senha === senha
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Credenciais invalidas" },
        { status: 401 }
      );
    }

    // Define o cookie de sessao (expira em 24 horas)
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 horas
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
