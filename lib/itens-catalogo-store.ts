// Store central de itens - fonte unica de verdade para todos os formularios
export interface ItemCatalogo {
  id: string
  nome: string
  categoria: string
  ativo: boolean
  estoque: number
  estoqueMinimo: number
  ultimaAtualizacao: string
  localizacao?: string // Ex: "Prateleira A1", "Setor 3", "Galpao B - Corredor 2"
  unidade?: string // Ex: "unidade", "caixa", "kit", "pacote", "litro", "kg"
}

// Registro de recebimento de materiais
export interface RecebimentoMaterial {
  id: string
  itemId: string
  nomeItem: string
  categoria: string
  quantidade: number
  fornecedor: string
  notaFiscal: string
  dataRecebimento: string
  responsavel: string
  observacao: string
  localizacaoDestino: string
  galpao: string
}

// Registro de baixa por avaria/estrago
export interface BaixaAvaria {
  id: string
  itemId: string
  nomeItem: string
  categoria: string
  quantidade: number
  motivo: string
  responsavel: string
  dataBaixa: string
  observacao: string
}

// Registro de saida de material (gera romaneio)
export interface SaidaMaterial {
  id: string
  itemId: string
  nomeItem: string
  categoria: string
  quantidade: number
  instituicao: string
  responsavel: string
  dataSaida: string
  romaneioGerado: boolean
  romaneioFinalizado?: boolean // Indica se o romaneio foi finalizado/concluido
  dataFinalizacao?: string // Data em que o romaneio foi finalizado
  pedidoVinculado?: string // ID do pedido/solicitacao vinculado
  solicitante?: string // Nome de quem solicitou o material
}

const RECEBIMENTOS_KEY = "inove_saqua_recebimentos"

export type CategoriaId =
  | "papelaria"
  | "cozinha"
  | "creche"
  | "patrimonio"
  | "uniforme"
  | "kitAluno"
  | "calcado"
  | "mochila"
  | "kitProfessor"
  | "tamanhosRoupas"
  | "tamanhosPolo"

export interface CategoriaInfo {
  id: CategoriaId
  label: string
  grupo: string
}

export const CATEGORIAS: CategoriaInfo[] = [
  { id: "papelaria", label: "Papelaria", grupo: "Almoxarifado" },
  { id: "cozinha", label: "Cozinha", grupo: "Almoxarifado" },
  { id: "creche", label: "Creche", grupo: "Almoxarifado" },
  { id: "patrimonio", label: "Patrimonio", grupo: "Patrimonio" },
  { id: "uniforme", label: "Tipos de Uniforme", grupo: "Uniformes" },
  { id: "tamanhosRoupas", label: "Tamanhos de Roupas", grupo: "Uniformes" },
  { id: "calcado", label: "Tamanhos de Calcados", grupo: "Uniformes" },
  { id: "kitAluno", label: "Kits de Aluno", grupo: "Kits" },
  { id: "mochila", label: "Tipos de Mochila", grupo: "Kits" },
  { id: "kitProfessor", label: "Kit Professor", grupo: "Kits" },
  { id: "tamanhosPolo", label: "Tamanhos de Polo", grupo: "Kits" },
]

const STORAGE_KEY = "inove_saqua_catalogo_itens"

// Cache em memoria para evitar recriacao constante
let _itensCache: ItemCatalogo[] | null = null
let _cacheTimestamp = 0
const CACHE_DURATION = 5000 // 5 segundos

function gerarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function criarItem(nome: string, categoria: string, estoque = 100, localizacao?: string): ItemCatalogo {
  return {
    id: gerarId(),
    nome,
    categoria,
    ativo: true,
    estoque,
    estoqueMinimo: 10,
    ultimaAtualizacao: new Date().toLocaleString("pt-BR"),
    localizacao: localizacao || "",
  }
}

