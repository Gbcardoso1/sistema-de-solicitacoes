import { createClient } from './client'

// Tipos
export type TipoSolicitacao = 'patrimonio' | 'almoxarifado' | 'kits' | 'uniformes' | 'transferencia'
export type StatusSolicitacao = 'pendente' | 'em_analise' | 'aprovado' | 'rejeitado' | 'concluido' | 'cancelado'

// Gerar codigo unico para solicitacao
function gerarCodigoSolicitacao(tipo: TipoSolicitacao): string {
  const prefixos: Record<TipoSolicitacao, string> = {
    patrimonio: 'PAT',
    almoxarifado: 'ALM',
    kits: 'KIT',
    uniformes: 'UNI',
    transferencia: 'TRF'
  }
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefixos[tipo]}-${timestamp}-${random}`
}

// ==================== INSTITUICOES ====================

export async function obterInstituicoes() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('instituicoes')
    .select('*')
    .eq('ativo', true)
    .order('nome')
  
  if (error) throw error
  return data
}

export async function obterInstituicaoPorNome(nome: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('instituicoes')
    .select('*')
    .eq('nome', nome)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

// ==================== SOLICITACOES ====================

export async function criarSolicitacao(dados: {
  tipo: TipoSolicitacao
  nome_solicitante: string
  matricula?: string
  instituicao_nome: string
  setor_destino?: string
  dados_itens: any[]
  observacoes?: string
  // Campos especificos de transferencia
  instituicao_origem_nome?: string
  instituicao_destino_nome?: string
  responsavel_origem?: string
  responsavel_destino?: string
  data_transferencia?: string
}) {
  const supabase = createClient()
  const codigo = gerarCodigoSolicitacao(dados.tipo)
  
  const { data, error } = await supabase
    .from('solicitacoes')
    .insert([{
      ...dados,
      codigo,
      status: 'pendente'
    }])
    .select()
  
  if (error) throw error
  return data?.[0]
}

export async function obterSolicitacoes(filtros?: {
  tipo?: TipoSolicitacao
  status?: StatusSolicitacao
  instituicao_nome?: string
}) {
  const supabase = createClient()
  let query = supabase
    .from('solicitacoes')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (filtros?.tipo) query = query.eq('tipo', filtros.tipo)
  if (filtros?.status) query = query.eq('status', filtros.status)
  if (filtros?.instituicao_nome) query = query.eq('instituicao_nome', filtros.instituicao_nome)
  
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function obterSolicitacaoPorCodigo(codigo: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('solicitacoes')
    .select('*')
    .eq('codigo', codigo)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function atualizarStatusSolicitacao(id: string, status: StatusSolicitacao, atendidoPor?: string, motivoRejeicao?: string) {
  const supabase = createClient()
  const updateData: any = { 
    status, 
    updated_at: new Date().toISOString()
  }
  
  if (atendidoPor) {
    updateData.atendido_por = atendidoPor
    updateData.atendido_em = new Date().toISOString()
  }
  
  if (motivoRejeicao) {
    updateData.motivo_rejeicao = motivoRejeicao
  }
  
  const { data, error } = await supabase
    .from('solicitacoes')
    .update(updateData)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data?.[0]
}

// ==================== INVENTARIO ====================

export async function criarInventario(dados: {
  ano: number
  instituicao_nome: string
  responsavel: string
  itens?: any[]
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('inventario')
    .insert([{
      ...dados,
      status: 'em_andamento',
      total_itens: dados.itens?.length || 0
    }])
    .select()
  
  if (error) throw error
  return data?.[0]
}

export async function obterInventarios(filtros?: {
  ano?: number
  instituicao_nome?: string
  status?: string
}) {
  const supabase = createClient()
  let query = supabase
    .from('inventario')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (filtros?.ano) query = query.eq('ano', filtros.ano)
  if (filtros?.instituicao_nome) query = query.eq('instituicao_nome', filtros.instituicao_nome)
  if (filtros?.status) query = query.eq('status', filtros.status)
  
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function atualizarInventario(id: string, dados: any) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('inventario')
    .update({ ...dados, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data?.[0]
}

// ==================== ARROLAMENTO ====================

export async function criarBemPatrimonial(dados: {
  numero_patrimonio: string
  descricao: string
  categoria?: string
  estado_conservacao?: string
  instituicao_nome: string
  localizacao?: string
  responsavel?: string
  data_aquisicao?: string
  valor_aquisicao?: number
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('arrolamento')
    .insert([dados])
    .select()
  
  if (error) throw error
  return data?.[0]
}

export async function obterBensPatrimoniais(filtros?: {
  instituicao_nome?: string
  situacao?: string
  categoria?: string
}) {
  const supabase = createClient()
  let query = supabase
    .from('arrolamento')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (filtros?.instituicao_nome) query = query.eq('instituicao_nome', filtros.instituicao_nome)
  if (filtros?.situacao) query = query.eq('situacao', filtros.situacao)
  if (filtros?.categoria) query = query.eq('categoria', filtros.categoria)
  
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function atualizarBemPatrimonial(id: string, dados: any) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('arrolamento')
    .update({ ...dados, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data?.[0]
}

// ==================== RELATORIOS ====================

export async function criarRelatorio(dados: {
  tipo: string
  titulo: string
  instituicao_nome?: string
  periodo_inicio?: string
  periodo_fim?: string
  filtros?: any
  dados?: any
  gerado_por?: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('relatorios')
    .insert([dados])
    .select()
  
  if (error) throw error
  return data?.[0]
}

export async function obterRelatorios(tipo?: string) {
  const supabase = createClient()
  let query = supabase
    .from('relatorios')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (tipo) query = query.eq('tipo', tipo)
  
  const { data, error } = await query
  if (error) throw error
  return data
}

// ==================== MENSAGENS CHAT ====================

export async function salvarMensagemChat(dados: {
  sessao_id: string
  nome_usuario: string
  instituicao_nome: string
  remetente: 'usuario' | 'atendente' | 'sistema'
  mensagem: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mensagens_chat')
    .insert([dados])
    .select()
  
  if (error) throw error
  return data?.[0]
}

export async function obterMensagensChat(sessaoId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mensagens_chat')
    .select('*')
    .eq('sessao_id', sessaoId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}

// ==================== HISTORICO ====================

export async function registrarHistorico(dados: {
  tabela: string
  registro_id: string
  acao: 'criacao' | 'edicao' | 'exclusao' | 'status_alterado'
  dados_anteriores?: any
  dados_novos?: any
  usuario?: string
}) {
  const supabase = createClient()
  const { error } = await supabase
    .from('historico_edicoes')
    .insert([dados])
  
  if (error) throw error
}

// ==================== ITENS PATRIMONIO (CATALOGO) ====================

export async function obterItensPatrimonio(categoria?: string) {
  const supabase = createClient()
  let query = supabase
    .from('itens_patrimonio')
    .select('*')
    .eq('ativo', true)
    .order('nome')
  
  if (categoria) query = query.eq('categoria', categoria)
  
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function criarItemPatrimonio(dados: {
  nome: string
  categoria: string
  descricao?: string
  codigo?: string
  unidade?: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('itens_patrimonio')
    .insert([dados])
    .select()
  
  if (error) throw error
  return data?.[0]
}
