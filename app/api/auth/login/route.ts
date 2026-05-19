import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { login, senha } = await request.json();

    if (!login || !senha) {
      return NextResponse.json(
        { error: "Login e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Mapeamento de usuários conhecidos para emails
    const userEmailMap: Record<string, string> = {
      "patrimonio": "patrimonio@saquarema.admin.gov.br",
      "gestor": "gestor@saquarema.admin.gov.br",
    };

    // Se o login é um nome de usuário conhecido, usar o email mapeado
    // Se já é um email, usar diretamente
    const email = login.includes("@") 
      ? login 
      : userEmailMap[login.toLowerCase()] || `${login.toLowerCase()}@saquarema.admin.gov.br`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      console.error("[v0] Supabase auth error:", error.message);
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || "admin"
      }
    });
  } catch (err) {
    console.error("[v0] Login error:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
