"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, Eye, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ConfiguracaoMensagem {
  id: string
  tipo: string
  template: string
  ativo: boolean
  posicao_nome: string
  placeholder_nome: string
}

interface ConfigurarMensagemProps {
  tipo: string
  configuracao?: ConfiguracaoMensagem
  onSave?: () => void
}

export default function ConfigurarMensagem({ 
  tipo, 
  configuracao: initialConfig,
  onSave 
}: ConfigurarMensagemProps) {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoMensagem | null>(initialConfig || null)
  const [template, setTemplate] = useState(initialConfig?.template || '')
  const [posicaoNome, setPosicaoNome] = useState(initialConfig?.posicao_nome || 'inicio')
  const [placeholderNome, setPlaceholderNome] = useState(initialConfig?.placeholder_nome || '{nome}')
  const [ativo, setAtivo] = useState(initialConfig?.ativo ?? true)
  const [loading, setLoading] = useState(false)
  const [previewNome, setPreviewNome] = useState('Maria Silva')

  useEffect(() => {
    if (initialConfig) {
      setConfiguracao(initialConfig)
      setTemplate(initialConfig.template)
      setPosicaoNome(initialConfig.posicao_nome)
      setPlaceholderNome(initialConfig.placeholder_nome)
      setAtivo(initialConfig.ativo)
    }
  }, [initialConfig])

  const processarPreview = (texto: string) => {
    return texto
      .replace(/{nome}/g, previewNome)
      .replace(/{horario_reserva}/g, '19:00')
      .replace(/{data_reserva}/g, '15/01/2026')
      .replace(/{numero_pessoas}/g, '4')
      .replace(/{mesas}/g, 'Mesa 5')
  }

  const handleSave = async () => {
    if (!template.trim()) {
      toast.error('Template não pode estar vazio')
      return
    }

    if (!template.includes(placeholderNome)) {
      toast.warning(`Template deve conter o placeholder "${placeholderNome}"`)
      return
    }

    setLoading(true)
    try {
      const url = configuracao?.id
        ? '/api/automatizacoes/configuracoes-mensagens'
        : '/api/automatizacoes/configuracoes-mensagens'
      
      const method = configuracao?.id ? 'PUT' : 'POST'
      
      const body = configuracao?.id
        ? {
            id: configuracao.id,
            template,
            posicao_nome: posicaoNome,
            placeholder_nome: placeholderNome,
            ativo,
          }
        : {
            tipo,
            template,
            posicao_nome: posicaoNome,
            placeholder_nome: placeholderNome,
            ativo,
          }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar configuração')
      }

      toast.success('Configuração salva com sucesso!')
      setConfiguracao(result.configuracao)
      onSave?.()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar configuração')
    } finally {
      setLoading(false)
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'nao_comparecimento':
        return 'Não Comparecimento'
      case 'atraso':
        return 'Atraso'
      case 'lembrete':
        return 'Lembrete'
      default:
        return tipo
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">
              Configurar Mensagem: {getTipoLabel(tipo)}
            </CardTitle>
            <CardDescription>
              Personalize a mensagem automática enviada para clientes
            </CardDescription>
          </div>
          <Badge variant={ativo ? "default" : "secondary"}>
            {ativo ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ativar/Desativar */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label className="text-base font-semibold">Status</Label>
            <p className="text-sm text-gray-600">
              {ativo ? 'Mensagem será enviada automaticamente' : 'Mensagem desativada'}
            </p>
          </div>
          <Switch checked={ativo} onCheckedChange={setAtivo} />
        </div>

        {/* Template da Mensagem */}
        <div className="space-y-2">
          <Label htmlFor="template" className="text-base font-semibold">
            Template da Mensagem
          </Label>
          <p className="text-sm text-gray-600 mb-2">
            Use <code className="bg-gray-100 px-1 rounded">{placeholderNome}</code> para o nome,{' '}
            <code className="bg-gray-100 px-1 rounded">{'{horario_reserva}'}</code> para horário,{' '}
            <code className="bg-gray-100 px-1 rounded">{'{data_reserva}'}</code> para data,{' '}
            <code className="bg-gray-100 px-1 rounded">{'{numero_pessoas}'}</code> para número de pessoas,{' '}
            <code className="bg-gray-100 px-1 rounded">{'{mesas}'}</code> para mesas
          </p>
          <Textarea
            id="template"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            placeholder="Olá {nome}! Notamos que você tinha uma reserva..."
            className="min-h-[120px] font-mono text-sm"
          />
        </div>

        {/* Configurações de Nome */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="posicao_nome">Posição do Nome</Label>
            <Select value={posicaoNome} onValueChange={setPosicaoNome}>
              <SelectTrigger id="posicao_nome">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inicio">No início</SelectItem>
                <SelectItem value="meio">No meio</SelectItem>
                <SelectItem value="fim">No fim</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="placeholder_nome">Placeholder do Nome</Label>
            <Input
              id="placeholder_nome"
              value={placeholderNome}
              onChange={(e) => setPlaceholderNome(e.target.value)}
              placeholder="{nome}"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Preview</Label>
            <div className="flex items-center gap-2">
              <Input
                value={previewNome}
                onChange={(e) => setPreviewNome(e.target.value)}
                placeholder="Nome para preview"
                className="w-40 h-8 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewNome('Maria Silva')}
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="p-4 bg-gray-50 border rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {processarPreview(template)}
            </p>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={loading || !template.trim()}
            className="flex-1 bg-gradient-to-r from-[#8B2E3D] to-[#7A1F2E] hover:from-[#7A1F2E] hover:to-[#8B2E3D] text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Configuração'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

