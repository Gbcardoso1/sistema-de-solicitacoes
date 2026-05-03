// Store para gerenciar solicitações
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

const STORAGE_KEY = "inove_saqua_solicitacoes";
const CHAT_STORAGE_KEY = "inove_saqua_chat";
const INVENTARIO_STORAGE_KEY = "inove_saqua_inventario";
const INVENTARIO_SETOR_STORAGE_KEY = "inove_saqua_inventario_setor";

// Cache em memoria para evitar parsing JSON repetido
let _solicitacoesCache: Solicitacao[] | null = null;
let _solicitacoesCacheTime = 0;
let _chatCache: ChatMessage[] | null = null;
let _chatCacheTime = 0;
const CACHE_DURATION = 3000; // 3 segundos

function invalidarCacheSolicitacoes() {
  _solicitacoesCache = null;
  _solicitacoesCacheTime = 0;
}

function invalidarCacheChat() {
  _chatCache = null;
  _chatCacheTime = 0;
}

// Dados iniciais de demonstração
const dadosIniciais: Solicitacao[] = [];

const chatInicial: ChatMessage[] = [];

export function getSolicitacoes(): Solicitacao[] {
  if (typeof window === "undefined") return dadosIniciais;

  const now = Date.now();
  if (_solicitacoesCache && (now - _solicitacoesCacheTime) < CACHE_DURATION) {
    return _solicitacoesCache;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosIniciais));
    _solicitacoesCache = dadosIniciais;
    _solicitacoesCacheTime = now;
    return dadosIniciais;
  }
  
  const parsed = JSON.parse(stored);
  _solicitacoesCache = parsed;
  _solicitacoesCacheTime = now;
  return parsed;
}

export function addSolicitacao(solicitacao: Omit<Solicitacao, "id" | "dataHora" | "numeroSolicitacao">, numeroSolicitacao?: string): Solicitacao {
  const solicitacoes = getSolicitacoes();
  const novaSolicitacao: Solicitacao = {
    ...solicitacao,
    id: Date.now().toString(),
    numeroSolicitacao: numeroSolicitacao || gerarNumeroSolicitacao(),
    dataHora: new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    status: "Pendente",
  };
  solicitacoes.unshift(novaSolicitacao);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitacoes));
  invalidarCacheSolicitacoes();
  return novaSolicitacao;
}

export function getSolicitacaoPorNumero(numeroSolicitacao: string): Solicitacao | undefined {
  const solicitacoes = getSolicitacoes();
  return solicitacoes.find((s) => s.numeroSolicitacao?.toLowerCase() === numeroSolicitacao.toLowerCase());
}

export function getSolicitacoesPorTipo(tipo: Solicitacao["tipo"]): Solicitacao[] {
  return getSolicitacoes().filter((s) => s.tipo === tipo);
}

export function getSolicitacoesPorInstituicao(instituicao: string, ano?: string): Solicitacao[] {
  return getSolicitacoes().filter((s) => {
    const matchInstituicao = s.instituicao.toLowerCase().includes(instituicao.toLowerCase());
    const matchAno = !ano || s.dataHora.includes(ano);
    return matchInstituicao && matchAno;
  });
}

// Funcoes de Chat
export function getChatMessages(): ChatMessage[] {
  if (typeof window === "undefined") return chatInicial;

  const now = Date.now();
  if (_chatCache && (now - _chatCacheTime) < CACHE_DURATION) {
    return _chatCache;
  }

  const stored = localStorage.getItem(CHAT_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatInicial));
    _chatCache = chatInicial;
    _chatCacheTime = now;
    return chatInicial;
  }
  
  const parsed = JSON.parse(stored);
  _chatCache = parsed;
  _chatCacheTime = now;
  return parsed;
}

export function addChatMessage(mensagem: Omit<ChatMessage, "id" | "dataHora" | "lida">): ChatMessage {
  const messages = getChatMessages();
  const novaMensagem: ChatMessage = {
    ...mensagem,
    id: Date.now().toString(),
    dataHora: new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    lida: false,
  };
  messages.push(novaMensagem);
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  invalidarCacheChat();
  return novaMensagem;
}

export function getChatPorInstituicao(instituicao: string): ChatMessage[] {
  return getChatMessages().filter(
    (m) => m.instituicao.toLowerCase() === instituicao.toLowerCase()
  );
}

