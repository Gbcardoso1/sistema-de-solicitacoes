import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Remove o cookie de sessao
    cookieStore.delete("admin_session");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao fazer logout" },
      { status: 500 }
    );
  }
}
