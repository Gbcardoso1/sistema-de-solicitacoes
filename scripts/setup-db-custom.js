const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const schema = `
CREATE TABLE IF NOT EXISTS instituicoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL DEFAULT 'escola',
  endereco TEXT,
  telefone TEXT,
  email TEXT,
  responsavel TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS solicitacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('patrimonio', 'almoxarifado', 'kits', 'uniformes', 'transferencia')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_analise', 'aprovado', 'rejeitado', 'concluido', 'cancelado')),
  nome_solicitante TEXT NOT NULL,
  matricula TEXT,
  instituicao_nome TEXT NOT NULL,
  setor_destino TEXT,
  dados_itens JSONB DEFAULT '[]'::jsonb,
  observacoes TEXT,
  instituicao_origem_nome TEXT,
  instituicao_destino_nome TEXT,
  responsavel_origem TEXT,
  responsavel_destino TEXT,
  data_transferencia DATE,
  atendido_por TEXT,
  atendido_em TIMESTAMPTZ,
  motivo_rejeicao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ano INTEGER NOT NULL,
  instituicao_nome TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  status TEXT DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluido', 'cancelado')),
  total_itens INTEGER DEFAULT 0,
  itens JSONB DEFAULT '[]'::jsonb,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arrolamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_patrimonio TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT,
  estado_conservacao TEXT CHECK (estado_conservacao IN ('otimo', 'bom', 'regular', 'ruim', 'inservivel')),
  instituicao_nome TEXT NOT NULL,
  localizacao TEXT,
  responsavel TEXT,
  data_aquisicao DATE,
  valor_aquisicao NUMERIC(12,2),
  situacao TEXT DEFAULT 'ativo' CHECK (situacao IN ('ativo', 'baixado', 'transferido', 'em_manutencao')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS relatorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  instituicao_nome TEXT,
  periodo_inicio DATE,
  periodo_fim DATE,
  filtros JSONB,
  dados JSONB,
  gerado_por TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mensagens_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sessao_id TEXT NOT NULL,
  nome_usuario TEXT NOT NULL,
  instituicao_nome TEXT NOT NULL,
  remetente TEXT NOT NULL CHECK (remetente IN ('usuario', 'atendente', 'sistema')),
  mensagem TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS historico_edicoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela TEXT NOT NULL,
  registro_id TEXT NOT NULL,
  acao TEXT NOT NULL CHECK (acao IN ('criacao', 'edicao', 'exclusao', 'status_alterado')),
  dados_anteriores JSONB,
  dados_novos JSONB,
  usuario TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS itens_patrimonio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT,
  codigo TEXT,
  unidade TEXT DEFAULT 'un',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_codigo ON solicitacoes(codigo);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_tipo ON solicitacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON solicitacoes(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_instituicao ON solicitacoes(instituicao_nome);
CREATE INDEX IF NOT EXISTS idx_inventario_ano ON inventario(ano);
CREATE INDEX IF NOT EXISTS idx_inventario_instituicao ON inventario(instituicao_nome);
CREATE INDEX IF NOT EXISTS idx_arrolamento_patrimonio ON arrolamento(numero_patrimonio);
CREATE INDEX IF NOT EXISTS idx_arrolamento_instituicao ON arrolamento(instituicao_nome);
CREATE INDEX IF NOT EXISTS idx_mensagens_sessao ON mensagens_chat(sessao_id);
CREATE INDEX IF NOT EXISTS idx_historico_tabela ON historico_edicoes(tabela);
CREATE INDEX IF NOT EXISTS idx_historico_registro ON historico_edicoes(registro_id);
`;

async function setupDatabase() {
  try {
    console.log('🔄 Iniciando setup do banco de dados...');
    const { error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('❌ Erro ao criar schema:', error);
      process.exit(1);
    }
    
    console.log('✅ Schema criado com sucesso!');
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

setupDatabase();
