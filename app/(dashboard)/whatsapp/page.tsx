"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, MessageSquare, Search, Bot, User, Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import dynamic from "next/dynamic"

const ChatInterface = dynamic(() => import("@/components/whatsapp/ChatInterface"), {
  ssr: false,
})
import EvolutionStatus from "@/components/whatsapp/EvolutionStatus"
import { formatDate, formatTime, formatDateTime } from "@/lib/utils/date"
import { Database } from "@/types/database"
import type { WhatsAppMessage } from "@/components/whatsapp/ChatInterface"

type Lead = Database['public']['Tables']['leads']['Row']
type Reserva = Database['public']['Tables']['reservas']['Row']
type AtendimentoHumano = Database['public']['Tables']['atendimento_humano']['Row']

interface ConversaComLead {
  telefone: string
  remoteJid?: string // remoteJid REAL da Evolution API
  nome: string
  ultimaMensagem: string
  dataUltimaMensagem: string
  timestamp?: number // timestamp Unix para ordenação e exibição
  atendimentoHumano: boolean
  profilePicUrl?: string | null
  lead?: Lead
}

export default function WhatsAppPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const telefoneSelecionado = searchParams.get('telefone')
  
  const [conversas, setConversas] = useState<ConversaComLead[]>([])
  const [conversaAtiva, setConversaAtiva] = useState<ConversaComLead | null>(null)
  const [leadAtivo, setLeadAtivo] = useState<Lead | null>(null)
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [conversasMensagens, setConversasMensagens] = useState<WhatsAppMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [erroConexao, setErroConexao] = useState<string | null>(null)

  useEffect(() => {
    carregarConversas()
    
    // REMOVIDO: Não atualizar automaticamente, só quando usuário clicar
    // A atualização automática estava travando a página
  }, [])

  useEffect(() => {
    if (telefoneSelecionado) {
      carregarConversaAtiva(telefoneSelecionado)
    }
  }, [telefoneSelecionado])

  const carregarConversas = async () => {
    try {
      setLoading(true)
      setErroConexao(null)
      
      // Buscar chats diretamente da Evolution API (já vem com contatos combinados e cache)
      const response = await fetch('/api/whatsapp/chats', {
        cache: 'no-store',
      })
      const data = await response.json()

      // Se não houver sucesso, verificar o motivo
      if (!data.success) {
        const erroMsg = data.error || "Evolution API não disponível"
        console.error("[WhatsApp Page] Erro:", erroMsg)
        setErroConexao(erroMsg)
        setConversas([])
        setLoading(false)
        return
      }

      // Se não houver chats, apenas limpar erro
      if (!data.chats || data.chats.length === 0) {
        console.log("[WhatsApp Page] Nenhum chat encontrado")
        setErroConexao(null)
        setConversas([])
        setLoading(false)
        return
      }

      // Processar chats (já vem formatados da API)
      const conversasFormatadas: ConversaComLead[] = data.chats.map((chat: any) => {
        let timestamp = chat.timestamp || Date.now()
        // Converter Unix segundos para milissegundos se necessário
        if (timestamp < 10000000000) {
          timestamp = timestamp * 1000
        }

        return {
          telefone: chat.telefone,
          remoteJid: chat.remoteJid,
          nome: chat.nome,
          ultimaMensagem: chat.lastMessage || '',
          dataUltimaMensagem: new Date(timestamp).toISOString(),
          timestamp: timestamp,
          atendimentoHumano: chat.atendimentoHumano || false,
          profilePicUrl: chat.profilePicUrl || null,
          lead: chat.lead || undefined,
        }
      })

      setConversas(conversasFormatadas)
      setErroConexao(null)

      // Se houver telefone selecionado, atualizar conversa ativa
      if (telefoneSelecionado) {
        const conversa = conversasFormatadas.find(c => c.telefone === telefoneSelecionado)
        if (conversa) {
          setConversaAtiva(conversa)
        }
      }
    } catch (error: any) {
      console.error("[WhatsApp Page] Erro:", error.message)
      setErroConexao(error.message || "Erro ao conectar com Evolution API")
      setConversas([])
    } finally {
      setLoading(false)
    }
  }

  const carregarConversaAtiva = async (telefone: string) => {
    try {
      const supabase = createClient()
      
      // Buscar lead (ou criar se não existir)
      let { data: lead } = await supabase
        .from('leads')
        .select('*')
        .eq('telefone', telefone)
        .maybeSingle()

      // Se não houver lead, criar um básico
      if (!lead) {
        const conversaAtual = conversas.find(c => c.telefone === telefone)
        const { data: newLead } = await supabase
          .from('leads')
          .insert({
            telefone,
            nome: conversaAtual?.nome || telefone,
            etapa: 'interesse',
          })
          .select()
          .single()
        lead = newLead
      }

      // Buscar mensagens usando o remoteJid REAL da Evolution
      const conversaAtual = conversas.find(c => c.telefone === telefone)
      
      // Usar remoteJid REAL do chat (já vem correto com @lid, @g.us, ou @s.whatsapp.net)
      let remoteJidReal = conversaAtual?.remoteJid
      if (!remoteJidReal || !remoteJidReal.includes('@')) {
        remoteJidReal = `${telefone}@s.whatsapp.net`
      }
      
      const messagesResponse = await fetch(`/api/whatsapp/messages?remoteJid=${encodeURIComponent(remoteJidReal)}&limit=100`, {
        cache: 'no-store',
      })
      const messagesData = await messagesResponse.json()

      if (messagesData.success && messagesData.messages) {
        const mensagensFormatadas: WhatsAppMessage[] = messagesData.messages.map((msg: any) => ({
          id: String(msg.id || Math.random()),
          fromMe: Boolean(msg.fromMe),
          message: String(msg.message || '[Mensagem]'),
          timestamp: String(msg.timestamp || Date.now()),
        }))

        setConversasMensagens(mensagensFormatadas)
      } else {
        setConversasMensagens([])
      }

      // Buscar reservas
      const { data: reservasData } = await supabase
        .from('reservas')
        .select('*')
        .eq('telefone', telefone)
        .order('data_reserva', { ascending: false })

      // Buscar status de atendimento humano
      const { data: atendimentoData } = await supabase
        .from('atendimento_humano')
        .select('*')
        .eq('phone', telefone)
        .eq('ativo', true)
        .maybeSingle()

      if (lead) {
        setLeadAtivo(lead)
        setReservas(reservasData || [])
      }
    } catch (error) {
      console.error("[WhatsApp Page] Erro ao carregar conversa:", error)
    }
  }

  const conversasFiltradas = conversas.filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefone.includes(searchTerm)
  )

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="border-b-2 border-[#8B2E3D]/20 bg-white p-3 md:p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-[#8B2E3D] flex items-center gap-2 md:gap-3">
              <Phone className="h-6 w-6 md:h-8 md:w-8" />
              WhatsApp
            </h1>
            <p className="text-[#8B2E3D]/70 text-xs md:text-sm mt-1">Atendimento via WhatsApp</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
            <Button
              onClick={carregarConversas}
              variant="outline"
              size="sm"
              disabled={loading}
              className="border-[#8B2E3D] text-[#8B2E3D] hover:bg-[#8B2E3D] hover:text-white"
            >
              {loading ? "Atualizando..." : "Atualizar"}
            </Button>
            <EvolutionStatus />
          </div>
        </div>
      </div>

      {/* Main Content - Layout WhatsApp Web */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Lista de Conversas (Esquerda) */}
        <div className={`${telefoneSelecionado ? 'hidden md:flex' : 'flex'} w-full md:w-96 border-r-2 border-[#8B2E3D]/20 bg-[#F5F0E8]/30 flex-col`}>
          {/* Busca */}
          <div className="p-4 border-b border-[#8B2E3D]/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B2E3D]/60" />
              <Input
                type="text"
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-2 border-[#8B2E3D]/20 focus:border-[#8B2E3D]"
              />
            </div>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="divide-y divide-[#8B2E3D]/10">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-4 animate-pulse">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-full bg-gray-300"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : erroConexao ? (
              <div className="p-8 text-center">
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                  <Phone className="h-12 w-12 mx-auto mb-4 text-red-600 opacity-50" />
                  <p className="font-semibold text-red-800 mb-2">Erro de Conexão</p>
                  <p className="text-sm text-red-700 mb-4">{erroConexao}</p>
                  <Button
                    onClick={carregarConversas}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Tentar Novamente
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Verifique se a Evolution API está configurada e conectada
                </p>
              </div>
            ) : conversasFiltradas.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Nenhuma conversa encontrada</p>
                <p className="text-sm mt-2">
                  {conversas.length === 0 
                    ? "Conecte o WhatsApp na Evolution API para ver as conversas"
                    : "Nenhuma conversa corresponde à sua busca"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#8B2E3D]/10">
                {conversasFiltradas.map((conversa) => {
                  const isActive = telefoneSelecionado === conversa.telefone
                  return (
                    <div
                      key={conversa.telefone}
                      onClick={() => router.push(`/whatsapp?telefone=${encodeURIComponent(conversa.telefone)}`)}
                      className={`p-4 cursor-pointer transition-all hover:bg-[#8B2E3D]/5 ${
                        isActive ? 'bg-[#8B2E3D]/10 border-l-4 border-[#8B2E3D]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar (sempre mostrar inicial, foto fica de plano de fundo se tiver) */}
                        <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-[#8B2E3D] to-[#7A1F2E] flex items-center justify-center text-white font-bold text-lg flex-shrink-0 border-2 border-[#8B2E3D]/20">
                          {conversa.nome?.charAt(0)?.toUpperCase() || conversa.telefone?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">{conversa.nome}</h3>
                            <span className="text-xs text-gray-600 font-medium flex-shrink-0 ml-2">
                              {(() => {
                                try {
                                  let timestamp = conversa.timestamp || Date.now()
                                  
                                  // Se for Unix timestamp em segundos, converter para ms
                                  if (timestamp < 10000000000) {
                                    timestamp = timestamp * 1000
                                  }
                                  
                                  const date = new Date(timestamp)
                                  const hoje = new Date()
                                  const ontem = new Date(hoje)
                                  ontem.setDate(ontem.getDate() - 1)
                                  
                                  // Se for hoje, mostrar só hora
                                  if (date.toDateString() === hoje.toDateString()) {
                                    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                                  }
                                  // Se for ontem
                                  if (date.toDateString() === ontem.toDateString()) {
                                    return 'Ontem'
                                  }
                                  // Se for este ano, mostrar dia/mês
                                  if (date.getFullYear() === hoje.getFullYear()) {
                                    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                                  }
                                  // Senão, mostrar dia/mês/ano
                                  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
                                } catch (e) {
                                  return ''
                                }
                              })()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate flex-1">
                              {conversa.ultimaMensagem || 'Sem mensagens'}
                            </p>
                            {conversa.atendimentoHumano && (
                              <Badge className="ml-2 bg-green-600 text-white text-xs flex-shrink-0">
                                <User className="h-3 w-3 mr-1" />
                                Humano
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Área de Chat (Direita) */}
        <div className={`${telefoneSelecionado ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white`}>
          {telefoneSelecionado && leadAtivo ? (
            <>
              {/* Botão Voltar Mobile */}
              <div className="md:hidden border-b border-[#8B2E3D]/20 p-3 bg-white">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/whatsapp')}
                  className="gap-2 text-[#8B2E3D]"
                >
                  <Phone className="h-4 w-4 rotate-180" />
                  Voltar
                </Button>
              </div>
              <ChatInterface
                lead={leadAtivo}
                conversas={conversasMensagens}
                reservas={reservas}
                telefone={telefoneSelecionado}
                remoteJid={conversaAtiva?.remoteJid}
                atendimentoHumanoAtivo={conversaAtiva?.atendimentoHumano || false}
                profilePicUrl={conversaAtiva?.profilePicUrl || null}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#F5F0E8] to-white">
              <div className="text-center p-8">
                <MessageSquare className="h-24 w-24 text-[#8B2E3D]/30 mx-auto mb-6" />
                <h2 className="text-2xl font-serif font-bold text-[#8B2E3D] mb-2">
                  Selecione uma conversa
                </h2>
                <p className="text-[#8B2E3D]/70">
                  Escolha uma conversa da lista para começar a conversar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