// Dados iniciais - array estatico para evitar recriacao
const PAPELARIA_NOMES = ["COMPASSO (KIT ESCOLAR 2025)","CADERNO MEIA PAUTA 1/4 ESPIRAL","AGENDA CRECHE","CADERNO 10 MATERIAS PROFESSOR","CADERNO DE CALIGRAFIA GRAMPEADO 1/4","AGENDA PROFESSOR","CADERNO DESENHO ESPIRAL - 96 FLS","CADERNO DESENHO GRAMPEADO - 96 FLS","CADERNO 10 MATERIAS","AGENDA ALUNO","CADERNO BROCHURA COSTURADO - CAPA DURA 96 FLS","GABARITO GEOMETRICO UND.","CADERNO MEIA PAUTA ESPIRAL 1/4 - FUNDAMENTAL 1","CADERNO DESENHO GRAMPEADO - FUNDAMENTAL 1","CADERNO 10 MATERIAS EJA","CADERNO DESENHO GRAMPEADO - PRE ESCOLAR","CADERNO BROCHURA COSTURADO PRE ESCOLAR","CADERNO BROCHURA COSTURADO FUNDAMENTAL 1","CANECA BRANCA PROFESSOR","FITA PP TRANSPARENTE 45MM X 30MT","FITA DUREX 12MM X 40MT","FITA PP TRANSPARENTE 18MM X 50MT","FITA CREPE 18MM X 10MT","FITA DUPLA FACE 12MM X 10MT","PAPEL CELOFANE - INCOLOR","EVA GLITTER - ROSA - 5 FLS","EVA GLITTER - PRETO - 5 FLS","EVA GLITTER - PRATA - 5 FLS","EVA GLITTER - LARANJA - 5 FLS","EVA GLITTER - AZUL ROYAL - 5 FLS","EVA GLITTER - VERDE - 5 FLS","EVA GLITTER - OURO - 5 FLS","EVA GLITTER - VERMELHO - 5 FLS","EVA GLITTER - LILAS - 5 FLS","MARCA TEXTO AZUL CX/C 12 UND.","MARCA TEXTO VERDE CX/C 12 UND.","MARCA TEXTO ROSA CX/C 12 UND.","MARCA TEXTO SLIM - AMARELO - 12 UND.","MARCA-TEXTO FLUORESCENTE - LARANJA - 12 UND.","BLOCO ADESIVO COLORIDO NEON 38MM X 50MM","BLOCO ADESIVO 76 MM X 76MM - C/ 100 FLS","CORRETIVO FITA 5MMX6M UND.","CORRETIVO LIQUIDO 18 ML UND.","ESTOJO ESCOLAR - 2025","GRAMPO TRILHO P/ PASTA 300MM X 9 MM X 112 MM","REGUA (KIT ESCOLAR) UND.","REGUA CRISTAL 30CM","COLA BRANCA 90G UND.","COLA BRANCA 1 KG UND.","COLA ARTE TRANSPARENTE 90G UND.","COLA EM BASTAO - 10G - 12 UND.","COLA COLORIDA BRILHO - 6 CORES 25G","COLA COLORIDA PACOTE COM 6 CORES DE 25G","LAPIS PRETO HB N 2 - CX /C 144UND.","LAPIS PRETO HB N 2 - 10 UND.","LAPIS DE COR CAIXA COM 12 CORES ECO - SEXTAVADO","PAPEL CHAMEX A4 210X297MM COM 500 FOLHAS","PAPEL CHAMEX A3 297MMX420MM COM 500 FOLHAS","PAPEL CHAMEX OFICIO 216X330MM COM 500 FOLHAS","BORRACHA"]

