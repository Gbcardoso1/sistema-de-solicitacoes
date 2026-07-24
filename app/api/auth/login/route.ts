import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Credenciais validas lidas de variaveis de ambiente (nunca ficam no codigo/bundle).
// Configure no projeto: AUTH_PATRIMONIO_LOGIN, AUTH_PATRIMONIO_SENHA,
// AUTH_GESTOR_LOGIN, AUTH_GESTOR_SENHA
function getValidCredentials() {
  return [
    {
      login: process.env.AUTH_PATRIMONIO_LOGIN || "patrimonio",
      senha: process.env.AUTH_PATRIMONIO_SENHA,
    },
    {
      login: process.env.AUTH_GESTOR_LOGIN || "Gestor",
      senha: process.env.AUTH_GESTOR_SENHA,
    },
  ].filter((cred) => Boolean(cred.senha));
}

export async function POST(request: Request) {
  try {
    const { login, senha } = await request.json();

    const validCredentials = getValidCredentials();

    if (validCredentials.length === 0) {
      console.error(
        "[v0] Nenhuma credencial configurada. Defina AUTH_PATRIMONIO_SENHA e/ou AUTH_GESTOR_SENHA nas variaveis de ambiente."
      );
      return NextResponse.json(
        { error: "Autenticacao nao configurada no servidor" },
        { status: 500 }
      );
    }

    // Verifica se as credenciais sao validas
    const isValid = validCredentials.some(
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
