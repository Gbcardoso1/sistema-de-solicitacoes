import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET - Listar mensagens de chat
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const instituicao = searchParams.get("instituicao")
  const conversaId = searchParams.get("conversaId")

  let query = supabase
    .from("chat_messages")
    .select("*")
    .order("created_at", { ascending: true })

  if (instituicao) query = query.ilike("instituicao", instituicao)
  if (conversaId) query = query.eq("conversa_id", conversaId)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

// POST - Enviar mensagem
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from("chat_messages")
    .insert([body])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

// PATCH - Marcar mensagens como lidas
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  const { instituicao } = body

  if (!instituicao) {
    return NextResponse.json({ error: "Instituição é obrigatória" }, { status: 400 })
  }

  const { error } = await supabase
    .from("chat_messages")
    .update({ lida: true })
    .ilike("instituicao", instituicao)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
