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
const dadosIniciais: Solicitacao[] = [
  {
    id: "1",
    numeroSolicitacao: "SOL-A1B2C3",
    tipo: "kits-uniformes",
    dataHora: "02/02/2026, 06:21:07",
    nome: "Krys Kelly Peregrino",
    matricula: "8021-1",
    instituicao: "Creche Municipal Leopoldina Gonçalves Lima",
    dados: {},
    uniformes: 1,
    calcados: 1,
    kitsAluno: 1,
    polosProf: 1,
    mochilas: 1,
    uniformesDetalhes: [{ tipo: "Creche", genero: "Masculino", tamanho: "4", quantidade: 1 }],
    calcadosDetalhes: [{ tamanho: "28", quantidade: 1 }],
    kitsAlunoDetalhes: [{ tipo: "Kit Creche", quantidade: 1 }],
    polosProfDetalhes: [{ tipo: "Kit Professor", tamanho: "M", quantidade: 1 }],
    mochilasDetalhes: [{ tipo: "Educacao Infantil", quantidade: 1 }],
    status: "Finalizado",
  },
  {
    id: "2",
    numeroSolicitacao: "SOL-D4E5F6",
    tipo: "kits-uniformes",
    dataHora: "01/02/2026, 16:49:31",
    nome: "RENATA MENEZES DA SILVA",
    matricula: "8037-1",
    instituicao: "CRECHE MUNICIPAL MARIA ROSA DOS SANTOS",
    dados: {},
    uniformes: 2,
    calcados: 2,
    kitsAluno: 1,
    polosProf: 3,
    mochilas: 1,
    uniformesDetalhes: [
      { tipo: "Creche", genero: "Feminino", tamanho: "2", quantidade: 1 },
      { tipo: "Pre", genero: "Masculino", tamanho: "6", quantidade: 1 },
    ],
    calcadosDetalhes: [
      { tamanho: "24", quantidade: 1 },
      { tamanho: "26", quantidade: 1 },
    ],
    kitsAlunoDetalhes: [{ tipo: "Kit Pre", quantidade: 1 }],
    polosProfDetalhes: [
      { tipo: "Kit Professor", tamanho: "P", quantidade: 1 },
      { tipo: "Kit Professor", tamanho: "G", quantidade: 2 },
    ],
    mochilasDetalhes: [{ tipo: "Educacao Infantil", quantidade: 1 }],
    status: "Pendente",
  },
  {
    id: "3",
    numeroSolicitacao: "SOL-G7H8I9",
    tipo: "kits-uniformes",
    dataHora: "31/01/2026, 16:41:34",
    nome: "Paula Roberta da Costa Riodades",
    matricula: "8245-1",
    instituicao: "C. M. Dolores Nunes das Flores",
    dados: {},
    uniformes: 4,
    calcados: 2,
    kitsAluno: 1,
    polosProf: 1,
    mochilas: 1,
    uniformesDetalhes: [
      { tipo: "1 ao 5", genero: "Masculino", tamanho: "8", quantidade: 2 },
      { tipo: "1 ao 5", genero: "Feminino", tamanho: "10", quantidade: 2 },
    ],
    calcadosDetalhes: [
      { tamanho: "32", quantidade: 1 },
      { tamanho: "34", quantidade: 1 },
    ],
    kitsAlunoDetalhes: [{ tipo: "Kit 3 ao 5", quantidade: 1 }],
    polosProfDetalhes: [{ tipo: "Kit Professor", tamanho: "GG", quantidade: 1 }],
    mochilasDetalhes: [{ tipo: "Fundamental", quantidade: 1 }],
    status: "Processamento",
  },
  {
    id: "4",
    numeroSolicitacao: "SOL-J0K1L2",
    tipo: "kits-uniformes",
    dataHora: "30/01/2026, 21:49:04",
    nome: "teste-7",
    matricula: "10000",
    instituicao: "101010",
    dados: {},
    uniformes: 1,
    calcados: 1,
    kitsAluno: 1,
    polosProf: 1,
    mochilas: 1,
    status: "Pendente",
  },
  {
    id: "5",
    numeroSolicitacao: "SOL-M3N4O5",
    tipo: "kits-uniformes",
    dataHora: "30/01/2026, 21:32:52",
    nome: "Mariana dos Santos Silva Brandão",
    matricula: "71935-1",
    instituicao: "Escola Municipal Lúcio Nunes",
    dados: {},
    uniformes: 6,
    calcados: 4,
    kitsAluno: 1,
    polosProf: 1,
    mochilas: 1,
    uniformesDetalhes: [
      { tipo: "6 ao 9", genero: "Masculino", tamanho: "12", quantidade: 3 },
      { tipo: "6 ao 9", genero: "Feminino", tamanho: "14", quantidade: 3 },
    ],
    calcadosDetalhes: [
      { tamanho: "36", quantidade: 2 },
      { tamanho: "38", quantidade: 2 },
    ],
    kitsAlunoDetalhes: [{ tipo: "Kit 6 ao 9", quantidade: 1 }],
    polosProfDetalhes: [{ tipo: "Kit Professor", tamanho: "M", quantidade: 1 }],
    mochilasDetalhes: [{ tipo: "Fundamental", quantidade: 1 }],
    status: "Finalizado",
  },
  {
    id: "6",
    numeroSolicitacao: "SOL-P6Q7R8",
    tipo: "kits-uniformes",
    dataHora: "30/01/2026, 15:59:32",
    nome: "Jaquelina de Souza Machado",
    matricula: "57568",
    instituicao: "Creche Municipal Professora Maria Martins Santos",
    dados: {},
    uniformes: 3,
    calcados: 4,
    kitsAluno: 1,
    polosProf: 5,
    mochilas: 1,
    status: "Processamento",
  },
  {
    id: "7",
    numeroSolicitacao: "SOL-S9T0U1",
    tipo: "patrimonio",
    dataHora: "02/02/2026, 10:30:15",
    nome: "Maria Silva",
    matricula: "12345",
    instituicao: "Escola Municipal Lúcio Nunes",
    dados: {},
    itens: [{ tipo: "Mesa Escolar", quantidade: 10 }],
    status: "Finalizado",
  },
  {
    id: "8",
    numeroSolicitacao: "SOL-V2W3X4",
    tipo: "patrimonio",
    dataHora: "28/01/2026, 14:22:08",
    nome: "João Santos",
    matricula: "12346",
    instituicao: "Escola Municipal Lúcio Nunes",
    dados: {},
    itens: [{ tipo: "Cadeira Escolar", quantidade: 20 }],
    status: "Processamento",
  },
  {
    id: "9",
    numeroSolicitacao: "SOL-Y5Z6A7",
    tipo: "patrimonio",
    dataHora: "25/01/2026, 09:15:42",
    nome: "Ana Costa",
    matricula: "12347",
    instituicao: "C. M. Dolores Nunes das Flores",
    dados: {},
    itens: [{ tipo: "Armário", quantidade: 5 }],
    status: "Pendente",
  },
];

const chatInicial: ChatMessage[] = [
  {
    id: "1",
    remetente: "escola",
    nomeRemetente: "Maria Silva",
    instituicao: "Escola Municipal Lúcio Nunes",
    mensagem: "Bom dia! Gostaria de saber quando os uniformes solicitados serão entregues?",
    dataHora: "02/02/2026, 08:30:00",
    lida: true,
    conversaId: "conv1",
  },
  {
    id: "2",
    remetente: "patrimonio",
    nomeRemetente: "Equipe Patrimônio",
    instituicao: "Escola Municipal Lúcio Nunes",
    mensagem: "Bom dia, Maria! A previsão de entrega é para a próxima semana. Assim que tivermos a data exata, entraremos em contato.",
    dataHora: "02/02/2026, 09:15:00",
    lida: true,
    conversaId: "conv1",
  },
];

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
