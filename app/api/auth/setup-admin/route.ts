import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Lista de administradores a serem criados
// IMPORTANTE: Após criar os usuários, REMOVA ou PROTEJA esta rota!
const ADMIN_USERS = [
  { login: "patrimonio", email: "patrimonio@saquarema.admin.gov.br", senha: "#cmpp123", role: "patrimonio" },
  { login: "gestor", email: "gestor@saquarema.admin.gov.br", senha: "#gestor123", role: "gestor" },
];

export async function POST(request: Request) {
  try {
    // Verificar token de segurança (para evitar criação não autorizada)
    const { searchParams } = new URL(request.url);
    const setupToken = searchParams.get("token");
    
    // Token simples para proteção básica - em produção, use algo mais robusto
    if (setupToken !== process.env.SETUP_TOKEN && setupToken !== "setup-admin-2024") {
      return NextResponse.json(
        { error: "Token de setup inválido" },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const results: Array<{ login: string; status: string; error?: string }> = [];

    for (const user of ADMIN_USERS) {
      // Usar signUp do Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.senha,
        options: {
          data: {
            role: user.role,
            display_name: user.login,
            login: user.login, // Para permitir login pelo nome de usuário
          },
        },
      });

      if (error) {
        // Se o usuário já existe, isso não é um erro crítico
        if (error.message.includes("already registered")) {
          results.push({
            login: user.login,
            status: "já existe",
          });
        } else {
          results.push({
            login: user.login,
            status: "erro",
            error: error.message,
          });
        }
      } else if (data.user) {
        results.push({
          login: user.login,
          status: "criado com sucesso",
        });
      }
    }

    return NextResponse.json({
      message: "Setup de administradores concluído",
      results,
      nota: "IMPORTANTE: Remova esta rota após criar os usuários!",
    });
  } catch (err) {
    console.error("[v0] Setup error:", err);
    return NextResponse.json(
      { error: "Erro no setup" },
      { status: 500 }
    );
  }
}

// GET para verificar se a rota está disponível
export async function GET() {
  return NextResponse.json({
    message: "Rota de setup de administradores",
    instrucoes: "Faça um POST para /api/auth/setup-admin?token=setup-admin-2024 para criar os usuários",
    aviso: "REMOVA ESTA ROTA APÓS CRIAR OS USUÁRIOS!",
  });
}
