import { Database } from "@/types/database"

type Mesa = Database['public']['Tables']['mesas']['Row']
type Reserva = Database['public']['Tables']['reservas']['Row']

export type TipoUso = 'pessoal' | 'corporativo' | 'evento'

export interface RegrasMCPS {
  validarUsoPessoal(mesa: Mesa, tipoUso: TipoUso): boolean
  validarApenasEventos(mesa: Mesa, tipoUso: TipoUso): boolean
  validarJuncao(mesa: Mesa, mesasParaJuntar: string[]): boolean
  validarMidiaCorporativa(mesa: Mesa, tipoUso: TipoUso): boolean
  validarDisponibilidade(mesa: Mesa, reservas: Reserva[], dataReserva: string, turno: string): boolean
}

/**
 * Regras de Negócio MCPS (Mesa Configuration & Policy System)
 */
export class RegrasNegocio implements RegrasMCPS {
  /**
   * 1. Uso Pessoal vs Corporativo
   * Salão Externo, Segundo Andar Externo Coberto e Sala "Cinema" são apenas para uso pessoal
   */
  validarUsoPessoal(mesa: Mesa, tipoUso: TipoUso): boolean {
    const ambientesPessoais = ['Salão Externo', 'Segundo Andar Externo Coberto', 'Cinema']
    
    if (ambientesPessoais.includes(mesa.ambiente || '')) {
      return tipoUso === 'pessoal'
    }
    
    return true
  }

  /**
   * 2. Apenas Eventos
   * Terraço (61-82) e Empório (41-52) só podem ser reservados para EVENTOS
   */
  validarApenasEventos(mesa: Mesa, tipoUso: TipoUso): boolean {
    if (mesa.so_eventos) {
      return tipoUso === 'evento'
    }
    
    // Verificar se é Terraço ou Empório pelo código
    const codigoNum = parseInt(mesa.codigo.replace(/\D/g, ''))
    if ((codigoNum >= 61 && codigoNum <= 82) || (codigoNum >= 41 && codigoNum <= 52)) {
      return tipoUso === 'evento'
    }
    
    return true
  }

  /**
   * 3. Junções de Mesas
   * Mesas não podem ser unidas, exceto onde explicitamente permitido
   */
  validarJuncao(mesa: Mesa, mesasParaJuntar: string[]): boolean {
    if (!mesa.pode_juntar) {
      return false
    }
    
    if (mesa.junta_com) {
      const mesasPermitidas = mesa.junta_com.split(',').map(m => m.trim())
      return mesasParaJuntar.every(m => mesasPermitidas.includes(m))
    }
    
    return true
  }

  /**
   * 4. Mídia Corporativa
   * Uso de TV/Mídia NÃO é permitido em Mesas 8, 9, 10, 11 (Salão Cristal) para uso corporativo
   * Apenas Mesa 7 (Salão Cristal) e Salão Bandeira possuem TV e são adequados para mídia
   */
  validarMidiaCorporativa(mesa: Mesa, tipoUso: TipoUso): boolean {
    if (tipoUso === 'corporativo') {
      const codigoNum = parseInt(mesa.codigo.replace(/\D/g, ''))
      const mesasSemTV = [8, 9, 10, 11]
      
      if (mesasSemTV.includes(codigoNum) && mesa.ambiente === 'Salão Cristal') {
        return false // Não pode usar TV nestas mesas para corporativo
      }
    }
    
    return true
  }

  /**
   * 5. Disponibilidade Real
   * Verificar se a mesa está realmente disponível considerando reservas existentes
   */
  validarDisponibilidade(
    mesa: Mesa,
    reservas: Reserva[],
    dataReserva: string,
    turno: string
  ): boolean {
    if (!mesa.disponivel) {
      return false
    }
    
    // Verificar se há reservas conflitantes
    const reservasConflitantes = reservas.filter(
      (r) =>
        r.data_reserva === dataReserva &&
        r.turno === turno &&
        r.etapa === 'reserva_confirmada' &&
        r.mesas?.includes(mesa.codigo)
    )
    
    return reservasConflitantes.length === 0
  }

  /**
   * Validar todas as regras para uma mesa
   */
  validarMesa(
    mesa: Mesa,
    tipoUso: TipoUso,
    reservas: Reserva[],
    dataReserva: string,
    turno: string,
    mesasParaJuntar?: string[]
  ): { valida: boolean; motivo?: string } {
    if (!this.validarUsoPessoal(mesa, tipoUso)) {
      return {
        valida: false,
        motivo: 'Esta área é apenas para uso pessoal',
      }
    }
    
    if (!this.validarApenasEventos(mesa, tipoUso)) {
      return {
        valida: false,
        motivo: 'Esta área é apenas para eventos',
      }
    }
    
    if (mesasParaJuntar && mesasParaJuntar.length > 0) {
      if (!this.validarJuncao(mesa, mesasParaJuntar)) {
        return {
          valida: false,
          motivo: 'Junção de mesas não permitida',
        }
      }
    }
    
    if (!this.validarMidiaCorporativa(mesa, tipoUso)) {
      return {
        valida: false,
        motivo: 'Uso de TV não permitido nesta mesa para eventos corporativos',
      }
    }
    
    if (!this.validarDisponibilidade(mesa, reservas, dataReserva, turno)) {
      return {
        valida: false,
        motivo: 'Mesa já está reservada neste horário',
      }
    }
    
    return { valida: true }
  }
}

export const regrasNegocio = new RegrasNegocio()