const COZINHA_NOMES = ["ACENDEDOR DE FOGAO","ASSADEIRA - Retangular 29cm x 40cm inox 4mm","ASSADEIRA - Retangular 29cm x 42cm inox 4,5mm","BACIA PLASTICA - 15L","BACIA PLASTICA - 35L","BACIA PLASTICA - 40L","BANDEJA - Retangular 36x27 inox 2cm altura","BATEDOR DE CLARA - Silicone cabo inox 30cm","BOWL DE INOX - Com tampa 1,6L","BOWL DE INOX - Com tampa 2,5L","BOWL DE INOX - Com tampa 3,5L","BOWL DE INOX - Com tampa 6L 30cm","CANECA - Plastico 250ml","LEITERA/CANECAO - Industrial aluminio n18 hotel 4,0L","COLHER PARA ARROZ - Corpo polietileno cabo inox 50cm","COLHER DE MESA - Aco inoxidavel 18,0 cm","COLHER SILICONE - Nylon 180C 34cm","CONCHA GRANDE - Aco inoxidavel 50cm","CONCHA MEDIA - Aco inoxidavel 50cm","CONCHA PEQUENA - Aco inoxidavel 50cm","DESCASCADOR DE LEGUMES - Inox 150mm x 30mm","ESCORREDOR DE ARROZ - Aco inoxidavel 50cm","ESPUMADEIRA GRANDE - Aluminio fundido 50cm","ESPUMADEIRA MEDIA - Aluminio fundido 38cm","FACA DE MESA - Aco inoxidavel 23,6cm","FACA - Aco inox n 06","FACA - Aco inox n 08 cabo 10cm lamina 17cm","FACA - Aco inox n 10 cabo 15cm lamina 22cm","FRIGIDEIRA - Antiaderente aluminio 32cm","FRIGIDEIRA - Antiaderente aluminio 40cm","GARFO DE MESA - Aco inox 19cm","JARRA","LIXEIRA PLASTICA - 100L com pedal","LIXEIRA INOX - 50L","PANELA - Cacarola profissional aluminio 32cm com tampa","PANELA - Cacarola profissional aluminio N 36 com tampa","PANELA - Cacarola profissional aluminio N 40 25cm com tampa","PANELA DE PRESSAO - Aluminio 13L","PANELA DE PRESSAO - Aluminio 20L","PANELA DE PRESSAO - Aluminio 24L","PEGADOR DE MACARRAO - Aco inoxidavel 28cm","PENEIRA - Aco inoxidavel 25cm","PRATO - Prato fundo vidro 22cm diamante","RALADOR - 4 faces aco inox 21cm","TABUA PARA CORTE - Polietileno 50cm x 30cm","POTE PLASTICO - Polipropileno 3,80L BPA FREE","PRATO INFANTIL DE PLASTICO - Polipropileno 600ML BPA FREE","GARRAFA TERMICA"]

const PATRIMONIO_NOMES = ["AR-CONDICIONADO 9.000BTUS (AGRATTO)","AR-CONDICIONADO 9.000BTUS (VIX)","AR-CONDICIONADO 12.000BTUS (VIX)","AR-CONDICIONADO 12.000BTUS (AGRATTO)","AR-CONDICIONADO 12.000BTUS (PHILCO)","AR-CONDICIONADO 18.000BTUS (VIX)","AR-CONDICIONADO 18.000BTUS (AGRATTO)","AR-CONDICIONADO 22.000BTUS (MIDEA)","AR-CONDICIONADO 24.000BTUS (VIX)","AR-CONDICIONADO 24.000BTUS (AGRATTO)","AR-CONDICIONADO 30.000BTUS (VIX)","AR-CONDICIONADO 30.000BTUS (AGRATTO)","AR-CONDICIONADO 36.000BTUS (AGRATTO)","AR-CONDICIONADO 60.000BTUS (ELGIN)","ARMARIO A402","ARMARIO ROUPEIRO 4 PORTAS","ARMARIO ALTO 2 PORTAS","ARMARIO BAIXO 2 PORTAS","ARMARIO DE ACO 2 PORTAS","ARQUIVO DE ACO PARA PASTA SUSPENSA - 4 GAVETAS","BALANCA DIGITAL - 40 KG","BATEDEIRA PLANETARIA 4L","BEBEDOURO ADULTO - INOX","BEBEDOURO CONJUGADO - INOX","BEBEDOURO GALAO","CADEIRA BRIZZA GIRATORIA","CADEIRA FIXA 4 PES","CADEIRA APROXIMACAO EMPILHAVEL","CADEIRA ESCOLAR INDIVIDUAL - CONJUNTO ALUNO","CADEIRA ESCOLAR INDIVIDUAL - CONJUNTO PROFESSOR","CADEIRA GIRATORIA ERGOPLAX","CADEIRA LONGARINA 3 LUGARES","CADEIRA PLASTICA INFANTIL BAMBINI","CADEIRA PRE ESCOLAR INDIVIDUAL","CAMA INFANTIL - 135 CM","CONJUNTO DE ALUNO JUVENIL","CONSERVADOR/FREEZER HORIZONTAL 2 PORTAS - 411L","CONSERVADOR/FREEZER VERTICAL 284L","ESCADA DE ALUMINIO - 5 DEGRAUS","ESCADA DE ALUMINIO - 8 DEGRAUS","ESPREMEDOR DE SUCO INDUSTRIAL","ESTANTE DE ACO COM 6 PRATELEIRAS","ESTANTE DUPLA PARA BIBLIOTECA","ESTANTE SIMPLES PARA BIBLIOTECA","FOGAO INDUSTRIAL - 4 QUEIMADORES","FOGAO INDUSTRIAL - 6 QUEIMADORES","FORNO ELETRICO INDUSTRIAL","FRIGOBAR 93 LITROS","GAVETEIRO VOLANTE - 3 GAVETAS","GELADEIRA DUAS PORTAS FROSTFREE - 472L","KIT MESA INFANTIL - CONJUNTO SEXTAVADO","LAVADOURA 15KG","LIQUIDIFICADOR 6 LTS","LIQUIDIFICADOR 10 LTS","MESA DE REFEITORIO ADULTO","MESA DE REUNIAO EXECUTIVA","MESA DE TRABALHO RETA - 120X60","MESA DE TRABALHO RETA - 150X60","MESA EM L","MESA ESCOLAR INDIVIDUAL - CONJUNTO ALUNO","MESA ESCOLAR INDIVIDUAL - CONJUNTO PROFESSOR"]

