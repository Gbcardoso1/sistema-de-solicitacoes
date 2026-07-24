// Store para gerenciar solicitações - Conectado ao Supabase
import { createClient } from "@/lib/supabase/client"

export interface ItemDetalhado {
  tipo?: string;
  genero?: string;
  tamanho?: string;
  quantidade: number;
  categoria?: string;
}

// Gerar numero de solicitacao aleatorio no formato: SOL-XXXXXX
export function gerarNumeroSolicitacao(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SOL-${codigo}`;
}

export interface Solicitacao {
  id: string;
  numeroSolicitacao: string;
  tipo: "kits-uniformes" | "uniformes" | "kits" | "almoxarifado" | "patrimonio" | "transferencia";
  dataHora: string;
  nome: string;
  matricula: string;
  instituicao: string;
  dados: Record<string, unknown>;
  // Para kits/uniformes
  uniformes?: number;
  calcados?: number;
  kitsAluno?: number;
  polosProf?: number;
  mochilas?: number;
  // Detalhes específicos
  uniformesDetalhes?: ItemDetalhado[];
  calcadosDetalhes?: ItemDetalhado[];
  kitsAlunoDetalhes?: ItemDetalhado[];
  polosProfDetalhes?: ItemDetalhado[];
  mochilasDetalhes?: ItemDetalhado[];
  // Para patrimônio
  itens?: { tipo: string; quantidade: number; numeroLacre?: string; lacresIndividuais?: string[] }[];
  // Para almoxarifado
  papelaria?: ItemDetalhado[];
  cozinha?: ItemDetalhado[];
  creche?: ItemDetalhado[];
  // Para transferência
  unidadeOrigem?: string;
  unidadeDestino?: string;
  responsavelDestino?: string;
  matriculaDestino?: string;
  numeroPatrimonio?: string;
  descricaoItem?: string;
  tmbpPms?: string;
  situacao?: string;
  condicao?: string;
  itensTransferencia?: { id: number; numeroPatrimonio: string; descricaoItem: string }[];
  arquivoLaudo?: string | null;
  status?: "Pendente" | "Processamento" | "Finalizado";
  // Membro da equipe responsavel pelo atendimento
  responsavel?: string;
  // Processamento
  encaminhadoLogistica?: boolean;
  statusLogistica?: "Pendente" | "Separacao" | "Aguardando Envio" | "Concluido" | "Enviada" | "Preparando" | "Em Separacao" | "Embalado" | "Finalizada";
  quantidadeLogistica?: number;
  observacaoLogistica?: string;
  enviadoParaRomaneio?: boolean;
  // Entrega
  entregaRegistrada?: boolean;
  dataEntrega?: string;
  comprovanteUrl?: string;
  comprovanteNome?: string;
  romaneioGerado?: boolean;
  // Cancelamento
  solicitacaoCancelamento?: boolean;
  motivoCancelamento?: string;
  dataCancelamento?: string;
  statusCancelamento?: "Pendente" | "Em Analise" | "Aprovado" | "Recusado";
}

export interface EstoqueItem {
  id: string;
  nome: string;
  categoria: "Uniforme" | "Kit" | "Almoxarifado" | "Patrimonio" | "Calcado" | "Mochila";
  quantidade: number;
  estoqueMinimo: number;
  ultimaAtualizacao: string;
}

export interface ChatMessage {
  id: string;
  remetente: "escola" | "patrimonio";
  nomeRemetente: string;
  instituicao: string;
  mensagem: string;
  dataHora: string;
  lida: boolean;
  conversaId: string;
}

export interface InventarioItem {
  id: string;
  numeroPlaca: string;
  caracteristica: string;
  marcaModelo: string;
  numeroSerie: string;
  medidas: string;
  observacao: string;
  setor: string;
}

export interface SolicitacaoInventario {
  id: string;
  dataHora: string;
  escola: string;
  secretaria: string;
  setor?: string;
  solicitante: string;
  matricula: string;
  salaResponsavel?: string;
  assinatura?: string;
  ano: string;
  itens: InventarioItem[];
  status: "Pendente" | "Em Analise" | "Finalizado";
}

export interface InventarioSetorItem {
  codigo: string;
  descricao: string;
}

export interface SolicitacaoInventarioSetor {
  id: string;
  dataHora: string;
  secretaria: string;
  denominacao: string;
  endereco: string;
  salaResponsavel?: string;
  respNome: string;
  respCPF: string;
  respMatricula: string;
  agenteNome: string;
  agenteCPF: string;
  agenteMatricula: string;
  itens: InventarioSetorItem[];
  status: "Pendente" | "Em Analise" | "Finalizado";
}

// ============ HELPERS DE CONVERSÃO ============

// Converte dados do banco (snake_case) para a interface do app (camelCase)
function dbToSolicitacao(row: Record<string, unknown>): Solicitacao {
  const dados = (row.dados as Record<string, unknown>) || {};
  return {
    id: row.id as string,
    numeroSolicitacao: row.numero_solicitacao as string,
    tipo: row.tipo as Solicitacao["tipo"],
    dataHora: row.data_hora as string,
    nome: row.nome as string,
    matricula: row.matricula as string,
    instituicao: row.instituicao as string,
    dados,
    uniformes: row.uniformes as number | undefined,
    calcados: row.calcados as number | undefined,
    kitsAluno: row.kits_aluno as number | undefined,
    polosProf: row.polos_prof as number | undefined,
    mochilas: row.mochilas as number | undefined,
    uniformesDetalhes: row.uniformes_detalhes as ItemDetalhado[] | undefined,
    calcadosDetalhes: row.calcados_detalhes as ItemDetalhado[] | undefined,
    kitsAlunoDetalhes: row.kits_aluno_detalhes as ItemDetalhado[] | undefined,
    polosProfDetalhes: row.polos_prof_detalhes as ItemDetalhado[] | undefined,
    mochilasDetalhes: row.mochilas_detalhes as ItemDetalhado[] | undefined,
    itens: row.itens as Solicitacao["itens"],
    // Os dados de almoxarifado sao salvos dentro de `dados` pela pagina de solicitacao.
    // Hidratamos os campos de topo a partir de `dados` (com fallback para colunas dedicadas)
    // para que o painel admin exiba papelaria, cozinha e creche de forma consistente.
    papelaria: (row.papelaria as ItemDetalhado[] | undefined) ?? (dados.papelaria as ItemDetalhado[] | undefined),
    cozinha: (row.cozinha as ItemDetalhado[] | undefined) ?? (dados.cozinha as ItemDetalhado[] | undefined),
    creche: (row.creche as ItemDetalhado[] | undefined) ?? (dados.creche as ItemDetalhado[] | undefined),
    unidadeOrigem: row.unidade_origem as string | undefined,
    unidadeDestino: row.unidade_destino as string | undefined,
    responsavelDestino: row.responsavel_destino as string | undefined,
    matriculaDestino: row.matricula_destino as string | undefined,
    numeroPatrimonio: row.numero_patrimonio as string | undefined,
    descricaoItem: row.descricao_item as string | undefined,
    tmbpPms: row.tmbp_pms as string | undefined,
    situacao: row.situacao as string | undefined,
    condicao: row.condicao as string | undefined,
    itensTransferencia: row.itens_transferencia as Solicitacao["itensTransferencia"],
    arquivoLaudo: row.arquivo_laudo as string | null | undefined,
    status: row.status as Solicitacao["status"],
    responsavel: row.responsavel as string | undefined,
    encaminhadoLogistica: row.encaminhado_logistica as boolean | undefined,
    statusLogistica: row.status_logistica as Solicitacao["statusLogistica"],
    quantidadeLogistica: row.quantidade_logistica as number | undefined,
    observacaoLogistica: row.observacao_logistica as string | undefined,
    enviadoParaRomaneio: row.enviado_para_romaneio as boolean | undefined,
    entregaRegistrada: row.entrega_registrada as boolean | undefined,
    dataEntrega: row.data_entrega as string | undefined,
    comprovanteUrl: row.comprovante_url as string | undefined,
    comprovanteNome: row.comprovante_nome as string | undefined,
    romaneioGerado: row.romaneio_gerado as boolean | undefined,
    solicitacaoCancelamento: row.solicitacao_cancelamento as boolean | undefined,
    motivoCancelamento: row.motivo_cancelamento as string | undefined,
    dataCancelamento: row.data_cancelamento as string | undefined,
    statusCancelamento: row.status_cancelamento as Solicitacao["statusCancelamento"],
  };
}

// Converte dados do app (camelCase) para o banco (snake_case)
function solicitacaoToDb(sol: Partial<Solicitacao>): Record<string, unknown> {
  const db: Record<string, unknown> = {};
  if (sol.numeroSolicitacao !== undefined) db.numero_solicitacao = sol.numeroSolicitacao;
  if (sol.tipo !== undefined) db.tipo = sol.tipo;
  if (sol.dataHora !== undefined) db.data_hora = sol.dataHora;
  if (sol.nome !== undefined) db.nome = sol.nome;
  if (sol.matricula !== undefined) db.matricula = sol.matricula;
  if (sol.instituicao !== undefined) db.instituicao = sol.instituicao;
  if (sol.dados !== undefined) db.dados = sol.dados;
  if (sol.uniformes !== undefined) db.uniformes = sol.uniformes;
  if (sol.calcados !== undefined) db.calcados = sol.calcados;
  if (sol.kitsAluno !== undefined) db.kits_aluno = sol.kitsAluno;
  if (sol.polosProf !== undefined) db.polos_prof = sol.polosProf;
  if (sol.mochilas !== undefined) db.mochilas = sol.mochilas;
  if (sol.uniformesDetalhes !== undefined) db.uniformes_detalhes = sol.uniformesDetalhes;
  if (sol.calcadosDetalhes !== undefined) db.calcados_detalhes = sol.calcadosDetalhes;
  if (sol.kitsAlunoDetalhes !== undefined) db.kits_aluno_detalhes = sol.kitsAlunoDetalhes;
  if (sol.polosProfDetalhes !== undefined) db.polos_prof_detalhes = sol.polosProfDetalhes;
  if (sol.mochilasDetalhes !== undefined) db.mochilas_detalhes = sol.mochilasDetalhes;
  if (sol.itens !== undefined) db.itens = sol.itens;
  if (sol.papelaria !== undefined) db.papelaria = sol.papelaria;
  if (sol.cozinha !== undefined) db.cozinha = sol.cozinha;
  if (sol.unidadeOrigem !== undefined) db.unidade_origem = sol.unidadeOrigem;
  if (sol.unidadeDestino !== undefined) db.unidade_destino = sol.unidadeDestino;
  if (sol.responsavelDestino !== undefined) db.responsavel_destino = sol.responsavelDestino;
  if (sol.matriculaDestino !== undefined) db.matricula_destino = sol.matriculaDestino;
  if (sol.numeroPatrimonio !== undefined) db.numero_patrimonio = sol.numeroPatrimonio;
  if (sol.descricaoItem !== undefined) db.descricao_item = sol.descricaoItem;
  if (sol.tmbpPms !== undefined) db.tmbp_pms = sol.tmbpPms;
  if (sol.situacao !== undefined) db.situacao = sol.situacao;
  if (sol.condicao !== undefined) db.condicao = sol.condicao;
  if (sol.itensTransferencia !== undefined) db.itens_transferencia = sol.itensTransferencia;
  if (sol.arquivoLaudo !== undefined) db.arquivo_laudo = sol.arquivoLaudo;
  if (sol.status !== undefined) db.status = sol.status;
  if (sol.responsavel !== undefined) db.responsavel = sol.responsavel;
  if (sol.encaminhadoLogistica !== undefined) db.encaminhado_logistica = sol.encaminhadoLogistica;
  if (sol.statusLogistica !== undefined) db.status_logistica = sol.statusLogistica;
  if (sol.quantidadeLogistica !== undefined) db.quantidade_logistica = sol.quantidadeLogistica;
  if (sol.observacaoLogistica !== undefined) db.observacao_logistica = sol.observacaoLogistica;
  if (sol.enviadoParaRomaneio !== undefined) db.enviado_para_romaneio = sol.enviadoParaRomaneio;
  if (sol.entregaRegistrada !== undefined) db.entrega_registrada = sol.entregaRegistrada;
  if (sol.dataEntrega !== undefined) db.data_entrega = sol.dataEntrega;
  if (sol.comprovanteUrl !== undefined) db.comprovante_url = sol.comprovanteUrl;
  if (sol.comprovanteNome !== undefined) db.comprovante_nome = sol.comprovanteNome;
  if (sol.romaneioGerado !== undefined) db.romaneio_gerado = sol.romaneioGerado;
  if (sol.solicitacaoCancelamento !== undefined) db.solicitacao_cancelamento = sol.solicitacaoCancelamento;
  if (sol.motivoCancelamento !== undefined) db.motivo_cancelamento = sol.motivoCancelamento;
  if (sol.dataCancelamento !== undefined) db.data_cancelamento = sol.dataCancelamento;
  if (sol.statusCancelamento !== undefined) db.status_cancelamento = sol.statusCancelamento;
  return db;
}

function dbToChat(row: Record<string, unknown>): ChatMessage {
  return {
    id: row.id as string,
    remetente: row.remetente as ChatMessage["remetente"],
    nomeRemetente: row.nome_remetente as string,
    instituicao: row.instituicao as string,
    mensagem: row.mensagem as string,
    dataHora: row.data_hora as string,
    lida: row.lida as boolean,
    conversaId: row.conversa_id as string,
  };
}

function dbToInventario(row: Record<string, unknown>): SolicitacaoInventario {
  return {
    id: row.id as string,
    dataHora: row.data_hora as string,
    escola: row.escola as string,
    secretaria: row.secretaria as string,
    setor: row.setor as string | undefined,
    solicitante: row.solicitante as string,
    matricula: row.matricula as string,
    salaResponsavel: row.sala_responsavel as string | undefined,
    assinatura: row.assinatura as string | undefined,
    ano: row.ano as string,
    itens: (row.itens as InventarioItem[]) || [],
    status: row.status as SolicitacaoInventario["status"],
  };
}

function dbToInventarioSetor(row: Record<string, unknown>): SolicitacaoInventarioSetor {
  return {
    id: row.id as string,
    dataHora: row.data_hora as string,
    secretaria: row.secretaria as string,
    denominacao: row.denominacao as string,
    endereco: row.endereco as string,
    salaResponsavel: row.sala_responsavel as string | undefined,
    respNome: row.resp_nome as string,
    respCPF: row.resp_cpf as string,
    respMatricula: row.resp_matricula as string,
    agenteNome: row.agente_nome as string,
    agenteCPF: row.agente_cpf as string,
    agenteMatricula: row.agente_matricula as string,
    itens: (row.itens as InventarioSetorItem[]) || [],
    status: row.status as SolicitacaoInventarioSetor["status"],
  };
}

// ============ SOLICITAÇÕES ============

// Cache local para evitar refetch excessivo
let _solicitacoesCache: Solicitacao[] | null = null;
let _solicitacoesCacheTime = 0;
const CACHE_DURATION = 5000; // 5 segundos

function invalidarCacheSolicitacoes() {
  _solicitacoesCache = null;
  _solicitacoesCacheTime = 0;
}

export function getSolicitacoes(): Solicitacao[] {
  // Retorna cache se ainda válido (para uso síncrono imediato)
  if (_solicitacoesCache && (Date.now() - _solicitacoesCacheTime) < CACHE_DURATION) {
    return _solicitacoesCache;
  }
  // Retorna cache existente ou array vazio enquanto carrega
  return _solicitacoesCache || [];
}

// Versão assíncrona que busca do banco
export async function fetchSolicitacoes(): Promise<Solicitacao[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("solicitacoes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar solicitações:", error);
    return _solicitacoesCache || [];
  }

  const solicitacoes = (data || []).map(dbToSolicitacao);
  _solicitacoesCache = solicitacoes;
  _solicitacoesCacheTime = Date.now();
  return solicitacoes;
}

export async function addSolicitacao(
  solicitacao: Omit<Solicitacao, "id" | "dataHora" | "numeroSolicitacao">,
  numeroSolicitacao?: string
): Promise<Solicitacao> {
  const supabase = createClient();
  const numero = numeroSolicitacao || gerarNumeroSolicitacao();
  const dataHora = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const dbData = solicitacaoToDb({
    ...solicitacao,
    numeroSolicitacao: numero,
    dataHora,
    status: "Pendente",
  });

  const { data, error } = await supabase
    .from("solicitacoes")
    .insert([dbData])
    .select()
    .single();

  if (error) {
    console.error("Erro ao adicionar solicitação:", error);
    throw new Error(error.message);
  }

  const nova = dbToSolicitacao(data);
  invalidarCacheSolicitacoes();
  return nova;
}

export async function updateSolicitacao(id: string, updates: Partial<Solicitacao>): Promise<void> {
  const supabase = createClient();
  const dbUpdates = solicitacaoToDb(updates);

  const { error } = await supabase
    .from("solicitacoes")
    .update(dbUpdates)
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar solicitação:", error);
    throw new Error(error.message);
  }

  invalidarCacheSolicitacoes();
}

export async function getSolicitacaoPorNumero(numeroSolicitacao: string): Promise<Solicitacao | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("solicitacoes")
    .select("*")
    .ilike("numero_solicitacao", numeroSolicitacao)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Erro ao buscar solicitação:", error);
    return undefined;
  }

  return data ? dbToSolicitacao(data) : undefined;
}

export async function getSolicitacoesPorTipo(tipo: Solicitacao["tipo"]): Promise<Solicitacao[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("solicitacoes")
    .select("*")
    .eq("tipo", tipo)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar por tipo:", error);
    return [];
  }

  return (data || []).map(dbToSolicitacao);
}

export async function getSolicitacoesPorInstituicao(instituicao: string, ano?: string): Promise<Solicitacao[]> {
  const supabase = createClient();
  let query = supabase
    .from("solicitacoes")
    .select("*")
    .ilike("instituicao", `%${instituicao}%`)
    .order("created_at", { ascending: false });

  if (ano) {
    query = query.ilike("data_hora", `%${ano}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar por instituição:", error);
    return [];
  }

  return (data || []).map(dbToSolicitacao);
}

