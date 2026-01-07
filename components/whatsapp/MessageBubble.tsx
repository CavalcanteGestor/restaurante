"use client"

import { useState } from "react"
import { formatDateTime } from "@/lib/utils/date"
import { Check, CheckCheck, Reply, Trash2, MoreVertical, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MessageBubbleProps {
  message: {
    id: string
    fromMe: boolean
    message: string
    timestamp: string
  }
  onReply?: (message: any) => void
  onDelete?: (messageId: string) => void
}

export default function MessageBubble({ message, onReply, onDelete }: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false)
  
  const isMedia = message.message.startsWith('[') && message.message.includes(']')
  const mediaType = isMedia ? message.message.match(/\[(.*?)\]/)?.[1] : null

  return (
    <div
      className={`flex items-end gap-2 mb-2 group ${
        message.fromMe ? 'justify-end' : 'justify-start'
      }`}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* Menu de ações (aparece no hover) */}
      {showMenu && !message.fromMe && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {onReply && (
              <DropdownMenuItem onClick={() => onReply(message)}>
                <Reply className="h-4 w-4 mr-2" />
                Responder
              </DropdownMenuItem>
            )}
            {onDelete && message.fromMe && (
              <DropdownMenuItem onClick={() => onDelete(message.id)} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Bolha da mensagem */}
      <div
        className={`relative max-w-[65%] rounded-lg px-4 py-2 shadow-sm ${
          message.fromMe
            ? 'bg-gradient-to-br from-[#8B2E3D] to-[#7A1F2E] text-white'
            : 'bg-white border-2 border-gray-100 text-gray-900'
        }`}
      >
        {/* Conteúdo da mensagem */}
        <div className="break-words">
          {mediaType ? (
            <div className="flex items-center gap-2 mb-1">
              {mediaType === 'Imagem' && (
                <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center">
                  📷
                </div>
              )}
              {mediaType === 'Áudio' && (
                <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center">
                  🎵
                </div>
              )}
              {mediaType === 'Documento' && (
                <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                  📄
                </div>
              )}
              {mediaType === 'Vídeo' && (
                <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
                  🎥
                </div>
              )}
              <span className="text-sm">{message.message}</span>
            </div>
          ) : (
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.message}</p>
          )}
        </div>

        {/* Timestamp e status */}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span
            className={`text-[11px] font-medium ${
              message.fromMe ? 'text-white/80' : 'text-gray-600'
            }`}
          >
            {(() => {
              try {
                let timestamp = typeof message.timestamp === 'number' 
                  ? message.timestamp 
                  : parseInt(String(message.timestamp))
                
                // Se for Unix timestamp em segundos (< 10000000000), converter para ms
                if (timestamp < 10000000000) {
                  timestamp = timestamp * 1000
                }
                
                if (isNaN(timestamp)) return '--:--'
                
                const date = new Date(timestamp)
                return date.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })
              } catch (e) {
                return '--:--'
              }
            })()}
          </span>
          
          {/* Status de leitura (apenas para mensagens enviadas) */}
          {message.fromMe && (
            <CheckCheck className={`h-4 w-4 ${message.fromMe ? 'text-blue-300' : 'text-gray-400'}`} />
          )}
        </div>

        {/* Triângulo da bolha */}
        <div
          className={`absolute bottom-0 ${
            message.fromMe
              ? 'right-[-8px] border-l-8 border-l-[#7A1F2E] border-t-8 border-t-transparent'
              : 'left-[-8px] border-r-8 border-r-white border-t-8 border-t-transparent'
          }`}
        />
      </div>

      {/* Menu de ações (direita - para mensagens enviadas) */}
      {showMenu && message.fromMe && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onDelete && (
              <DropdownMenuItem onClick={() => onDelete(message.id)} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

