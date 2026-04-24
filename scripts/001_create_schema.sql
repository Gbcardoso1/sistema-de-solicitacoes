-- Tabela de Instituições
CREATE TABLE IF NOT EXISTS public.instituicoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  ativa BOOLEAN DEFAULT true,
  criada_em TIMESTAMP DEFAULT now(),
  atualizada_em TIMESTAMP DEFAULT now()
);

-- Tabela de Solicitações de Patrimônio
CREATE TABLE IF NOT EXISTS public.solicitacoes_patrimonio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_solicitante TEXT NOT NULL,
  matricula TEXT NOT NULL,
  instituicao_id uuid REFERENCES public.instituicoes(id),
  instituicao_nome TEXT,
  setor_destino TEXT,
  status TEXT DEFAULT 'pendente',
  criada_em TIMESTAMP DEFAULT now(),
  atualizada_em TIMESTAMP DEFAULT now()
);

-- Tabela de Itens de Patrimônio
CREATE TABLE IF NOT EXISTS public.itens_patrimonio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id uuid REFERENCES public.solicitacoes_patrimonio(id) ON DELETE CASCADE,
  item TEXT,
  quantidade INTEGER DEFAULT 0,
  ordem INTEGER,
  criado_em TIMESTAMP DEFAULT now()
);

-- Tabela de Solicitações de Almoxarifado
CREATE TABLE IF NOT EXISTS public.solicitacoes_almoxarifado (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_solicitante TEXT NOT NULL,
  matricula TEXT NOT NULL,
  instituicao_id uuid REFERENCES public.instituicoes(id),
  instituicao_nome TEXT,
  status TEXT DEFAULT 'pendente',
  criada_em TIMESTAMP DEFAULT now(),
  atualizada_em TIMESTAMP DEFAULT now()
);

-- Tabela de Itens de Almoxarifado (Papelaria)
CREATE TABLE IF NOT EXISTS public.itens_almoxarifado_papelaria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id uuid REFERENCES public.solicitacoes_almoxarifado(id) ON DELETE CASCADE,
  categoria TEXT,
  quantidade INTEGER DEFAULT 0,
  ordem INTEGER,
  criado_em TIMESTAMP DEFAULT now()
);

-- Tabela de Itens de Almoxarifado (Cozinha)
CREATE TABLE IF NOT EXISTS public.itens_almoxarifado_cozinha (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id uuid REFERENCES public.solicitacoes_almoxarifado(id) ON DELETE CASCADE,
  categoria TEXT,
  quantidade INTEGER DEFAULT 0,
  ordem INTEGER,
  criado_em TIMESTAMP DEFAULT now()
);

-- Tabela de Solicitações de Kits
CREATE TABLE IF NOT EXISTS public.solicitacoes_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_solicitante TEXT NOT NULL,
  matricula TEXT NOT NULL,
  instituicao_id uuid REFERENCES public.instituicoes(id),
  instituicao_nome TEXT,
  status TEXT DEFAULT 'pendente',
  criada_em TIMESTAMP DEFAULT now(),
  atualizada_em TIMESTAMP DEFAULT now()
);

-- Tabela de Itens de Kits - Aluno
CREATE TABLE IF NOT EXISTS public.itens_kits_aluno (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id uuid REFERENCES public.solicitacoes_kits(id) ON DELETE CASCADE,
  item TEXT,
  quantidade INTEGER DEFAULT 0,
  ordem INTEGER,
  criado_em TIMESTAMP DEFAULT now()
);

-- Tabela de Itens de Kits - Mochila
CREATE TABLE IF NOT EXISTS public.itens_kits_mochila (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id uuid REFERENCES public.solicitacoes_kits(id) ON DELETE CASCADE,
  item TEXT,
  quantidade INTEGER DEFAULT 0,
  ordem INTEGER,
  criado_em TIMESTAMP DEFAULT now()
);

-- Tabela de Itens de Kits - Professor
CREATE TABLE IF NOT EXISTS public.itens_kits_professor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id uuid REFERENCES public.solicitacoes_kits(id) ON DELETE CASCADE,
  item TEXT,
  quantidade INTEGER DEFAULT 0,
  ordem INTEGER,
  criado_em TIMESTAMP DEFAULT now()
);

