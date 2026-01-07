"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EvolutionStatus() {
  const [status, setStatus] = useState<{
    configured: boolean
    connected: boolean
    loading: boolean
    error?: string
  }>({
    configured: false,
    connected: false,
    loading: true,
  })

  const checkStatus = async () => {
    setStatus(prev => ({ ...prev, loading: true }))
    try {
      const response = await fetch("/api/whatsapp/status")
      const data = await response.json()
      setStatus({
        configured: data.configured || false,
        connected: data.connected || false,
        loading: false,
        error: data.error,
      })
    } catch (error: any) {
      setStatus({
        configured: false,
        connected: false,
        loading: false,
        error: error.message || "Erro ao verificar status",
      })
    }
  }

  useEffect(() => {
    checkStatus()
    // Verificar status a cada 30 segundos
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  if (status.loading) {
    return (
      <Alert className="border-gray-200 bg-gray-50">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Verificando conexão...</AlertTitle>
        <AlertDescription>Verificando status da Evolution API</AlertDescription>
      </Alert>
    )
  }

  if (!status.configured) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <XCircle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Evolution API não configurada</AlertTitle>
        <AlertDescription className="text-yellow-700">
          Configure as variáveis de ambiente EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE_NAME
        </AlertDescription>
      </Alert>
    )
  }

  if (!status.connected) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <WifiOff className="h-4 w-4 text-red-600" />
            <div>
              <AlertTitle className="text-red-800">WhatsApp desconectado</AlertTitle>
              <AlertDescription className="text-red-700">
                A instância do WhatsApp não está conectada. Verifique a conexão no Evolution API.
                {status.error && ` Erro: ${status.error}`}
              </AlertDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkStatus}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Verificar
          </Button>
        </div>
      </Alert>
    )
  }

  return (
    <Alert className="border-green-200 bg-green-50">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <Wifi className="h-4 w-4 text-green-600" />
          <div>
            <AlertTitle className="text-green-800">WhatsApp conectado</AlertTitle>
            <AlertDescription className="text-green-700">
              A instância está conectada e pronta para enviar mensagens
            </AlertDescription>
          </div>
        </div>
        <Badge className="bg-green-600 text-white gap-1">
          <CheckCircle className="h-3 w-3" />
          Online
        </Badge>
      </div>
    </Alert>
  )
}