export function marcarMensagensComoLidas(instituicao: string): void {
  const messages = getChatMessages();
  const updated = messages.map((m) =>
    m.instituicao.toLowerCase() === instituicao.toLowerCase() ? { ...m, lida: true } : m
  );
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
  invalidarCacheChat();
}

export function getMensagensNaoLidas(): ChatMessage[] {
  return getChatMessages().filter((m) => !m.lida && m.remetente === "escola");
}

export function getConversasUnicas(): { instituicao: string; ultimaMensagem: ChatMessage; naoLidas: number }[] {
  const messages = getChatMessages();
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

// Funcoes de Inventario
export function getInventarios(): SolicitacaoInventario[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(INVENTARIO_STORAGE_KEY);
  if (!stored) {
    return [];
  }
  return JSON.parse(stored);
}

export function addInventario(inventario: Omit<SolicitacaoInventario, "id" | "dataHora" | "status">): SolicitacaoInventario {
  const inventarios = getInventarios();
  const novoInventario: SolicitacaoInventario = {
    ...inventario,
    id: Date.now().toString(),
    dataHora: new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    status: "Pendente",
  };
  inventarios.unshift(novoInventario);
  localStorage.setItem(INVENTARIO_STORAGE_KEY, JSON.stringify(inventarios));
  return novoInventario;
}

export function updateInventario(id: string, updates: Partial<SolicitacaoInventario>): void {
  const inventarios = getInventarios();
  const index = inventarios.findIndex((i) => i.id === id);
  if (index !== -1) {
    inventarios[index] = { ...inventarios[index], ...updates };
    localStorage.setItem(INVENTARIO_STORAGE_KEY, JSON.stringify(inventarios));
  }
}

export function getInventariosPorEscola(escola: string): SolicitacaoInventario[] {
  return getInventarios().filter((i) => i.escola.toLowerCase().includes(escola.toLowerCase()));
}

// ============ INVENTARIO POR SETOR ============
export function getInventariosSetor(): SolicitacaoInventarioSetor[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(INVENTARIO_SETOR_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addInventarioSetor(
  inventario: Omit<SolicitacaoInventarioSetor, "id" | "dataHora" | "status">
): SolicitacaoInventarioSetor {
  const inventarios = getInventariosSetor();
  const novo: SolicitacaoInventarioSetor = {
    ...inventario,
    id: Date.now().toString(),
    dataHora: new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    status: "Pendente",
  };
  inventarios.unshift(novo);
  localStorage.setItem(INVENTARIO_SETOR_STORAGE_KEY, JSON.stringify(inventarios));
  return novo;
}

export function updateInventarioSetor(id: string, updates: Partial<SolicitacaoInventarioSetor>): void {
  const inventarios = getInventariosSetor();
  const index = inventarios.findIndex((i) => i.id === id);
  if (index !== -1) {
    inventarios[index] = { ...inventarios[index], ...updates };
    localStorage.setItem(INVENTARIO_SETOR_STORAGE_KEY, JSON.stringify(inventarios));
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
  arquivoRecibo?: string; // base64 ou URL do arquivo anexado
  nomeArquivo?: string;
  criadoPor: string; // nome do usuario que criou
}

const RECIBOS_STORAGE_KEY = "recibos";

export function gerarNumeroRecibo(): string {
  const chars = "0123456789";
  let codigo = "";
  for (let i = 0; i < 8; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `REC-${codigo}`;
}

export function getRecibos(): Recibo[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(RECIBOS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addRecibo(recibo: Omit<Recibo, "id" | "numeroRecibo" | "dataHora">): Recibo {
  const recibos = getRecibos();
  const novoRecibo: Recibo = {
    ...recibo,
    id: String(Date.now()),
    numeroRecibo: gerarNumeroRecibo(),
    dataHora: new Date().toLocaleString("pt-BR"),
  };
  recibos.unshift(novoRecibo);
  localStorage.setItem(RECIBOS_STORAGE_KEY, JSON.stringify(recibos));
  return novoRecibo;
}

export function getRecibosPorTipo(tipo: Recibo["tipoMaterial"]): Recibo[] {
  return getRecibos().filter((r) => r.tipoMaterial === tipo);
}

export function getReciboPorSolicitacao(solicitacaoId: string): Recibo | undefined {
  return getRecibos().find((r) => r.solicitacaoId === solicitacaoId);
}

export function deleteRecibo(id: string): void {
  const recibos = getRecibos().filter((r) => r.id !== id);
  localStorage.setItem(RECIBOS_STORAGE_KEY, JSON.stringify(recibos));
}