-- Tabela de Solicitações de Uniformes
CREATE TABLE IF NOT EXISTS public.solicitacoes_uniformes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_solicitante TEXT NOT NULL,
  matricula TEXT NOT NULL,
  instituicao_id uuid REFERENCES public.instituicoes(id),
  instituicao_nome TEXT,
  status TEXT DEFAULT 'pendente',
  criada_em TIMESTAMP DEFAULT now(),
  atualizada_em TIMESTAMP DEFAULT now()
);

-- Tabela de Itens de Uniformes
CREATE TABLE IF NOT EXISTS public.itens_uniformes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id uuid REFERENCES public.solicitacoes_uniformes(id) ON DELETE CASCADE,
  tipo TEXT,
  genero TEXT,
  tamanho TEXT,
  quantidade INTEGER DEFAULT 0,
  ordem INTEGER,
  criado_em TIMESTAMP DEFAULT now()
);

-- Tabela de Itens de Calçados
CREATE TABLE IF NOT EXISTS public.itens_calcados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id uuid REFERENCES public.solicitacoes_uniformes(id) ON DELETE CASCADE,
  tamanho TEXT,
  quantidade INTEGER DEFAULT 0,
  ordem INTEGER,
  criado_em TIMESTAMP DEFAULT now()
);

-- Tabela de Transferências de Itens
CREATE TABLE IF NOT EXISTS public.transferencias_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instituicao_origem_id uuid REFERENCES public.instituicoes(id),
  instituicao_origem TEXT,
  instituicao_destino_id uuid REFERENCES public.instituicoes(id),
  instituicao_destino TEXT,
  responsavel_origem TEXT,
  responsavel_destino TEXT,
  data_transferencia DATE,
  status TEXT DEFAULT 'pendente',
  observacoes TEXT,
  criada_em TIMESTAMP DEFAULT now(),
  atualizada_em TIMESTAMP DEFAULT now()
);

-- Tabela de Itens de Transferência
CREATE TABLE IF NOT EXISTS public.itens_transferencia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transferencia_id uuid REFERENCES public.transferencias_itens(id) ON DELETE CASCADE,
  descricao TEXT,
  quantidade INTEGER DEFAULT 0,
  ordem INTEGER,
  criado_em TIMESTAMP DEFAULT now()
);

-- Tabela de Relatórios de Inventário
CREATE TABLE IF NOT EXISTS public.relatorios_inventario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instituicao_id uuid REFERENCES public.instituicoes(id),
  instituicao_nome TEXT,
  responsavel TEXT,
  data_inicio DATE,
  data_fim DATE,
  total_itens INTEGER DEFAULT 0,
  total_verificado INTEGER DEFAULT 0,
  status TEXT DEFAULT 'em_progresso',
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT now(),
  atualizada_em TIMESTAMP DEFAULT now()
);

-- Tabela de Itens de Inventário
CREATE TABLE IF NOT EXISTS public.itens_inventario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  relatorio_id uuid REFERENCES public.relatorios_inventario(id) ON DELETE CASCADE,
  descricao TEXT,
  quantidade_esperada INTEGER,
  quantidade_encontrada INTEGER,
  diferenca INTEGER,
  status TEXT DEFAULT 'nao_verificado',
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT now()
);

-- Tabela de Histórico de Edições
CREATE TABLE IF NOT EXISTS public.historico_edicoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela TEXT NOT NULL,
  registro_id uuid NOT NULL,
  usuario TEXT,
  tipo_alteracao TEXT,
  dados_antigos JSONB,
  dados_novos JSONB,
  criado_em TIMESTAMP DEFAULT now()
);

-- Tabela de Conversas de Chat
CREATE TABLE IF NOT EXISTS public.conversas_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_usuario TEXT NOT NULL,
  instituicao_nome TEXT,
  mensagens JSONB DEFAULT '[]'::jsonb,
  criada_em TIMESTAMP DEFAULT now(),
  atualizada_em TIMESTAMP DEFAULT now()
);