const CRECHE_NOMES = [
  "BANHEIRA PARA BEBE",
  "BEBE CONFORTO ATE 13 KG",
  "CAPA PARA BEBE CONFORTO 96CMX65CM",
  "COLCHONETE CASAL",
  "EDREDOM 1,80M X 2,40M",
  "LENCOL DE BERCO C/ ELASTICO LISO 70CM X 1.30M X 15CM UND.",
  "LENCOL DE CASAL C/ ELASTICO UND.",
  "LENCOL DE CASAL S/ ELASTICO UND.",
  "MANTA MICROFIBRA - 2,20 X 1,80 (BRANCO)",
  "MANTA MICROFIBRA - 2,20 X 1,80 (CINZA)",
  "TOALHA DE BANHO BRANCA UND.",
  "TOALHA DE BANHO C/ CAPUZ BRANCA 65CM X 80 CM UND.",
  "TOALHA DE ROSTO BRANCA UND.",
  "TOALHINHA LAVABO UND.",
]

const UNIFORMES_NOMES = ["Creche", "Pre", "1 ao 5", "6 ao 9", "EJA"]
const TAMANHOS_ROUPAS = ["6/12 meses", "1", "2", "3", "4", "6", "8", "9", "10", "12", "14", "16", "P", "M", "G", "GG", "XG"]
const TAMANHOS_CALCADOS = Array.from({ length: 28 }, (_, i) => String(18 + i))
const KITS_ALUNO = ["Kit Creche", "Kit Pre", "Kit 1 ao 2", "Kit 3 ao 5", "Kit 6 ao 9", "Kit EJA"]
const MOCHILAS = ["Fundamental", "Educacao Infantil"]
const KIT_PROF = ["Kit Professor"]
const TAMANHOS_POLO = ["P", "M", "G", "GG", "EXG"]

// Dados iniciais extraidos dos formularios existentes - cache lazy
let _dadosIniciaisCache: ItemCatalogo[] | null = null

