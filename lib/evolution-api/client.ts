/**
 * Cliente Evolution API para WhatsApp
 * Integração completa com Evolution API usando endpoints do Manager
 */

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY
const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || "Bistro"

export interface EvolutionApiConfig {
  url?: string
  apiKey?: string
  instanceName?: string
}

export interface SendMessageOptions {
  number: string
  text: string
  delay?: number
  linkPreview?: boolean
}

export interface SendMediaOptions {
  number: string
  media: string // URL ou base64
  caption?: string
  type?: 'image' | 'audio' | 'video' | 'document'
}

export interface InstanceStatus {
  instance: {
    instanceName: string
    status: 'open' | 'close' | 'connecting'
    qrcode?: {
      code: string
      base64: string
    }
  }
}

class EvolutionApiClient {
  private url: string
  private apiKey: string
  private instanceName: string
  private instanceId: string | null = null

  constructor(config?: EvolutionApiConfig) {
    this.url = config?.url || EVOLUTION_API_URL || ''
    this.apiKey = config?.apiKey || EVOLUTION_API_KEY || ''
    this.instanceName = config?.instanceName || EVOLUTION_INSTANCE_NAME
  }

  /**
   * Busca o ID da instância pelo nome
   */
  private async getInstanceId(): Promise<string> {
    if (this.instanceId) return this.instanceId
    
    try {
      const instances = await this.getInstanceStatus()
      if (Array.isArray(instances)) {
        const instance = instances.find((inst: any) => 
          inst.name === this.instanceName || 
          inst.instanceName === this.instanceName
        )
        if (instance?.id) {
          this.instanceId = instance.id
          console.log(`[Evolution API] ID da instância "${this.instanceName}": ${this.instanceId}`)
          return this.instanceId
        }
      }
    } catch (error) {
      console.error("[Evolution API] Erro ao buscar ID da instância:", error)
    }
    
    throw new Error(`Não foi possível encontrar o ID da instância "${this.instanceName}"`)
  }

  /**
   * Verifica se a configuração está completa
   */
  isConfigured(): boolean {
    return !!(this.url && this.apiKey && this.instanceName)
  }

  /**
   * Limpa número de telefone (remove @s.whatsapp.net e caracteres não numéricos)
   */
  private cleanNumber(number: string): string {
    return number.replace(/@.*/, "").replace(/\D/g, "")
  }

