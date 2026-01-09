"use client"

import { useState, useEffect } from "react"
import { Database } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Search, Save, RefreshCw, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { formatDateTime } from "@/lib/utils/date"

type Lead = Database['public']['Tables']['leads']['Row']

export default function ContextoEditor() {
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [telefone, setTelefone] = useState("")
  const [contexto, setContexto] = useState("")

  async function buscarLead() {
    if (!telefone.trim()) {
      toast.error("Digite um telefone para buscar")
      return
    }

    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('telefone', telefone.trim())
        .maybeSingle()

      if (error) throw error

      if (!data) {
        toast.error("Lead não encontrado com este telefone")
        setLead(null)
        setContexto("")
        return
      }

      setLead(data)
      setContexto(data.contexto || "")
      toast.success("Lead encontrado!")
    } catch (error: any) {
      console.error("Erro ao buscar lead:", error)
      toast.error(error.message || "Erro ao buscar lead")
      setLead(null)
      setContexto("")
    } finally {
      setLoading(false)
    }
  }

  async function salvarContexto() {
    if (!lead) {
      toast.error("Nenhum lead selecionado")
      return
    }

    try {
      setSaving(true)
      const supabase = createClient()

      const { error } = await supabase
        .from('leads')
        .update({ 
          contexto: contexto.trim() || null,
          data_ultima_msg: new Date().toISOString(),
        })
        .eq('id', lead.id)

      if (error) throw error

      toast.success("Contexto atualizado com sucesso!")
      
      // Atualizar lead local
      setLead({
        ...lead,
        contexto: contexto.trim() || null,
      })
    } catch (error: any) {
      console.error("Erro ao salvar contexto:", error)
      toast.error(error.message || "Erro ao salvar contexto")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="shadow-xl border-2 border-[#8B2E3D]/20">
      <CardHeader className="border-b-2 border-[#8B2E3D]/10 bg-gradient-to-r from-[#8B2E3D]/5 to-transparent">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <User className="h-5 w-5" />
          Editor de Contexto dos Leads
        </CardTitle>
        <CardDescription>
          Visualize e edite o contexto mantido pela IA para cada cliente
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* Busca */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-700" />
            <Input
              type="text"
              placeholder="Buscar por telefone..."
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  buscarLead()
                }
              }}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          <Button
            onClick={buscarLead}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </>
            )}
          </Button>
        </div>

        {/* Informações do Lead */}
        {lead && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">Nome:</p>
                  <p className="text-gray-900 font-semibold">{lead.nome}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Telefone:</p>
                  <p className="text-gray-900 font-mono">{lead.telefone}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Etapa:</p>
                  <p className="text-gray-900">{lead.etapa || "Sem etapa"}</p>
                </div>
                {lead.data_ultima_msg && (
                  <div>
                    <p className="text-gray-600 font-medium">Última Mensagem:</p>
                    <p className="text-gray-900">{formatDateTime(lead.data_ultima_msg)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Editor de Contexto */}
            <div className="space-y-2">
              <Label htmlFor="contexto">Contexto do Cliente</Label>
              <Textarea
                id="contexto"
                value={contexto}
                onChange={(e) => setContexto(e.target.value)}
                placeholder="O contexto será exibido aqui. Edite conforme necessário..."
                rows={12}
                className="font-mono text-sm bg-gray-50 border-gray-200 focus:bg-white"
              />
              <p className="text-xs text-gray-600">
                Este contexto é usado pela IA para manter a memória das interações com o cliente.
                Edite com cuidado para não perder informações importantes.
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <Button
                onClick={salvarContexto}
                disabled={saving || !contexto.trim()}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Contexto
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setContexto(lead.contexto || "")
                  toast.info("Contexto restaurado")
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Restaurar
              </Button>
            </div>
          </div>
        )}

        {!lead && !loading && (
          <div className="text-center py-12 text-gray-600">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="font-medium">Nenhum lead selecionado</p>
            <p className="text-sm mt-1">Busque por telefone para visualizar e editar o contexto</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