// ============ CHAT ============

let _chatCache: ChatMessage[] | null = null;
let _chatCacheTime = 0;

function invalidarCacheChat() {
  _chatCache = null;
  _chatCacheTime = 0;
}

export function getChatMessages(): ChatMessage[] {
  if (_chatCache && (Date.now() - _chatCacheTime) < CACHE_DURATION) {
    return _chatCache;
  }
  return _chatCache || [];
}

export async function fetchChatMessages(): Promise<ChatMessage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao buscar mensagens:", error);
    return _chatCache || [];
  }

  const messages = (data || []).map(dbToChat);
  _chatCache = messages;
  _chatCacheTime = Date.now();
  return messages;
}

export async function addChatMessage(mensagem: Omit<ChatMessage, "id" | "dataHora" | "lida">): Promise<ChatMessage> {
  const supabase = createClient();
  const dataHora = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const { data, error } = await supabase
    .from("chat_messages")
    .insert([{
      remetente: mensagem.remetente,
      nome_remetente: mensagem.nomeRemetente,
      instituicao: mensagem.instituicao,
      mensagem: mensagem.mensagem,
      data_hora: dataHora,
      lida: false,
      conversa_id: mensagem.conversaId,
    }])
    .select()
    .single();

  if (error) {
    console.error("Erro ao enviar mensagem:", error);
    throw new Error(error.message);
  }

  const nova = dbToChat(data);
  invalidarCacheChat();
  return nova;
}

