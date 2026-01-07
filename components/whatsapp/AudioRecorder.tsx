"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, X, Send } from "lucide-react"
import { toast } from "sonner"

interface AudioRecorderProps {
  telefone: string
  onAudioSent: () => void
  onCancel: () => void
}

export default function AudioRecorder({ telefone, onAudioSent, onCancel }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    return () => {
      // Limpar recursos ao desmontar
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        // Parar todas as tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Atualizar tempo de gravação
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error)
      toast.error("Erro ao acessar microfone. Verifique as permissões.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }

  const cancelRecording = () => {
    stopRecording()
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    onCancel()
  }

  const sendAudio = async () => {
    if (!audioBlob) return

    try {
      // Converter blob para base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = reader.result as string
          // Remover o prefixo data:audio/webm;base64,
          const base64Data = base64String.split(',')[1]
          resolve(base64Data)
        }
        reader.onerror = reject
        reader.readAsDataURL(audioBlob)
      })

      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefone,
          mediaType: 'audio',
          media: base64,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao enviar áudio")
      }

      toast.success("Áudio enviado!")
      setAudioBlob(null)
      setAudioUrl(null)
      setRecordingTime(0)
      onAudioSent()
    } catch (error: any) {
      console.error("Erro ao enviar áudio:", error)
      toast.error(error.message || "Erro ao enviar áudio")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="border-t-2 border-[#8B2E3D]/20 bg-[#F5F0E8]/30 p-4">
      {!isRecording && !audioBlob && (
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={startRecording}
            className="bg-red-600 hover:bg-red-700 text-white h-14 w-14 rounded-full shadow-lg animate-pulse"
          >
            <Mic className="h-6 w-6" />
          </Button>
          <p className="text-sm text-gray-600">Clique para gravar</p>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:text-red-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {isRecording && (
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 bg-red-600 rounded-full animate-pulse" />
            <span className="text-lg font-bold text-red-600">{formatTime(recordingTime)}</span>
          </div>
          <Button
            onClick={stopRecording}
            className="bg-red-600 hover:bg-red-700 text-white h-12 w-12 rounded-full"
          >
            <Square className="h-5 w-5" />
          </Button>
          <p className="text-sm text-gray-600">Gravando...</p>
        </div>
      )}

      {audioBlob && audioUrl && !isRecording && (
        <div className="flex items-center justify-center gap-4">
          <audio src={audioUrl} controls className="flex-1 max-w-md" />
          <div className="flex gap-2">
            <Button
              onClick={sendAudio}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
            <Button
              onClick={cancelRecording}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

