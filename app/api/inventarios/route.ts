import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET - Listar inventários
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const escola = searchParams.get("escola")
  const tipo = searchParams.get("tipo") // "escola" ou "setor"

  if (tipo === "setor") {
    let query = supabase
      .from("inventarios_setor")
      .select("*")
      .order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data || [])
  }

  let query = supabase
    .from("inventarios")
    .select("*")
    .order("created_at", { ascending: false })

  if (escola) query = query.ilike("escola", `%${escola}%`)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

// POST - Criar inventário
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  const { tipo, ...dados } = body

  const tabela = tipo === "setor" ? "inventarios_setor" : "inventarios"

  const { data, error } = await supabase
    .from(tabela)
    .insert([dados])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

// PATCH - Atualizar inventário
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  const { id, tipo, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
  }

  const tabela = tipo === "setor" ? "inventarios_setor" : "inventarios"

  const { data, error } = await supabase
    .from(tabela)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
