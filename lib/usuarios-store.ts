// Store de Usuarios e Permissoes

export interface Setor {
  id: string;
  nome: string;
  tipo: "secretaria" | "escola" | "unidade" | "departamento";
  criadoEm: string;
  ativo: boolean;
}

export interface Usuario {
  id: string;
  nome: string;
  login: string;
  senha: string;
  matricula: string;
  email: string;
  cargo: string;
  setor: string;
  nivel: "gestor" | "admin_patrimonio" | "responsavel" | "usuario";
  permissoes: Permissao[];
  ativo: boolean;
  criadoEm: string;
  aprovadoPor?: string;
  statusAprovacao: "pendente" | "aprovado" | "rejeitado";
}

export interface Permissao {
  id: string;
  modulo: "almoxarifado" | "patrimonio" | "kits-uniformes" | "transferencia" | "relatorios" | "usuarios" | "todos";
  acoes: ("visualizar" | "criar" | "editar" | "excluir" | "aprovar")[];
}

export interface SolicitacaoAprovacao {
  id: string;
  tipo: "usuario" | "setor" | "permissao";
  solicitanteId: string;
  dadosSolicitacao: Record<string, unknown>;
  status: "pendente" | "aprovado" | "rejeitado";
  aprovadorId?: string;
  dataAprovacao?: string;
  criadoEm: string;
  observacao?: string;
}

const STORAGE_KEY_USUARIOS = "inove_saqua_usuarios";
const STORAGE_KEY_SETORES = "inove_saqua_setores";
const STORAGE_KEY_APROVACOES = "inove_saqua_aprovacoes";

// Usuario Gestor Universal (admin master)
// IMPORTANTE: a senha real do gestor NAO fica aqui. Este arquivo e empacotado para o
// navegador, entao qualquer valor colocado em `senha` ficaria exposto no bundle.
// A autenticacao acontece exclusivamente no servidor via /api/auth/login, que le as
// credenciais de variaveis de ambiente.
const GESTOR_UNIVERSAL: Usuario = {
  id: "gestor-master",
  nome: "Gestor do Sistema",
  login: "Gestor",
  senha: "",
  matricula: "000000",
  email: "gestor@saquarema.rj.gov.br",
  cargo: "Gestor de Sistemas",
  setor: "Secretaria de Patrimonio",
  nivel: "gestor",
  permissoes: [{ id: "perm-all", modulo: "todos", acoes: ["visualizar", "criar", "editar", "excluir", "aprovar"] }],
  ativo: true,
  criadoEm: new Date().toISOString(),
  statusAprovacao: "aprovado",
};

// Setores padrao
const SETORES_PADRAO: Setor[] = [
  { id: "setor-1", nome: "Secretaria de Patrimonio", tipo: "secretaria", criadoEm: new Date().toISOString(), ativo: true },
  { id: "setor-2", nome: "Secretaria de Educacao", tipo: "secretaria", criadoEm: new Date().toISOString(), ativo: true },
];

// Inicializar dados
function initStorage() {
  if (typeof window === "undefined") return;

  // Usuarios
  const usuariosRaw = localStorage.getItem(STORAGE_KEY_USUARIOS);
  if (!usuariosRaw) {
    localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify([GESTOR_UNIVERSAL]));
  } else {
    // Garantir que o gestor universal sempre existe
    const usuarios = JSON.parse(usuariosRaw) as Usuario[];
    const temGestor = usuarios.some((u) => u.login === "Gestor" && u.nivel === "gestor");
    if (!temGestor) {
      usuarios.push(GESTOR_UNIVERSAL);
      localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(usuarios));
    }
  }

  // Setores
  const setoresRaw = localStorage.getItem(STORAGE_KEY_SETORES);
  if (!setoresRaw) {
    localStorage.setItem(STORAGE_KEY_SETORES, JSON.stringify(SETORES_PADRAO));
  }

  // Aprovacoes
  const aprovacoesRaw = localStorage.getItem(STORAGE_KEY_APROVACOES);
  if (!aprovacoesRaw) {
    localStorage.setItem(STORAGE_KEY_APROVACOES, JSON.stringify([]));
  }
}

// ========== USUARIOS ==========
export function getUsuarios(): Usuario[] {
  if (typeof window === "undefined") return [GESTOR_UNIVERSAL];
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEY_USUARIOS);
  return raw ? JSON.parse(raw) : [GESTOR_UNIVERSAL];
}