  /**
   * Faz requisição autenticada para Evolution API
   */
  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error("Evolution API não configurada. Verifique as variáveis de ambiente.")
    }

    const url = `${this.url}${endpoint}`
    const headers = {
      "Content-Type": "application/json",
      "apikey": this.apiKey,
      "Authorization": `Bearer ${this.apiKey}`,
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = "Erro ao comunicar com Evolution API"
      
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorJson.error || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }

      console.error(`[Evolution API] Erro HTTP ${response.status}:`, errorMessage.substring(0, 500))
      throw new Error(errorMessage)
    }

    // Tentar parsear JSON, mas capturar HTML se vier
    const responseText = await response.text()
    try {
      return JSON.parse(responseText)
    } catch (parseError) {
      console.error(`[Evolution API] Resposta não é JSON. Primeiros 500 chars:`, responseText.substring(0, 500))
      throw new Error(`Endpoint retornou HTML em vez de JSON. Pode ser página de login ou erro 404.`)
    }
  }

  /**
   * Verifica status da instância
   */
  async getInstanceStatus(): Promise<any> {
    try {
      const response = await this.request(`/instance/fetchInstances`)
      return response
    } catch (error) {
      console.error("[Evolution API] Erro ao buscar status:", error)
      return null
    }
  }

  /**
   * Verifica se a instância está conectada
   */
  async isConnected(): Promise<boolean> {
    try {
      const instances = await this.getInstanceStatus()
      
      if (!instances) return false
      
      if (Array.isArray(instances)) {
        const instance = instances.find((inst: any) => {
          const name1 = inst.instance?.instanceName
          const name2 = inst.instanceName
          const name3 = inst.name
          return name1 === this.instanceName || name2 === this.instanceName || name3 === this.instanceName
        })
        
        if (instance) {
          const connectionStatus = instance.connectionStatus
          return connectionStatus === 'open' || connectionStatus === 'connected'
        }
        return false
      }
      
      if (instances?.data && Array.isArray(instances.data)) {
        const instance = instances.data.find((inst: any) => 
          inst.instance?.instanceName === this.instanceName ||
          inst.instanceName === this.instanceName ||
          inst.name === this.instanceName
        )
        if (instance) {
          const connectionStatus = instance.connectionStatus
          return connectionStatus === 'open' || connectionStatus === 'connected'
        }
        return false
      }
      
      if (instances?.instance) {
        const connectionStatus = instances.connectionStatus || instances.instance.connectionStatus
        return connectionStatus === 'open' || connectionStatus === 'connected'
      }
      
      if (instances?.instanceName === this.instanceName || instances?.name === this.instanceName) {
        const connectionStatus = instances.connectionStatus
        return connectionStatus === 'open' || connectionStatus === 'connected'
      }
      
      if (instances?.connectionStatus || instances?.status) {
        const status = instances.connectionStatus || instances.status
        return status === 'open' || status === 'connected'
      }
      
      return false
    } catch (error: any) {
      console.error("[Evolution API] Erro ao verificar conexão:", error)
      return false
    }
  }

  /**
   * Envia mensagem de texto
   */
  async sendText(options: SendMessageOptions): Promise<any> {
    const number = this.cleanNumber(options.number)
    
    return this.request(`/message/sendText/${this.instanceName}`, {
      method: "POST",
      body: JSON.stringify({
        number,
        text: options.text,
        delay: options.delay || 1200,
        linkPreview: options.linkPreview !== false,
      }),
    })
  }

  /**
   * Envia mídia (imagem, áudio, vídeo, documento)
   */
  async sendMedia(options: SendMediaOptions): Promise<any> {
    const number = this.cleanNumber(options.number)
    const type = options.type || 'image'
    
    const endpoint = type === 'image' 
      ? `/message/sendMedia/${this.instanceName}`
      : type === 'audio'
      ? `/message/sendAudio/${this.instanceName}`
      : type === 'video'
      ? `/message/sendMedia/${this.instanceName}`
      : `/message/sendMedia/${this.instanceName}`

    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify({
        number,
        mediatype: type,
        media: options.media,
        caption: options.caption || "",
      }),
    })
  }

  /**
   * Marca mensagens como lidas
   */
  async markAsRead(remoteJid: string, messageIds: string[]): Promise<any> {
    return this.request(`/chat/markMessageAsRead/${this.instanceName}`, {
      method: "PUT",
      body: JSON.stringify({
        remoteJid,
        messageIds,
      }),
    })
  }

  /**
   * Busca mensagens de um chat específico
   * Endpoint oficial: POST /chat/findMessages/{instance}
   */
  async getMessages(remoteJid: string, limit: number = 50): Promise<any> {
    try {
      const endpoint = `/chat/findMessages/${this.instanceName}`
      const response = await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          where: {
            key: {
              remoteJid: remoteJid,
            },
          },
          limit: limit,
        }),
      })
      
      return response
    } catch (error: any) {
      console.error(`[Evolution API] Erro ao buscar mensagens:`, error.message)
      throw error
    }
  }

  /**
   * Busca todos os chats
   * Endpoint oficial: POST /chat/findChats/{instance}
   */
  async getChats(): Promise<any[]> {
    try {
      const endpoint = `/chat/findChats/${this.instanceName}`
      const response = await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify({}),
      })
      
      const chats = Array.isArray(response) ? response : response?.chats || []
      console.log(`[Evolution API] ✓ ${chats.length} chats`)
      return chats
    } catch (error: any) {
      console.error(`[Evolution API] Erro ao buscar chats:`, error.message)
      throw error
    }
  }

  /**
   * Busca contatos
   * Endpoint oficial: POST /chat/findContacts/{instance}
   */
  async getContacts(): Promise<any[]> {
    try {
      const endpoint = `/chat/findContacts/${this.instanceName}`
      const response = await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify({}),
      })
      
      const contacts = Array.isArray(response) ? response : response?.contacts || []
      console.log(`[Evolution API] ✓ ${contacts.length} contatos`)
      return contacts
    } catch (error: any) {
      console.error(`[Evolution API] Erro ao buscar contatos:`, error.message)
      return []
    }
  }

  /**
   * Verifica se um número existe no WhatsApp
   */
  async checkNumber(number: string): Promise<{ exists: boolean; jid: string }> {
    const cleanNumber = this.cleanNumber(number)
    return this.request(`/chat/whatsappNumbers/${this.instanceName}`, {
      method: "POST",
      body: JSON.stringify({
        numbers: [cleanNumber],
      }),
    })
  }

  /**
   * Busca foto de perfil de um contato
   * Endpoint: POST /chat/fetchProfilePicUrl/{instance}
   */
  async getProfilePicture(number: string): Promise<string | null> {
    try {
      const remoteJid = number.includes("@") ? number : `${number}@s.whatsapp.net`
      
      const response = await this.request(`/chat/fetchProfilePicUrl/${this.instanceName}`, {
        method: "POST",
        body: JSON.stringify({
          number: remoteJid,
        }),
      })

      return response?.profilePicUrl || response?.url || null
    } catch (error) {
      console.error(`[Evolution API] Erro ao buscar foto de perfil:`, error)
      return null
    }
  }
}

// Exportar instância singleton
export const evolutionApi = new EvolutionApiClient()

// Exportar classe para uso customizado
export default EvolutionApiClient
