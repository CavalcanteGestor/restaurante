"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, Smile, Mic, X, Image as ImageIcon, FileText, MapPin } from "lucide-react"
import { toast } from "sonner"
import dynamic from "next/dynamic"
import AudioRecorder from "./AudioRecorder"

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false })

interface MessageInputProps {
  telefone: string
  onMessageSent: () => void
  replyTo?: { id: string; message: string; from: string } | null
  onCancelReply?: () => void
}

export default function MessageInput({ telefone, onMessageSent, replyTo, onCancelReply }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleSendMessage = async () => {
    if (!message.trim() || loading) return

    const messageText = message.trim()
    setMessage("")
    setLoading(true)

    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefone,
          message: messageText,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao enviar mensagem")
      }

      // Atualizar contexto do lead
      await fetch("/api/leads/update-contexto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefone,
          contexto: `Recepcionista enviou: ${messageText}`,
        }),
      })

      toast.success("Mensagem enviada!")
      onMessageSent()
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error)
      toast.error(error.message || "Erro ao enviar mensagem")
      setMessage(messageText)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      // Converter para base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefone,
          mediaType: type,
          media: base64,
          caption: message.trim() || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao enviar mídia")
      }

      setMessage("")
      toast.success(`${type === 'image' ? 'Imagem' : 'Documento'} enviado!`)
      onMessageSent()
    } catch (error: any) {
      console.error("Erro ao enviar mídia:", error)
      toast.error(error.message || "Erro ao enviar mídia")
    } finally {
      setLoading(false)
      setShowAttachMenu(false)
    }
  }

  return (
    <div className="border-t-2 border-[#8B2E3D]/20 bg-[#F5F0E8]/30 p-4">
      {/* Reply Preview */}
      {replyTo && (
        <div className="mb-2 bg-white rounded-lg p-3 border-l-4 border-[#8B2E3D] flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#8B2E3D]">{replyTo.from}</p>
            <p className="text-sm text-gray-600 truncate">{replyTo.message}</p>
          </div>
          <Button
            onClick={onCancelReply}
            variant="ghost"
            size="sm"
            className="ml-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attach Menu */}
        <div className="relative">
          <Button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:text-[#8B2E3D] hover:bg-[#8B2E3D]/10"
            disabled={loading}
          >
            {showAttachMenu ? <X className="h-5 w-5" /> : <Paperclip className="h-5 w-5" />}
          </Button>

          {showAttachMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-2xl border-2 border-[#8B2E3D]/20 p-2 min-w-[200px]">
              <button
                onClick={() => imageInputRef.current?.click()}
                className="w-full flex items-center gap-3 p-3 hover:bg-[#8B2E3D]/5 rounded-lg transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-gray-700 font-medium">Imagem</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 p-3 hover:bg-[#8B2E3D]/5 rounded-lg transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">Documento</span>
              </button>
            </div>
          )}

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e, 'image')}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            onChange={(e) => handleFileSelect(e, 'document')}
            className="hidden"
          />
        </div>

        {/* Message Input */}
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite uma mensagem..."
            disabled={loading}
            className="bg-white border-2 border-[#8B2E3D]/20 focus:border-[#8B2E3D] pr-12 rounded-xl"
          />
          <Button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#8B2E3D] hover:bg-transparent"
            disabled={loading}
          >
            <Smile className="h-5 w-5" />
          </Button>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 z-50">
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setMessage(message + emojiData.emoji)
                  setShowEmojiPicker(false)
                }}
                width={350}
                height={400}
              />
            </div>
          )}
        </div>

        {/* Send/Mic Button */}
        {message.trim() ? (
          <Button
            onClick={handleSendMessage}
            disabled={loading}
            className="bg-[#8B2E3D] hover:bg-[#7A1F2E] text-white h-12 w-12 rounded-full shadow-lg"
          >
            <Send className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            onClick={() => setShowAudioRecorder(true)}
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:text-[#8B2E3D] hover:bg-[#8B2E3D]/10 h-12 w-12 rounded-full"
            disabled={loading}
            title="Gravar áudio"
          >
            <Mic className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Audio Recorder */}
      {showAudioRecorder && (
        <AudioRecorder
          telefone={telefone}
          onAudioSent={() => {
            setShowAudioRecorder(false)
            onMessageSent()
          }}
          onCancel={() => setShowAudioRecorder(false)}
        />
      )}
    </div>
  )
}

