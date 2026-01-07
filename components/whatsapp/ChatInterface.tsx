"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Phone, MoreVertical, Search, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/utils/date"
import { Database } from "@/types/database"
import MessageBubble from "./MessageBubble"
import MessageInput from "./MessageInput"
import SearchMessages from "./SearchMessages"
import ImagePreview from "./ImagePreview"
import DateSeparator from "./DateSeparator"

type Lead = Database['public']['Tables']['leads']['Row']
type Reserva = Database['public']['Tables']['reservas']['Row']

export interface WhatsAppMessage {
  id: string
  fromMe: boolean
  message: string
  timestamp: string
}

interface ChatInterfaceProps {
  lead: Lead
  conversas: WhatsAppMessage[]
  reservas: Reserva[]
  telefone: string
  remoteJid?: string // remoteJid REAL para buscar mensagens
  atendimentoHumanoAtivo?: boolean
  profilePicUrl?: string | null
}

export default function ChatInterface({
  lead,
  conversas,
  reservas,
  telefone,
  remoteJid,
  atendimentoHumanoAtivo = false,
  profilePicUrl = null,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState(conversas)
  const [replyTo, setReplyTo] = useState<WhatsAppMessage | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [imagePreview, setImagePreview] = useState<{ url: string; caption?: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    setMessages(conversas)
  }, [conversas])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleMessageSent = async () => {
    // Recarregar mensagens após envio (com delay para dar tempo da Evolution processar)
    setTimeout(async () => {
      try {
        const jid = remoteJid || `${telefone}@s.whatsapp.net`
        const response = await fetch(`/api/whatsapp/messages?remoteJid=${encodeURIComponent(jid)}&limit=100`, {
          cache: 'no-store',
        })
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.messages) {
            const mensagensFormatadas: WhatsAppMessage[] = data.messages.map((msg: any) => ({
              id: String(msg.id || Math.random()),
              fromMe: Boolean(msg.fromMe),
              message: String(msg.message || ''),
              timestamp: String(msg.timestamp || Date.now()),
            }))
            setMessages(mensagensFormatadas)
          }
        }
      } catch (error) {
        console.error("Erro ao recarregar mensagens:", error)
      }
    }, 1500)
  }

  const handleReply = (message: WhatsAppMessage) => {
    setReplyTo(message)
  }

  const handleDelete = async (messageId: string) => {
    // TODO: Implementar deletar mensagem via API
    console.log("Deletar mensagem:", messageId)
  }

  const handleMessageClick = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
      element.classList.add("animate-pulse")
      setTimeout(() => element.classList.remove("animate-pulse"), 2000)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F0E8]/20">
      {/* Header do Chat */}
      <div className="bg-white border-b-2 border-[#8B2E3D]/20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar (sempre mostrar inicial) */}
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#8B2E3D] to-[#7A1F2E] flex items-center justify-center text-white font-bold text-lg border-2 border-[#8B2E3D]/20">
            {lead.nome?.charAt(0)?.toUpperCase() || telefone?.charAt(0) || '?'}
          </div>
          
          {/* Info do contato */}
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {lead.nome || telefone || "Sem nome"}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">
                {telefone}
                {messages.length > 0 && (
                  <span className="text-gray-400 ml-2">
                    • {messages.length} {messages.length === 1 ? 'mensagem' : 'mensagens'}
                  </span>
                )}
              </p>
              {atendimentoHumanoAtivo && (
                <Badge className="bg-green-600 text-white text-xs">
                  Atendimento Humano
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Ações do header */}
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => {
              setShowSearch(true)
              setShowInfo(false)
            }}
            variant="ghost" 
            size="icon" 
            className="text-gray-600 hover:text-[#8B2E3D] hover:bg-[#8B2E3D]/10"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-600 hover:text-[#8B2E3D] hover:bg-[#8B2E3D]/10"
            onClick={() => setShowInfo(!showInfo)}
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Busca de mensagens */}
      {showSearch && (
        <SearchMessages
          messages={messages}
          onClose={() => setShowSearch(false)}
          onMessageClick={handleMessageClick}
        />
      )}

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-[#F5F0E8]/30 to-[#F5F0E8]/10">
        {/* Mensagens */}
        {messages.length > 0 ? (
          <>
            {messages.map((msg, index) => {
              // Verificar se precisa mostrar separador de data
              const showDateSeparator = index === 0 || (() => {
                try {
                  const currentMsgDate = new Date(typeof msg.timestamp === 'number' ? msg.timestamp : parseInt(msg.timestamp))
                  const prevMsgDate = new Date(typeof messages[index - 1].timestamp === 'number' ? messages[index - 1].timestamp : parseInt(messages[index - 1].timestamp))
                  
                  return currentMsgDate.toDateString() !== prevMsgDate.toDateString()
                } catch (e) {
                  return false
                }
              })()

              return (
                <div key={msg.id}>
                  {showDateSeparator && <DateSeparator date={msg.timestamp} />}
                  <div id={`message-${msg.id}`}>
                    <MessageBubble
                      message={msg}
                      onReply={handleReply}
                      onDelete={handleDelete}
                    />
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <div className="h-24 w-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#8B2E3D]/20 to-[#7A1F2E]/20 flex items-center justify-center">
                <Phone className="h-12 w-12 text-[#8B2E3D]/60" />
              </div>
              <p className="text-gray-600 text-lg font-medium mb-2">Nenhuma mensagem ainda</p>
              <p className="text-gray-500 text-sm">Envie a primeira mensagem para iniciar a conversa</p>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar com informações */}
      {showInfo && (
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white border-l-2 border-[#8B2E3D]/20 p-6 overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#8B2E3D]">Informações do Contato</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowInfo(false)}>
              ×
            </Button>
          </div>

          {/* Foto e nome */}
          <div className="text-center mb-6">
            <div className="h-32 w-32 mx-auto rounded-full bg-gradient-to-br from-[#8B2E3D] to-[#7A1F2E] flex items-center justify-center text-white font-bold text-5xl mb-4 border-4 border-[#8B2E3D]/20">
              {lead.nome?.charAt(0)?.toUpperCase() || telefone?.charAt(0) || '?'}
            </div>
            <h4 className="text-xl font-bold text-gray-900">{lead.nome || telefone || "Sem nome"}</h4>
            <p className="text-gray-600">{telefone}</p>
          </div>

          {/* Etapa do lead */}
          {lead.etapa && (
            <div className="mb-6 p-4 bg-[#8B2E3D]/5 rounded-xl">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Etapa</h5>
              <Badge className="bg-[#8B2E3D] text-white capitalize">{lead.etapa}</Badge>
            </div>
          )}

          {/* Contexto */}
          {lead.contexto && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Contexto</h5>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{lead.contexto}</p>
            </div>
          )}

          {/* Reservas */}
          {reservas.length > 0 && (
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Reservas ({reservas.length})
              </h5>
              <div className="space-y-2">
                {reservas.map((reserva) => (
                  <Card key={reserva.id} className="p-3 border-2 border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {reserva.etapa || "N/A"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(reserva.data_reserva).split(' às ')[0]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>{reserva.numero_pessoas}</strong> pessoas • {reserva.turno}
                    </p>
                    {reserva.observacao && (
                      <p className="text-xs text-gray-500 mt-1">{reserva.observacao}</p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input de mensagem */}
      <MessageInput
        telefone={telefone}
        onMessageSent={handleMessageSent}
        replyTo={replyTo ? {
          id: replyTo.id,
          message: replyTo.message,
          from: replyTo.fromMe ? "Você" : (lead.nome || telefone)
        } : undefined}
        onCancelReply={() => setReplyTo(null)}
      />

      {/* Preview de imagem */}
      {imagePreview && (
        <ImagePreview
          imageUrl={imagePreview.url}
          caption={imagePreview.caption}
          onClose={() => setImagePreview(null)}
        />
      )}
    </div>
  )
}