export async function getChatPorInstituicao(instituicao: string): Promise<ChatMessage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .ilike("instituicao", instituicao)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao buscar chat:", error);
    return [];
  }

  return (data || []).map(dbToChat);
}

export async function marcarMensagensComoLidas(instituicao: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("chat_messages")
    .update({ lida: true })
    .ilike("instituicao", instituicao);

  if (error) {
    console.error("Erro ao marcar como lidas:", error);
  }
  invalidarCacheChat();
}

export async function getMensagensNaoLidas(): Promise<ChatMessage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("lida", false)
    .eq("remetente", "escola");

  if (error) {
    console.error("Erro ao buscar não lidas:", error);
    return [];
  }

  return (data || []).map(dbToChat);
}

export async function getConversasUnicas(): Promise<{ instituicao: string; ultimaMensagem: ChatMessage; naoLidas: number }[]> {
  const messages = await fetchChatMessages();
  const conversas: Record<string, { instituicao: string; ultimaMensagem: ChatMessage; naoLidas: number }> = {};

  messages.forEach((m) => {
    if (!conversas[m.instituicao]) {
      conversas[m.instituicao] = {
        instituicao: m.instituicao,
        ultimaMensagem: m,
        naoLidas: 0,
      };
    }
    conversas[m.instituicao].ultimaMensagem = m;
    if (!m.lida && m.remetente === "escola") {
      conversas[m.instituicao].naoLidas++;
    }
  });

  return Object.values(conversas).sort(
    (a, b) => new Date(b.ultimaMensagem.dataHora).getTime() - new Date(a.ultimaMensagem.dataHora).getTime()
  );
}

