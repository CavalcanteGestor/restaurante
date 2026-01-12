/**
 * Normaliza um número de telefone removendo caracteres especiais
 * e formatos do WhatsApp (ex: @s.whatsapp.net)
 * 
 * @param telefone - Número de telefone em qualquer formato
 * @returns Número normalizado apenas com dígitos
 * 
 * @example
 * normalizeTelefone("553799458769@s.whatsapp.net") // "553799458769"
 * normalizeTelefone("55 37 99458-769") // "553799458769"
 * normalizeTelefone("(55) 37 99458-769") // "553799458769"
 */
export function normalizeTelefone(telefone: string | null | undefined): string {
  if (!telefone) return ''
  
  // Converter para string e remover caracteres não numéricos
  // Remove @s.whatsapp.net e outros sufixos
  return String(telefone)
    .replace(/@.*$/, '') // Remove tudo após @ (ex: @s.whatsapp.net)
    .replace(/\D/g, '') // Remove tudo que não é dígito
}
