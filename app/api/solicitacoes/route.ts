import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET - Listar solicitações com filtros opcionais
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const tipo = searchParams.get("tipo")
  const instituicao = searchParams.get("instituicao")
  const ano = searchParams.get("ano")
  const numero = searchParams.get("numero")

  // Buscar por número específico
  if (numero) {
    const { data, error } = await supabase
      .from("solicitacoes")
      .select("*")
      .ilike("numero_solicitacao", numero)
      .single()

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data || null)
  }

  let query = supabase
    .from("solicitacoes")
    .select("*")
    .order("created_at", { ascending: false })

  if (tipo) query = query.eq("tipo", tipo)
  if (instituicao) query = query.ilike("instituicao", `%${instituicao}%`)
  if (ano) query = query.ilike("data_hora", `%${ano}%`)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

// POST - Criar nova solicitação
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from("solicitacoes")
    .insert([body])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

// PATCH - Atualizar solicitação
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("solicitacoes")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
