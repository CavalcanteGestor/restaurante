"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdicionarMesasForm() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; total?: number } | null>(null)

  const handleAdicionarMesas = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/mesas/adicionar-todas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao adicionar mesas")
      }

      setResult({
        success: true,
        message: data.message,
        total: data.total,
      })

      toast({
        title: "Mesas adicionadas com sucesso!",
        description: `${data.total} mesas processadas.`,
      })
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Erro ao adicionar mesas",
      })

      toast({
        title: "Erro ao adicionar mesas",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleAdicionarMesas}
        disabled={loading}
        className="w-full bg-[#8B2E3D] hover:bg-[#7A1F2E] text-white"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Adicionando mesas...
          </>
        ) : (
          <>
            Adicionar Todas as Mesas
          </>
        )}
      </Button>

      {result && (
        <Alert
          className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
        >
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle className={result.success ? "text-green-800" : ""}>
            {result.success ? "Sucesso!" : "Erro"}
          </AlertTitle>
          <AlertDescription className={result.success ? "text-green-700" : ""}>
            {result.message}
            {result.total && (
              <span className="block mt-1 font-semibold">
                Total de mesas: {result.total}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