function gerarDadosIniciais(): ItemCatalogo[] {
  if (_dadosIniciaisCache) return _dadosIniciaisCache
  
  const itens: ItemCatalogo[] = []

  // Papelaria - usando constantes pre-definidas
  PAPELARIA_NOMES.forEach((nome, i) => itens.push(criarItem(nome, "papelaria", 200, `Prateleira ${String.fromCharCode(65 + (i % 6))}${Math.floor(i / 6) + 1}`)))

  // Cozinha - usando constantes pre-definidas
  COZINHA_NOMES.forEach((nome, i) => itens.push(criarItem(nome, "cozinha", 100, `Galpao B - Corredor ${Math.floor(i / 10) + 1}`)))

  // Creche - usando constantes pre-definidas
  CRECHE_NOMES.forEach((nome, i) => itens.push(criarItem(nome, "creche", 50, `Galpao B - Creche ${Math.floor(i / 7) + 1}`)))

  // Patrimonio - usando constantes pre-definidas
  PATRIMONIO_NOMES.forEach((nome, i) => itens.push(criarItem(nome, "patrimonio", 50, `Setor ${Math.floor(i / 15) + 1} - Area ${String.fromCharCode(65 + (i % 4))}`)))

  // Tipos de uniforme - usando constantes pre-definidas
  UNIFORMES_NOMES.forEach(nome => itens.push(criarItem(nome, "uniforme", 500, "Galpao A - Uniformes")))

  // Tamanhos de roupas - usando constantes pre-definidas
  TAMANHOS_ROUPAS.forEach(nome => itens.push(criarItem(nome, "tamanhosRoupas", 300, "Galpao A - Roupas")))

  // Tamanhos de calcados - usando constantes pre-definidas
  TAMANHOS_CALCADOS.forEach(nome => itens.push(criarItem(nome, "calcado", 200, "Galpao A - Calcados")))

  // Kits de aluno - usando constantes pre-definidas
  KITS_ALUNO.forEach(nome => itens.push(criarItem(nome, "kitAluno", 300, "Galpao A - Kits")))

  // Mochilas - usando constantes pre-definidas
  MOCHILAS.forEach(nome => itens.push(criarItem(nome, "mochila", 400, "Galpao A - Mochilas")))

  // Kit professor - usando constantes pre-definidas
  KIT_PROF.forEach(nome => itens.push(criarItem(nome, "kitProfessor", 200, "Galpao A - Kits Prof")))

  // Tamanhos polo
  TAMANHOS_POLO.forEach(nome => itens.push(criarItem(nome, "tamanhosPolo", 200, "Galpao A - Polos")))

  // Cachear resultado
  _dadosIniciaisCache = itens
  return itens
}

// Obter todos os itens do store - com cache em memoria
export function getTodosItens(): ItemCatalogo[] {
  if (typeof window === "undefined") return gerarDadosIniciais()
  
  const now = Date.now()
  // Usar cache se ainda valido
  if (_itensCache && (now - _cacheTimestamp) < CACHE_DURATION) {
    return _itensCache
  }
  
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    const iniciais = gerarDadosIniciais()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(iniciais))
    _itensCache = iniciais
    _cacheTimestamp = now
    return iniciais
  }
  
  const parsed = JSON.parse(stored)
  _itensCache = parsed
  _cacheTimestamp = now
  return parsed
}

// Invalida o cache quando houver mudancas
function invalidarCache() {
  _itensCache = null
  _cacheTimestamp = 0
}

function salvar(itens: ItemCatalogo[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itens))
    invalidarCache()
  }
}

// Obter itens por categoria (todos, incluindo inativos)
export function getItensPorCategoria(categoria: string): ItemCatalogo[] {
  return getTodosItens().filter(i => i.categoria === categoria)
}

// Obter apenas itens ativos de uma categoria (para formularios)
export function getItensAtivos(categoria: string): ItemCatalogo[] {
  return getTodosItens().filter(i => i.categoria === categoria && i.ativo)
}

// Obter nomes dos itens ativos (para dropdowns nos formularios)
export function getNomesAtivos(categoria: string): string[] {
  return getItensAtivos(categoria).map(i => i.nome)
}

// Adicionar novo item
export function addItem(nome: string, categoria: string, estoque = 100, estoqueMinimo = 10, localizacao = ""): ItemCatalogo {
  const itens = getTodosItens()
  const novo: ItemCatalogo = {
    id: gerarId(),
    nome: nome.toUpperCase().trim(),
    categoria,
    ativo: true,
    estoque,
    estoqueMinimo,
    ultimaAtualizacao: new Date().toLocaleString("pt-BR"),
    localizacao,
  }
  itens.push(novo)
  salvar(itens)
  return novo
}

// Remover item (marca como inativo)
export function removeItem(id: string): void {
  const itens = getTodosItens().map(i =>
    i.id === id ? { ...i, ativo: false, ultimaAtualizacao: new Date().toLocaleString("pt-BR") } : i
  )
  salvar(itens)
}

// Reativar item
export function reativarItem(id: string): void {
  const itens = getTodosItens().map(i =>
    i.id === id ? { ...i, ativo: true, ultimaAtualizacao: new Date().toLocaleString("pt-BR") } : i
  )
  salvar(itens)
}

// Excluir item permanentemente
export function excluirItem(id: string): void {
  const itens = getTodosItens().filter(i => i.id !== id)
  salvar(itens)
}