export function getUsuarioById(id: string): Usuario | undefined {
  return getUsuarios().find((u) => u.id === id);
}

export function getUsuarioByLogin(login: string): Usuario | undefined {
  return getUsuarios().find((u) => u.login.toLowerCase() === login.toLowerCase());
}

export function autenticarUsuario(login: string, senha: string): Usuario | null {
  // A autenticacao principal (gestor/patrimonio) e feita no servidor via /api/auth/login.
  // Esta funcao NUNCA deve validar senha vazia, evitando login indevido no gestor master,
  // cuja senha nao fica mais no bundle.
  if (!senha) return null;
  const usuario = getUsuarioByLogin(login);
  if (usuario && usuario.senha && usuario.senha === senha && usuario.ativo && usuario.statusAprovacao === "aprovado") {
    return usuario;
  }
  return null;
}

export function addUsuario(usuario: Omit<Usuario, "id" | "criadoEm">): Usuario {
  const usuarios = getUsuarios();
  const novoUsuario: Usuario = {
    ...usuario,
    id: `user-${Date.now()}`,
    criadoEm: new Date().toISOString(),
  };
  usuarios.push(novoUsuario);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(usuarios));
  }
  return novoUsuario;
}

export function updateUsuario(id: string, dados: Partial<Usuario>): Usuario | null {
  const usuarios = getUsuarios();
  const index = usuarios.findIndex((u) => u.id === id);
  if (index === -1) return null;

  // Nao permitir alterar o gestor universal
  if (usuarios[index].login === "Gestor" && usuarios[index].nivel === "gestor") {
    // Apenas permite alterar nome e email do gestor
    usuarios[index] = {
      ...usuarios[index],
      nome: dados.nome || usuarios[index].nome,
      email: dados.email || usuarios[index].email,
    };
  } else {
    usuarios[index] = { ...usuarios[index], ...dados };
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(usuarios));
  }
  return usuarios[index];
}

export function desativarUsuario(id: string): boolean {
  const usuarios = getUsuarios();
  const usuario = usuarios.find((u) => u.id === id);
  
  // Nao permitir desativar o gestor universal
  if (usuario?.login === "Gestor" && usuario?.nivel === "gestor") {
    return false;
  }

  const index = usuarios.findIndex((u) => u.id === id);
  if (index === -1) return false;

  usuarios[index].ativo = false;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(usuarios));
  }
  return true;
}

export function reativarUsuario(id: string): boolean {
  const usuarios = getUsuarios();
  const index = usuarios.findIndex((u) => u.id === id);
  if (index === -1) return false;

  usuarios[index].ativo = true;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(usuarios));
  }
  return true;
}

export function getUsuariosAtivos(): Usuario[] {
  return getUsuarios().filter((u) => u.ativo && u.statusAprovacao === "aprovado");
}

export function getUsuariosPendentes(): Usuario[] {
  return getUsuarios().filter((u) => u.statusAprovacao === "pendente");
}

// ========== SETORES ==========
export function getSetores(): Setor[] {
  if (typeof window === "undefined") return SETORES_PADRAO;
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEY_SETORES);
  return raw ? JSON.parse(raw) : SETORES_PADRAO;
}

export function getSetoresAtivos(): Setor[] {
  return getSetores().filter((s) => s.ativo);
}

export function addSetor(setor: Omit<Setor, "id" | "criadoEm">): Setor {
  const setores = getSetores();
  const novoSetor: Setor = {
    ...setor,
    id: `setor-${Date.now()}`,
    criadoEm: new Date().toISOString(),
  };
  setores.push(novoSetor);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_SETORES, JSON.stringify(setores));
  }
  return novoSetor;
}

export function updateSetor(id: string, dados: Partial<Setor>): Setor | null {
  const setores = getSetores();
  const index = setores.findIndex((s) => s.id === id);
  if (index === -1) return null;

  setores[index] = { ...setores[index], ...dados };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_SETORES, JSON.stringify(setores));
  }
  return setores[index];
}

export function desativarSetor(id: string): boolean {
  const setores = getSetores();
  const index = setores.findIndex((s) => s.id === id);
  if (index === -1) return false;

  setores[index].ativo = false;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_SETORES, JSON.stringify(setores));
  }
  return true;
}