// ============ INVENTÁRIO ============

export async function getInventarios(): Promise<SolicitacaoInventario[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("inventarios")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar inventários:", error);
    return [];
  }

  return (data || []).map(dbToInventario);
}

export async function addInventario(inventario: Omit<SolicitacaoInventario, "id" | "dataHora" | "status">): Promise<SolicitacaoInventario> {
  const supabase = createClient();
  const dataHora = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const { data, error } = await supabase
    .from("inventarios")
    .insert([{
      data_hora: dataHora,
      escola: inventario.escola,
      secretaria: inventario.secretaria,
      setor: inventario.setor,
      solicitante: inventario.solicitante,
      matricula: inventario.matricula,
      sala_responsavel: inventario.salaResponsavel,
      assinatura: inventario.assinatura,
      ano: inventario.ano,
      itens: inventario.itens,
      status: "Pendente",
    }])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar inventário:", error);
    throw new Error(error.message);
  }

  return dbToInventario(data);
}

export async function updateInventario(id: string, updates: Partial<SolicitacaoInventario>): Promise<void> {
  const supabase = createClient();
  const dbUpdates: Record<string, unknown> = {};
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.itens !== undefined) dbUpdates.itens = updates.itens;
  if (updates.salaResponsavel !== undefined) dbUpdates.sala_responsavel = updates.salaResponsavel;

  const { error } = await supabase
    .from("inventarios")
    .update(dbUpdates)
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar inventário:", error);
  }
}

