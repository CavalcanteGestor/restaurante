/**
 * Funções de validação para o sistema
 */

export function validarTelefone(telefone: string): boolean {
  // Remove caracteres não numéricos
  const numeroLimpo = telefone.replace(/\D/g, "")
  // Telefone deve ter entre 10 e 15 dígitos (formato internacional)
  return numeroLimpo.length >= 10 && numeroLimpo.length <= 15
}

export function formatarTelefone(telefone: string): string {
  // Remove tudo que não é número
  const numeroLimpo = telefone.replace(/\D/g, "")
  
  // Se começar com 55 (Brasil), mantém
  // Se não, assume que é número brasileiro e adiciona 55
  if (numeroLimpo.length === 11 && numeroLimpo.startsWith("55")) {
    return numeroLimpo
  }
  if (numeroLimpo.length === 11) {
    return `55${numeroLimpo}`
  }
  if (numeroLimpo.length === 10) {
    return `55${numeroLimpo}`
  }
  
  return numeroLimpo
}

export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export function validarData(data: string): boolean {
  const dataObj = new Date(data)
  return !isNaN(dataObj.getTime())
}

export function validarHorario(horario: string): boolean {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return regex.test(horario)
}

export function validarNumeroPessoas(numero: number): boolean {
  return numero > 0 && numero <= 100 // Limite razoável
}