-- Enable RLS em todas as tabelas
ALTER TABLE public.instituicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_patrimonio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_patrimonio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_almoxarifado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_almoxarifado_papelaria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_almoxarifado_cozinha ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_kits_aluno ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_kits_mochila ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_kits_professor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_uniformes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_uniformes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_calcados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transferencias_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_transferencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorios_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_edicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversas_chat ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (permitir leitura/escrita pública para este sistema)
-- Instituições - Todos podem ler
CREATE POLICY "instituicoes_read" ON public.instituicoes FOR SELECT USING (true);

-- Solicitações - Todos podem ler/criar/atualizar/deletar
CREATE POLICY "patrimonio_read" ON public.solicitacoes_patrimonio FOR SELECT USING (true);
CREATE POLICY "patrimonio_create" ON public.solicitacoes_patrimonio FOR INSERT WITH CHECK (true);
CREATE POLICY "patrimonio_update" ON public.solicitacoes_patrimonio FOR UPDATE USING (true);
CREATE POLICY "patrimonio_delete" ON public.solicitacoes_patrimonio FOR DELETE USING (true);

CREATE POLICY "almoxarifado_read" ON public.solicitacoes_almoxarifado FOR SELECT USING (true);
CREATE POLICY "almoxarifado_create" ON public.solicitacoes_almoxarifado FOR INSERT WITH CHECK (true);
CREATE POLICY "almoxarifado_update" ON public.solicitacoes_almoxarifado FOR UPDATE USING (true);
CREATE POLICY "almoxarifado_delete" ON public.solicitacoes_almoxarifado FOR DELETE USING (true);

CREATE POLICY "kits_read" ON public.solicitacoes_kits FOR SELECT USING (true);
CREATE POLICY "kits_create" ON public.solicitacoes_kits FOR INSERT WITH CHECK (true);
CREATE POLICY "kits_update" ON public.solicitacoes_kits FOR UPDATE USING (true);
CREATE POLICY "kits_delete" ON public.solicitacoes_kits FOR DELETE USING (true);

CREATE POLICY "uniformes_read" ON public.solicitacoes_uniformes FOR SELECT USING (true);
CREATE POLICY "uniformes_create" ON public.solicitacoes_uniformes FOR INSERT WITH CHECK (true);
CREATE POLICY "uniformes_update" ON public.solicitacoes_uniformes FOR UPDATE USING (true);
CREATE POLICY "uniformes_delete" ON public.solicitacoes_uniformes FOR DELETE USING (true);

CREATE POLICY "transferencias_read" ON public.transferencias_itens FOR SELECT USING (true);
CREATE POLICY "transferencias_create" ON public.transferencias_itens FOR INSERT WITH CHECK (true);
CREATE POLICY "transferencias_update" ON public.transferencias_itens FOR UPDATE USING (true);
CREATE POLICY "transferencias_delete" ON public.transferencias_itens FOR DELETE USING (true);

CREATE POLICY "inventario_read" ON public.relatorios_inventario FOR SELECT USING (true);
CREATE POLICY "inventario_create" ON public.relatorios_inventario FOR INSERT WITH CHECK (true);
CREATE POLICY "inventario_update" ON public.relatorios_inventario FOR UPDATE USING (true);
CREATE POLICY "inventario_delete" ON public.relatorios_inventario FOR DELETE USING (true);

CREATE POLICY "historico_read" ON public.historico_edicoes FOR SELECT USING (true);
CREATE POLICY "historico_create" ON public.historico_edicoes FOR INSERT WITH CHECK (true);

CREATE POLICY "chat_read" ON public.conversas_chat FOR SELECT USING (true);
CREATE POLICY "chat_create" ON public.conversas_chat FOR INSERT WITH CHECK (true);
CREATE POLICY "chat_update" ON public.conversas_chat FOR UPDATE USING (true);

-- Itens - Todos podem ler/criar/atualizar/deletar
CREATE POLICY "itens_patrimonio_read" ON public.itens_patrimonio FOR SELECT USING (true);
CREATE POLICY "itens_patrimonio_create" ON public.itens_patrimonio FOR INSERT WITH CHECK (true);
CREATE POLICY "itens_patrimonio_update" ON public.itens_patrimonio FOR UPDATE USING (true);
CREATE POLICY "itens_patrimonio_delete" ON public.itens_patrimonio FOR DELETE USING (true);

