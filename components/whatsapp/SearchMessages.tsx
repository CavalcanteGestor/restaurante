"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Search } from "lucide-react"
import { WhatsAppMessage } from "./ChatInterface"

interface SearchMessagesProps {
  messages: WhatsAppMessage[]
  onClose: () => void
  onMessageClick: (messageId: string) => void
}

export default function SearchMessages({ messages, onClose, onMessageClick }: SearchMessagesProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredMessages = messages.filter((msg) =>
    msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 bg-white z-50 flex flex-col">
      {/* Header de busca */}
      <div className="p-4 border-b-2 border-[#8B2E3D]/20">
        <div className="flex items-center gap-2">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:text-[#8B2E3D]"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar mensagens..."
              className="pl-10 border-2 border-[#8B2E3D]/20 focus:border-[#8B2E3D]"
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="flex-1 overflow-y-auto p-4">
        {searchTerm ? (
          <>
            {filteredMessages.length > 0 ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  {filteredMessages.length} {filteredMessages.length === 1 ? 'mensagem encontrada' : 'mensagens encontradas'}
                </p>
                <div className="space-y-2">
                  {filteredMessages.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => {
                        onMessageClick(msg.id)
                        onClose()
                      }}
                      className="w-full text-left p-4 bg-gray-50 hover:bg-[#8B2E3D]/5 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[#8B2E3D]">
                          {msg.fromMe ? "Você" : "Contato"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.timestamp).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{msg.message}</p>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600 font-medium">Nenhuma mensagem encontrada</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Tente buscar por outras palavras
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 font-medium">Buscar mensagens</p>
              <p className="text-sm text-gray-500 mt-2">
                Digite acima para buscar nas mensagens
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

