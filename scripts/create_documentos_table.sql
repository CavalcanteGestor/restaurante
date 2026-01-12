-- Tabela para armazenar documentos (cardápios, cartela de vídeos, informações do restaurante)
-- Estes documentos podem ser enviados via IA quando o cliente solicitar

CREATE TABLE IF NOT EXISTS documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL, -- 'cardapio', 'cartela_videos', 'restaurante'
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  arquivo_url TEXT NOT NULL, -- URL do arquivo no Supabase Storage
  arquivo_nome VARCHAR(255) NOT NULL, -- Nome original do arquivo
  arquivo_tamanho INTEGER, -- Tamanho em bytes
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0, -- Para ordenar documentos do mesmo tipo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos(tipo);
CREATE INDEX IF NOT EXISTS idx_documentos_ativo ON documentos(ativo);
CREATE INDEX IF NOT EXISTS idx_documentos_tipo_ativo ON documentos(tipo, ativo);

-- RLS (Row Level Security) - permitir leitura pública, escrita apenas autenticada
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (para a IA poder acessar)
CREATE POLICY "Permitir leitura pública de documentos ativos"
  ON documentos
  FOR SELECT
  USING (ativo = true);

-- Política para permitir inserção apenas para usuários autenticados
CREATE POLICY "Permitir inserção para usuários autenticados"
  ON documentos
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir atualização apenas para usuários autenticados
CREATE POLICY "Permitir atualização para usuários autenticados"
  ON documentos
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Política para permitir exclusão apenas para usuários autenticados
CREATE POLICY "Permitir exclusão para usuários autenticados"
  ON documentos
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_documentos_updated_at
  BEFORE UPDATE ON documentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários na tabela
COMMENT ON TABLE documentos IS 'Armazena documentos do restaurante (cardápios, cartela de vídeos, etc) que podem ser enviados via IA';
COMMENT ON COLUMN documentos.tipo IS 'Tipo do documento: cardapio, cartela_videos, restaurante';
COMMENT ON COLUMN documentos.arquivo_url IS 'URL completa do arquivo no Supabase Storage';
COMMENT ON COLUMN documentos.ativo IS 'Se false, o documento não será listado nem enviado';