export async function getInventariosPorEscola(escola: string): Promise<SolicitacaoInventario[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("inventarios")
    .select("*")
    .ilike("escola", `%${escola}%`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar inventários por escola:", error);
    return [];
  }

  return (data || []).map(dbToInventario);
}

// ============ INVENTÁRIO POR SETOR ============

export async function getInventariosSetor(): Promise<SolicitacaoInventarioSetor[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("inventarios_setor")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar inventários setor:", error);
    return [];
  }

  return (data || []).map(dbToInventarioSetor);
}

export async function addInventarioSetor(
  inventario: Omit<SolicitacaoInventarioSetor, "id" | "dataHora" | "status">
): Promise<SolicitacaoInventarioSetor> {
  const supabase = createClient();
  const dataHora = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const { data, error } = await supabase
    .from("inventarios_setor")
    .insert([{
      data_hora: dataHora,
      secretaria: inventario.secretaria,
      denominacao: inventario.denominacao,
      endereco: inventario.endereco,
      sala_responsavel: inventario.salaResponsavel,
      resp_nome: inventario.respNome,
      resp_cpf: inventario.respCPF,
      resp_matricula: inventario.respMatricula,
      agente_nome: inventario.agenteNome,
      agente_cpf: inventario.agenteCPF,
      agente_matricula: inventario.agenteMatricula,
      itens: inventario.itens,
      status: "Pendente",
    }])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar inventário setor:", error);
    throw new Error(error.message);
  }

  return dbToInventarioSetor(data);
}