// ========== APROVACOES ==========
export function getAprovacoesPendentes(): SolicitacaoAprovacao[] {
  if (typeof window === "undefined") return [];
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEY_APROVACOES);
  const aprovacoes = raw ? (JSON.parse(raw) as SolicitacaoAprovacao[]) : [];
  return aprovacoes.filter((a) => a.status === "pendente");
}

export function addSolicitacaoAprovacao(solicitacao: Omit<SolicitacaoAprovacao, "id" | "criadoEm" | "status">): SolicitacaoAprovacao {
  if (typeof window === "undefined") return {} as SolicitacaoAprovacao;
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEY_APROVACOES);
  const aprovacoes = raw ? (JSON.parse(raw) as SolicitacaoAprovacao[]) : [];

  const nova: SolicitacaoAprovacao = {
    ...solicitacao,
    id: `aprov-${Date.now()}`,
    criadoEm: new Date().toISOString(),
    status: "pendente",
  };

  aprovacoes.push(nova);
  localStorage.setItem(STORAGE_KEY_APROVACOES, JSON.stringify(aprovacoes));
  return nova;
}

export function aprovarSolicitacao(id: string, aprovadorId: string, observacao?: string): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(STORAGE_KEY_APROVACOES);
  const aprovacoes = raw ? (JSON.parse(raw) as SolicitacaoAprovacao[]) : [];
  const index = aprovacoes.findIndex((a) => a.id === id);
  if (index === -1) return false;

  aprovacoes[index].status = "aprovado";
  aprovacoes[index].aprovadorId = aprovadorId;
  aprovacoes[index].dataAprovacao = new Date().toISOString();
  aprovacoes[index].observacao = observacao;

  localStorage.setItem(STORAGE_KEY_APROVACOES, JSON.stringify(aprovacoes));

  // Se for aprovacao de usuario, atualizar o status do usuario
  if (aprovacoes[index].tipo === "usuario") {
    const usuarioId = aprovacoes[index].dadosSolicitacao.usuarioId as string;
    updateUsuario(usuarioId, { statusAprovacao: "aprovado", aprovadoPor: aprovadorId });
  }

  return true;
}

export function rejeitarSolicitacao(id: string, aprovadorId: string, observacao?: string): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(STORAGE_KEY_APROVACOES);
  const aprovacoes = raw ? (JSON.parse(raw) as SolicitacaoAprovacao[]) : [];
  const index = aprovacoes.findIndex((a) => a.id === id);
  if (index === -1) return false;

  aprovacoes[index].status = "rejeitado";
  aprovacoes[index].aprovadorId = aprovadorId;
  aprovacoes[index].dataAprovacao = new Date().toISOString();
  aprovacoes[index].observacao = observacao;

  localStorage.setItem(STORAGE_KEY_APROVACOES, JSON.stringify(aprovacoes));

  // Se for rejeicao de usuario, atualizar o status do usuario
  if (aprovacoes[index].tipo === "usuario") {
    const usuarioId = aprovacoes[index].dadosSolicitacao.usuarioId as string;
    updateUsuario(usuarioId, { statusAprovacao: "rejeitado" });
  }

  return true;
}

// ========== PERMISSOES ==========
export const NIVEIS_ACESSO = {
  gestor: { label: "Gestor", descricao: "Acesso total ao sistema" },
  admin_patrimonio: { label: "Admin Patrimonio", descricao: "Administrador do painel de patrimonio" },
  responsavel: { label: "Responsavel", descricao: "Responsavel por setor/escola" },
  usuario: { label: "Usuario", descricao: "Usuario comum com acesso limitado" },
};

export const MODULOS = {
  almoxarifado: "Almoxarifado",
  patrimonio: "Patrimonio",
  "kits-uniformes": "Kits e Uniformes",
  transferencia: "Transferencias",
  relatorios: "Relatorios",
  usuarios: "Gestao de Usuarios",
  todos: "Todos os Modulos",
};

export const ACOES = {
  visualizar: "Visualizar",
  criar: "Criar",
  editar: "Editar",
  excluir: "Excluir",
  aprovar: "Aprovar",
};

export function temPermissao(usuario: Usuario, modulo: string, acao: string): boolean {
  if (usuario.nivel === "gestor") return true;
  
  return usuario.permissoes.some((p) => {
    const moduloMatch = p.modulo === "todos" || p.modulo === modulo;
    const acaoMatch = p.acoes.includes(acao as Permissao["acoes"][number]);
    return moduloMatch && acaoMatch;
  });
}
