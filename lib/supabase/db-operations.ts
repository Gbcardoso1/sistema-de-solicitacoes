import { createClient } from './client'

// Solicitações de Patrimônio
export async function salvarSolicitacaoPatrimonio(dados: any) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('solicitacoes_patrimonio')
    .insert([dados])
    .select()
  
  if (error) throw error
  return data?.[0]
}

export async function obterSolicitacoesPatrimonio() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('solicitacoes_patrimonio')
    .select('*, itens_patrimonio(*)')
  
  if (error) throw error
  return data
}

// Solicitações de Almoxarifado
export async function salvarSolicitacaoAlmoxarifado(dados: any) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('solicitacoes_almoxarifado')
    .insert([dados])
    .select()
  
  if (error) throw error
  return data?.[0]
}

export async function obterSolicitacoesAlmoxarifado() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('solicitacoes_almoxarifado')
    .select('*, itens_almoxarifado_papelaria(*), itens_almoxarifado_cozinha(*)')
  
  if (error) throw error
  return data
}

// Solicitações de Kits
export async function salvarSolicitacaoKits(dados: any) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('solicitacoes_kits')
    .insert([dados])
    .select()
  
  if (error) throw error
  return data?.[0]
}

export async function obterSolicitacoesKits() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('solicitacoes_kits')
    .select('*, itens_kits_aluno(*), itens_kits_mochila(*), itens_kits_professor(*)')
  
  if (error) throw error
  return data
}

// Solicitações de Uniformes
export async function salvarSolicitacaoUniformes(dados: any) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('solicitacoes_uniformes')
    .insert([dados])
    .select()
  
  if (error) throw error
  return data?.[0]
}

export async function obterSolicitacoesUniformes() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('solicitacoes_uniformes')
    .select('*, itens_uniformes(*), itens_calcados(*)')
  
  if (error) throw error
  return data
}

// Transferências de Itens
export async function salvarTransferenciaItens(dados: any) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('transferencias_itens')
    .insert([dados])
    .select()
  
  if (error) throw error
  return data?.[0]
}

export async function obterTransferenciasItens() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('transferencias_itens')
    .select('*, itens_transferencia(*)')
  
  if (error) throw error
  return data
}

// Relatórios de Inventário
export async function salvarRelatorioInventario(dados: any) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('relatorios_inventario')
    .insert([dados])
    .select()
  
  if (error) throw error
  return data?.[0]
}

export async function obterRelatoriosInventario() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('relatorios_inventario')
    .select('*, itens_inventario(*)')
  
  if (error) throw error
  return data
}

// Histórico de Edições
export async function registrarEdicao(tabela: string, registroId: string, usuario: string, tipoAlteracao: string, dadosAntigos: any, dadosNovos: any) {
  const supabase = createClient()
  const { error } = await supabase
    .from('historico_edicoes')
    .insert([{
      tabela,
      registro_id: registroId,
      usuario,
      tipo_alteracao: tipoAlteracao,
      dados_antigos: dadosAntigos,
      dados_novos: dadosNovos
    }])
  
  if (error) throw error
}

// Conversas de Chat
export async function salvarConversa(nomeUsuario: string, instituicaoNome: string, mensagens: any[]) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('conversas_chat')
    .insert([{
      nome_usuario: nomeUsuario,
      instituicao_nome: instituicaoNome,
      mensagens
    }])
    .select()
  
  if (error) throw error
  return data?.[0]
}

export async function obterConversas() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('conversas_chat')
    .select('*')
    .order('criada_em', { ascending: false })
  
  if (error) throw error
  return data
}

// Itens genéricos
export async function adicionarItem(tabela: string, dados: any) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(tabela)
    .insert([dados])
    .select()
  
  if (error) throw error
  return data?.[0]
}

export async function removerItem(tabela: string, id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from(tabela)
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function atualizarItem(tabela: string, id: string, dados: any) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(tabela)
    .update(dados)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data?.[0]
}