export async function updateInventarioSetor(id: string, updates: Partial<SolicitacaoInventarioSetor>): Promise<void> {
  const supabase = createClient();
  const dbUpdates: Record<string, unknown> = {};
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.itens !== undefined) dbUpdates.itens = updates.itens;

  const { error } = await supabase
    .from("inventarios_setor")
    .update(dbUpdates)
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar inventário setor:", error);
  }
}

// ============ RECIBOS ============
export interface Recibo {
  id: string;
  numeroRecibo: string;
  dataHora: string;
  solicitacaoId: string;
  numeroSolicitacao: string;
  tipoMaterial: "Patrimonio" | "Almoxarifado" | "Uniformes e Kits" | "Transferencia";
  instituicao: string;
  solicitante: string;
  observacao?: string;
  arquivoRecibo?: string;
  nomeArquivo?: string;
  criadoPor: string;
}

export function gerarNumeroRecibo(): string {
  const chars = "0123456789";
  let codigo = "";
  for (let i = 0; i < 8; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `REC-${codigo}`;
}

function dbToRecibo(row: Record<string, unknown>): Recibo {
  return {
    id: row.id as string,
    numeroRecibo: row.numero_recibo as string,
    dataHora: row.data_hora as string,
    solicitacaoId: row.solicitacao_id as string,
    numeroSolicitacao: row.numero_solicitacao as string,
    tipoMaterial: row.tipo_material as Recibo["tipoMaterial"],
    instituicao: row.instituicao as string,
    solicitante: row.solicitante as string,
    observacao: row.observacao as string | undefined,
    arquivoRecibo: row.arquivo_recibo as string | undefined,
    nomeArquivo: row.nome_arquivo as string | undefined,
    criadoPor: row.criado_por as string,
  };
}

export async function getRecibos(): Promise<Recibo[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recibos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar recibos:", error);
    return [];
  }

  return (data || []).map(dbToRecibo);
}

