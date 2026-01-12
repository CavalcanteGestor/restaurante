export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      reservas: {
        Row: {
          id: string
          nome: string
          telefone: string
          data_reserva: string
          horario_reserva: string
          numero_pessoas: number
          etapa: string | null
          contexto: string | null
          created_at: string | null
          turno: string | null
          mesas: string | null
          status_comparecimento: string | null
        }
        Insert: {
          id?: string
          nome: string
          telefone: string
          data_reserva: string
          horario_reserva: string
          numero_pessoas: number
          etapa?: string | null
          contexto?: string | null
          created_at?: string | null
          turno?: string | null
          mesas?: string | null
          status_comparecimento?: string | null
        }
        Update: {
          id?: string
          nome?: string
          telefone?: string
          data_reserva?: string
          horario_reserva?: string
          numero_pessoas?: number
          etapa?: string | null
          contexto?: string | null
          created_at?: string | null
          turno?: string | null
          mesas?: string | null
          status_comparecimento?: string | null
        }
      }
      mesas: {
        Row: {
          id: string
          codigo: string
          capacidade: number
          tipo: string
          andar: string
          disponivel: boolean | null
          observacao: string | null
          ambiente: string | null
          pode_juntar: boolean | null
          junta_com: string | null
          eventos_pessoais: boolean | null
          eventos_corporativos: boolean | null
          so_eventos: boolean | null
          tem_tv: boolean | null
          privativa: boolean | null
          posicao_x: number | null
          posicao_y: number | null
        }
        Insert: {
          id?: string
          codigo: string
          capacidade: number
          tipo: string
          andar: string
          disponivel?: boolean | null
          observacao?: string | null
          ambiente?: string | null
          pode_juntar?: boolean | null
          junta_com?: string | null
          eventos_pessoais?: boolean | null
          eventos_corporativos?: boolean | null
          so_eventos?: boolean | null
          tem_tv?: boolean | null
          privativa?: boolean | null
          posicao_x?: number | null
          posicao_y?: number | null
        }
        Update: {
          id?: string
          codigo?: string
          capacidade?: number
          tipo?: string
          andar?: string
          disponivel?: boolean | null
          observacao?: string | null
          ambiente?: string | null
          pode_juntar?: boolean | null
          junta_com?: string | null
          eventos_pessoais?: boolean | null
          eventos_corporativos?: boolean | null
          so_eventos?: boolean | null
          tem_tv?: boolean | null
          privativa?: boolean | null
          posicao_x?: number | null
          posicao_y?: number | null
        }
      }
      leads: {
        Row: {
          id: number
          nome: string
          telefone: string
          etapa: string | null
          contexto: string | null
          data_ultima_msg: string | null
          conversation_id: string | null
          endereco: string | null
          mensagem: string | null
        }
        Insert: {
          id?: number
          nome: string
          telefone: string
          etapa?: string | null
          contexto?: string | null
          data_ultima_msg?: string | null
          conversation_id?: string | null
          endereco?: string | null
          mensagem?: string | null
        }
        Update: {
          id?: number
          nome?: string
          telefone?: string
          etapa?: string | null
          contexto?: string | null
          data_ultima_msg?: string | null
          conversation_id?: string | null
          endereco?: string | null
          mensagem?: string | null
        }
      }
      conversas: {
        Row: {
          id: number
          numero: string
          nome: string | null
          data_mensagem: string | null
          mensagem_ia: string | null
          mensagem_lead: string | null
          sessionid: string | null
          tipo_mensagem: string | null
          conversation_id: string | null
        }
        Insert: {
          id?: number
          numero: string
          nome?: string | null
          data_mensagem?: string | null
          mensagem_ia?: string | null
          mensagem_lead?: string | null
          sessionid?: string | null
          tipo_mensagem?: string | null
          conversation_id?: string | null
        }
        Update: {
          id?: number
          numero?: string
          nome?: string | null
          data_mensagem?: string | null
          mensagem_ia?: string | null
          mensagem_lead?: string | null
          sessionid?: string | null
          tipo_mensagem?: string | null
          conversation_id?: string | null
        }
      }
      atendimento_humano: {
        Row: {
          phone: string
          ativo: boolean | null
          updated_at: string | null
        }
        Insert: {
          phone: string
          ativo?: boolean | null
          updated_at?: string | null
        }
        Update: {
          phone?: string
          ativo?: boolean | null
          updated_at?: string | null
        }
      }
      locks: {
        Row: {
          numero: string
          locked: boolean
          updated_at: string
          retrycount: number
        }
        Insert: {
          numero: string
          locked?: boolean
          updated_at?: string
          retrycount?: number
        }
        Update: {
          numero?: string
          locked?: boolean
          updated_at?: string
          retrycount?: number
        }
      }
      mensagens_automaticas: {
        Row: {
          id: string
          reserva_id: string | null
          telefone: string
          nome: string
          mensagem: string
          tipo: string
          status: string
          data_envio: string | null
          erro: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          reserva_id?: string | null
          telefone: string
          nome: string
          mensagem: string
          tipo: string
          status?: string
          data_envio?: string | null
          erro?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          reserva_id?: string | null
          telefone?: string
          nome?: string
          mensagem?: string
          tipo?: string
          status?: string
          data_envio?: string | null
          erro?: string | null
          created_at?: string | null
        }
      }
      configuracoes_mensagens: {
        Row: {
          id: string
          tipo: string
          template: string
          ativo: boolean
          posicao_nome: string
          placeholder_nome: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          tipo: string
          template: string
          ativo?: boolean
          posicao_nome?: string
          placeholder_nome?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          tipo?: string
          template?: string
          ativo?: boolean
          posicao_nome?: string
          placeholder_nome?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      mensagens_agendadas: {
        Row: {
          id: string
          reserva_id: string | null
          telefone: string
          nome: string
          tipo: 'confirmacao' | 'cancelamento' | 'atraso' | 'lembrete'
          mensagem: string
          agendado_para: string
          status: 'pendente' | 'enviada' | 'cancelada' | 'erro'
          enviado_em: string | null
          erro: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reserva_id?: string | null
          telefone: string
          nome: string
          tipo: 'confirmacao' | 'cancelamento' | 'atraso' | 'lembrete'
          mensagem: string
          agendado_para: string
          status?: 'pendente' | 'enviada' | 'cancelada' | 'erro'
          enviado_em?: string | null
          erro?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reserva_id?: string | null
          telefone?: string
          nome?: string
          tipo?: 'confirmacao' | 'cancelamento' | 'atraso' | 'lembrete'
          mensagem?: string
          agendado_para?: string
          status?: 'pendente' | 'enviada' | 'cancelada' | 'erro'
          enviado_em?: string | null
          erro?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      usuarios: {
        Row: {
          id: string
          nome: string
          email: string
          telefone: string | null
          status: boolean | null
          tipo: string | null
          funcao_id: string | null
          ultimo_login: string | null
          tentativas_login: number | null
          bloqueado_ate: string | null
          data_cadastro: string | null
          atualizado_em: string | null
          avatar_url: string | null
          metadata: Json | null
          username: string | null
        }
        Insert: {
          id: string
          nome: string
          email: string
          telefone?: string | null
          status?: boolean | null
          tipo?: string | null
          funcao_id?: string | null
          ultimo_login?: string | null
          tentativas_login?: number | null
          bloqueado_ate?: string | null
          data_cadastro?: string | null
          atualizado_em?: string | null
          avatar_url?: string | null
          metadata?: Json | null
          username?: string | null
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          telefone?: string | null
          status?: boolean | null
          tipo?: string | null
          funcao_id?: string | null
          ultimo_login?: string | null
          tentativas_login?: number | null
          bloqueado_ate?: string | null
          data_cadastro?: string | null
          atualizado_em?: string | null
          avatar_url?: string | null
          metadata?: Json | null
          username?: string | null
        }
      }
      documentos: {
        Row: {
          id: string
          tipo: 'cardapio' | 'cartela_videos' | 'restaurante'
          titulo: string
          descricao: string | null
          arquivo_url: string
          arquivo_nome: string
          arquivo_tamanho: number | null
          ativo: boolean
          ordem: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          tipo: 'cardapio' | 'cartela_videos' | 'restaurante'
          titulo: string
          descricao?: string | null
          arquivo_url: string
          arquivo_nome: string
          arquivo_tamanho?: number | null
          ativo?: boolean
          ordem?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          tipo?: 'cardapio' | 'cartela_videos' | 'restaurante'
          titulo?: string
          descricao?: string | null
          arquivo_url?: string
          arquivo_nome?: string
          arquivo_tamanho?: number | null
          ativo?: boolean
          ordem?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}