// Atualizar item
export function updateItem(id: string, dados: Partial<Pick<ItemCatalogo, "nome" | "estoque" | "estoqueMinimo" | "localizacao">>): void {
  const itens = getTodosItens().map(i =>
    i.id === id ? { ...i, ...dados, ultimaAtualizacao: new Date().toLocaleString("pt-BR") } : i
  )
  salvar(itens)
}

// Dar baixa no estoque
export function darBaixaEstoque(id: string, quantidade: number): boolean {
  const itens = getTodosItens()
  const item = itens.find(i => i.id === id)
  if (!item || item.estoque < quantidade) return false
  const updated = itens.map(i =>
    i.id === id ? { ...i, estoque: i.estoque - quantidade, ultimaAtualizacao: new Date().toLocaleString("pt-BR") } : i
  )
  salvar(updated)
  return true
}

// Adicionar estoque
export function adicionarEstoque(id: string, quantidade: number): void {
  const itens = getTodosItens().map(i =>
    i.id === id ? { ...i, estoque: i.estoque + quantidade, ultimaAtualizacao: new Date().toLocaleString("pt-BR") } : i
  )
  salvar(itens)
}

// Obter itens com estoque baixo
export function getItensEstoqueBaixo(): ItemCatalogo[] {
  return getTodosItens().filter(i => i.ativo && i.estoque <= i.estoqueMinimo)
}

// ========== RECEBIMENTOS DE MATERIAIS ==========
const recebimentosIniciais: RecebimentoMaterial[] = [
  {
    id: "rec-1",
    itemId: "",
    nomeItem: "CADERNO 10 MATERIAS",
    categoria: "papelaria",
    quantidade: 500,
    fornecedor: "Distribuidora ABC",
    notaFiscal: "NF-2026-001234",
    dataRecebimento: "28/02/2026, 10:30:00",
    responsavel: "Carlos Silva",
    observacao: "Entrega parcial - restam 200 unidades",
    localizacaoDestino: "Prateleira A2",
    galpao: "Galpao A",
  },
  {
    id: "rec-2",
    itemId: "",
    nomeItem: "Uniforme Creche",
    categoria: "uniforme",
    quantidade: 300,
    fornecedor: "Textil Saquarema",
    notaFiscal: "NF-2026-005678",
    dataRecebimento: "01/03/2026, 14:15:00",
    responsavel: "Ana Santos",
    observacao: "Lote completo recebido",
    localizacaoDestino: "Galpao A - Uniformes",
    galpao: "Galpao A",
  },
  {
    id: "rec-3",
    itemId: "",
    nomeItem: "MESA ESCOLAR INDIVIDUAL",
    categoria: "patrimonio",
    quantidade: 50,
    fornecedor: "Moveis Escolares Ltda",
    notaFiscal: "NF-2026-009012",
    dataRecebimento: "03/03/2026, 09:00:00",
    responsavel: "Roberto Lima",
    observacao: "Conferido - todas em bom estado",
    localizacaoDestino: "Setor 2 - Area B",
    galpao: "Galpao B",
  },
]

const BAIXAS_KEY = "inove_saqua_baixas_avarias"

const baixasIniciais: BaixaAvaria[] = [
  {
    id: "bx-1",
    itemId: "",
    nomeItem: "CADERNO DESENHO ESPIRAL - 96 FLS",
    categoria: "papelaria",
    quantidade: 15,
    motivo: "Dano por umidade",
    responsavel: "Carlos Silva",
    dataBaixa: "25/02/2026, 11:00:00",
    observacao: "Cadernos molhados por infiltracao no galpao",
  },
  {
    id: "bx-2",
    itemId: "",
    nomeItem: "CANECA - Plastico 250ml",
    categoria: "cozinha",
    quantidade: 30,
    motivo: "Quebra durante transporte",
    responsavel: "Ana Santos",
    dataBaixa: "01/03/2026, 16:30:00",
    observacao: "Canecas quebraram na entrega",
  },
]

export function getRecebimentos(): RecebimentoMaterial[] {
  if (typeof window === "undefined") return recebimentosIniciais
  const stored = localStorage.getItem(RECEBIMENTOS_KEY)
  if (!stored) {
    localStorage.setItem(RECEBIMENTOS_KEY, JSON.stringify(recebimentosIniciais))
    return recebimentosIniciais
  }
  return JSON.parse(stored)
}