export async function addRecibo(recibo: Omit<Recibo, "id" | "numeroRecibo" | "dataHora">): Promise<Recibo> {
  const supabase = createClient();
  const dataHora = new Date().toLocaleString("pt-BR");
  const numeroRecibo = gerarNumeroRecibo();

  const { data, error } = await supabase
    .from("recibos")
    .insert([{
      numero_recibo: numeroRecibo,
      data_hora: dataHora,
      solicitacao_id: recibo.solicitacaoId,
      numero_solicitacao: recibo.numeroSolicitacao,
      tipo_material: recibo.tipoMaterial,
      instituicao: recibo.instituicao,
      solicitante: recibo.solicitante,
      observacao: recibo.observacao,
      arquivo_recibo: recibo.arquivoRecibo,
      nome_arquivo: recibo.nomeArquivo,
      criado_por: recibo.criadoPor,
    }])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar recibo:", error);
    throw new Error(error.message);
  }

  return dbToRecibo(data);
}

export async function getRecibosPorTipo(tipo: Recibo["tipoMaterial"]): Promise<Recibo[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recibos")
    .select("*")
    .eq("tipo_material", tipo)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar recibos por tipo:", error);
    return [];
  }

  return (data || []).map(dbToRecibo);
}

export async function getReciboPorSolicitacao(solicitacaoId: string): Promise<Recibo | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recibos")
    .select("*")
    .eq("solicitacao_id", solicitacaoId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Erro ao buscar recibo:", error);
    return undefined;
  }

  return data ? dbToRecibo(data) : undefined;
}

export async function deleteRecibo(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("recibos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir recibo:", error);
  }
}