CREATE POLICY "itens_almoxarifado_papelaria_read" ON public.itens_almoxarifado_papelaria FOR SELECT USING (true);
CREATE POLICY "itens_almoxarifado_papelaria_create" ON public.itens_almoxarifado_papelaria FOR INSERT WITH CHECK (true);
CREATE POLICY "itens_almoxarifado_papelaria_update" ON public.itens_almoxarifado_papelaria FOR UPDATE USING (true);
CREATE POLICY "itens_almoxarifado_papelaria_delete" ON public.itens_almoxarifado_papelaria FOR DELETE USING (true);

CREATE POLICY "itens_almoxarifado_cozinha_read" ON public.itens_almoxarifado_cozinha FOR SELECT USING (true);
CREATE POLICY "itens_almoxarifado_cozinha_create" ON public.itens_almoxarifado_cozinha FOR INSERT WITH CHECK (true);
CREATE POLICY "itens_almoxarifado_cozinha_update" ON public.itens_almoxarifado_cozinha FOR UPDATE USING (true);
CREATE POLICY "itens_almoxarifado_cozinha_delete" ON public.itens_almoxarifado_cozinha FOR DELETE USING (true);

CREATE POLICY "itens_kits_aluno_read" ON public.itens_kits_aluno FOR SELECT USING (true);
CREATE POLICY "itens_kits_aluno_create" ON public.itens_kits_aluno FOR INSERT WITH CHECK (true);
CREATE POLICY "itens_kits_aluno_update" ON public.itens_kits_aluno FOR UPDATE USING (true);
CREATE POLICY "itens_kits_aluno_delete" ON public.itens_kits_aluno FOR DELETE USING (true);

CREATE POLICY "itens_kits_mochila_read" ON public.itens_kits_mochila FOR SELECT USING (true);
CREATE POLICY "itens_kits_mochila_create" ON public.itens_kits_mochila FOR INSERT WITH CHECK (true);
CREATE POLICY "itens_kits_mochila_update" ON public.itens_kits_mochila FOR UPDATE USING (true);
CREATE POLICY "itens_kits_mochila_delete" ON public.itens_kits_mochila FOR DELETE USING (true);

CREATE POLICY "itens_kits_professor_read" ON public.itens_kits_professor FOR SELECT USING (true);
CREATE POLICY "itens_kits_professor_create" ON public.itens_kits_professor FOR INSERT WITH CHECK (true);
CREATE POLICY "itens_kits_professor_update" ON public.itens_kits_professor FOR UPDATE USING (true);
CREATE POLICY "itens_kits_professor_delete" ON public.itens_kits_professor FOR DELETE USING (true);

CREATE POLICY "itens_uniformes_read" ON public.itens_uniformes FOR SELECT USING (true);
CREATE POLICY "itens_uniformes_create" ON public.itens_uniformes FOR INSERT WITH CHECK (true);
CREATE POLICY "itens_uniformes_update" ON public.itens_uniformes FOR UPDATE USING (true);
CREATE POLICY "itens_uniformes_delete" ON public.itens_uniformes FOR DELETE USING (true);

CREATE POLICY "itens_calcados_read" ON public.itens_calcados FOR SELECT USING (true);
CREATE POLICY "itens_calcados_create" ON public.itens_calcados FOR INSERT WITH CHECK (true);
CREATE POLICY "itens_calcados_update" ON public.itens_calcados FOR UPDATE USING (true);
CREATE POLICY "itens_calcados_delete" ON public.itens_calcados FOR DELETE USING (true);

CREATE POLICY "itens_transferencia_read" ON public.itens_transferencia FOR SELECT USING (true);
CREATE POLICY "itens_transferencia_create" ON public.itens_transferencia FOR INSERT WITH CHECK (true);
CREATE POLICY "itens_transferencia_update" ON public.itens_transferencia FOR UPDATE USING (true);
CREATE POLICY "itens_transferencia_delete" ON public.itens_transferencia FOR DELETE USING (true);

CREATE POLICY "itens_inventario_read" ON public.itens_inventario FOR SELECT USING (true);
CREATE POLICY "itens_inventario_create" ON public.itens_inventario FOR INSERT WITH CHECK (true);
CREATE POLICY "itens_inventario_update" ON public.itens_inventario FOR UPDATE USING (true);
CREATE POLICY "itens_inventario_delete" ON public.itens_inventario FOR DELETE USING (true);