export function addRecebimento(recebimento: Omit<RecebimentoMaterial, "id" | "dataRecebimento">): RecebimentoMaterial {
  const recebimentos = getRecebimentos()
  const novo: RecebimentoMaterial = {
    ...recebimento,
    id: `rec-${Date.now()}`,
    dataRecebimento: new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  }
  recebimentos.unshift(novo)
  if (typeof window !== "undefined") {
    localStorage.setItem(RECEBIMENTOS_KEY, JSON.stringify(recebimentos))
  }

  // Se tem itemId valido (item existente), adiciona ao estoque
  if (recebimento.itemId && recebimento.itemId !== "manual") {
    adicionarEstoque(recebimento.itemId, recebimento.quantidade)
    // Atualizar localizacao se informada
    if (recebimento.localizacaoDestino) {
      updateItem(recebimento.itemId, { localizacao: recebimento.localizacaoDestino })
    }
  } else if (recebimento.nomeItem && recebimento.nomeItem.trim()) {
    // Se e um item manual (novo), cria automaticamente no catalogo
    // Primeiro verifica se ja existe um item com esse nome na mesma categoria
    const itens = getTodosItens()
    const itemExistente = itens.find(
      i => i.nome.toLowerCase() === recebimento.nomeItem.trim().toLowerCase() && 
           i.categoria === recebimento.categoria
    )
    
    if (itemExistente) {
      // Se ja existe, apenas adiciona ao estoque
      adicionarEstoque(itemExistente.id, recebimento.quantidade)
      if (recebimento.localizacaoDestino) {
        updateItem(itemExistente.id, { localizacao: recebimento.localizacaoDestino })
      }
    } else {
      // Se nao existe, cria um novo item no catalogo
      const categoria = recebimento.categoria || "papelaria"
      addItem(
        recebimento.nomeItem.trim(),
        categoria,
        recebimento.quantidade, // estoque inicial = quantidade recebida
        10, // estoque minimo padrao
        recebimento.localizacaoDestino || ""
      )
    }
  }

  return novo
}

// ========== BAIXAS POR AVARIA / ESTRAGO ==========
export function getBaixasAvarias(): BaixaAvaria[] {
  if (typeof window === "undefined") return baixasIniciais
  const stored = localStorage.getItem(BAIXAS_KEY)
  if (!stored) {
    localStorage.setItem(BAIXAS_KEY, JSON.stringify(baixasIniciais))
    return baixasIniciais
  }
  return JSON.parse(stored)
}

export function addBaixaAvaria(baixa: Omit<BaixaAvaria, "id" | "dataBaixa">): BaixaAvaria {
  const baixas = getBaixasAvarias()
  const nova: BaixaAvaria = {
    ...baixa,
    id: `bx-${Date.now()}`,
    dataBaixa: new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  }
  baixas.unshift(nova)
  if (typeof window !== "undefined") {
    localStorage.setItem(BAIXAS_KEY, JSON.stringify(baixas))
  }

  // Dar baixa no estoque automaticamente
  if (baixa.itemId) {
    darBaixaEstoque(baixa.itemId, baixa.quantidade)
  }

  return nova
}

// ========== SAIDAS DE MATERIAL ==========
const SAIDAS_KEY = "inove_saqua_saidas_material"

const saidasIniciais: SaidaMaterial[] = []

export function getSaidas(): SaidaMaterial[] {
  if (typeof window === "undefined") return saidasIniciais
  const stored = localStorage.getItem(SAIDAS_KEY)
  if (!stored) {
    localStorage.setItem(SAIDAS_KEY, JSON.stringify(saidasIniciais))
    return saidasIniciais
  }
  return JSON.parse(stored)
}

export function addSaida(saida: Omit<SaidaMaterial, "id" | "dataSaida" | "romaneioGerado">): SaidaMaterial {
  const saidas = getSaidas()
  const nova: SaidaMaterial = {
    ...saida,
    id: `saida-${Date.now()}`,
    dataSaida: new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    romaneioGerado: true,
  }
  saidas.unshift(nova)
  if (typeof window !== "undefined") {
    localStorage.setItem(SAIDAS_KEY, JSON.stringify(saidas))
  }

  // Dar baixa no estoque automaticamente
  if (saida.itemId) {
    darBaixaEstoque(saida.itemId, saida.quantidade)
  }

  return nova
}
