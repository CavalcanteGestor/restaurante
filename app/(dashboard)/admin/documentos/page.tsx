"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText, Upload, Trash2, Eye, Send } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface Documento {
  id: string
  tipo: 'cardapio' | 'cartela_videos' | 'restaurante'
  titulo: string
  descricao: string | null
  arquivo_url: string
  arquivo_nome: string
  arquivo_tamanho: number | null
  ativo: boolean
  ordem: number
  created_at: string | null
  updated_at: string | null
}

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form state
  const [tipo, setTipo] = useState<'cardapio' | 'cartela_videos' | 'restaurante'>('cardapio')
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [arquivo, setArquivo] = useState<File | null>(null)

  useEffect(() => {
    carregarDocumentos()
  }, [])

  const carregarDocumentos = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/documentos")
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Erro ao carregar documentos")
      }

      setDocumentos(data.documentos || [])
    } catch (error: any) {
      console.error("Erro ao carregar documentos:", error)
      toast.error(error.message || "Erro ao carregar documentos")
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!arquivo || !titulo) {
      toast.error("Preencha título e selecione um arquivo")
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append('file', arquivo)
      formData.append('tipo', tipo)
      formData.append('titulo', titulo)
      if (descricao) formData.append('descricao', descricao)

      const response = await fetch("/api/documentos/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao fazer upload")
      }

      toast.success("Upload realizado com sucesso!")
      setUploadDialogOpen(false)
      setTitulo("")
      setDescricao("")
      setArquivo(null)
      carregarDocumentos()
    } catch (error: any) {
      console.error("Erro no upload:", error)
      toast.error(error.message || "Erro ao fazer upload")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este documento?")) {
      return
    }

    try {
      const response = await fetch(`/api/documentos/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao excluir")
      }

      toast.success("Documento excluído com sucesso!")
      carregarDocumentos()
    } catch (error: any) {
      console.error("Erro ao excluir:", error)
      toast.error(error.message || "Erro ao excluir documento")
    }
  }

  const formatarTamanho = (bytes: number | null) => {
    if (!bytes) return "N/A"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      cardapio: "Cardápio",
      cartela_videos: "Cartela de Vídeos",
      restaurante: "Restaurante",
    }
    return labels[tipo] || tipo
  }

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      cardapio: "bg-blue-100 text-blue-800",
      cartela_videos: "bg-purple-100 text-purple-800",
      restaurante: "bg-green-100 text-green-800",
    }
    return colors[tipo] || "bg-gray-100 text-gray-800"
  }

  const documentosPorTipo = {
    cardapio: documentos.filter(d => d.tipo === 'cardapio'),
    cartela_videos: documentos.filter(d => d.tipo === 'cartela_videos'),
    restaurante: documentos.filter(d => d.tipo === 'restaurante'),
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-[#8B2E3D] to-[#7A1F2E] bg-clip-text text-transparent flex items-center gap-3">
            <FileText className="h-10 w-10 text-[#8B2E3D]" />
            Documentos
          </h1>
          <p className="text-[#8B2E3D]/70 mt-2 text-lg font-medium">
            Gerencie cardápios, cartelas de vídeos e informações do restaurante
          </p>
        </div>

        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#8B2E3D] hover:bg-[#7A1F2E] text-white">
              <Upload className="h-4 w-4 mr-2" />
              Novo Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload de Documento</DialogTitle>
              <DialogDescription>
                Faça upload de um PDF (cardápio, cartela de vídeos ou informações do restaurante)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={tipo} onValueChange={(value: any) => setTipo(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardapio">Cardápio</SelectItem>
                    <SelectItem value="cartela_videos">Cartela de Vídeos</SelectItem>
                    <SelectItem value="restaurante">Restaurante</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Cardápio 2025"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descrição opcional do documento"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arquivo">Arquivo PDF *</Label>
                <Input
                  id="arquivo"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                />
                {arquivo && (
                  <p className="text-sm text-gray-500">
                    {arquivo.name} ({(arquivo.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploading || !arquivo || !titulo}
                className="w-full bg-[#8B2E3D] hover:bg-[#7A1F2E]"
              >
                {uploading ? "Enviando..." : "Fazer Upload"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando documentos...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {(['cardapio', 'cartela_videos', 'restaurante'] as const).map(tipo => (
            <Card key={tipo}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className={getTipoColor(tipo)}>
                    {getTipoLabel(tipo)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    ({documentosPorTipo[tipo].length} documento{documentosPorTipo[tipo].length !== 1 ? 's' : ''})
                  </span>
                </CardTitle>
                <CardDescription>
                  Documentos que podem ser enviados pela IA quando solicitados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documentosPorTipo[tipo].length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Nenhum documento deste tipo cadastrado
                  </p>
                ) : (
                  <div className="space-y-4">
                    {documentosPorTipo[tipo].map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-[#8B2E3D]" />
                            <div>
                              <h3 className="font-semibold">{doc.titulo}</h3>
                              {doc.descricao && (
                                <p className="text-sm text-gray-500">{doc.descricao}</p>
                              )}
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                                <span>{doc.arquivo_nome}</span>
                                <span>•</span>
                                <span>{formatarTamanho(doc.arquivo_tamanho)}</span>
                                {doc.created_at && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(doc.arquivo_url, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
