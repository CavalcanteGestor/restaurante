/**
 * Script para corrigir contraste em todas as páginas
 * Substitui text-muted-foreground por text-gray-600 ou text-gray-700
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const filesToFix = [
  'app/(dashboard)/conversas/page.tsx',
  'app/(dashboard)/relatorios/page.tsx',
  'app/(dashboard)/automatizacoes/page.tsx',
  'app/(dashboard)/admin/page.tsx',
  'app/(dashboard)/admin/usuarios/page.tsx',
  'app/(dashboard)/admin/usuarios/novo/page.tsx',
  'app/(dashboard)/admin/usuarios/[id]/page.tsx',
  'app/(dashboard)/admin/mesas/adicionar/page.tsx',
  'app/(dashboard)/recepcionista/page.tsx',
  'app/(dashboard)/recepcionista/reservas/page.tsx',
  'app/(dashboard)/recepcionista/mesas/page.tsx',
  'app/(dashboard)/recepcionista/whatsapp/page.tsx',
  'app/(dashboard)/recepcionista/conversas/page.tsx',
  'app/(dashboard)/leads/[id]/page.tsx',
]

function fixFile(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    let newContent = content
    
    // Substituir text-muted-foreground por text-gray-600 ou text-gray-700 dependendo do contexto
    newContent = newContent.replace(/text-muted-foreground/g, (match, offset, string) => {
      // Verificar contexto - se for CardTitle ou título, usar text-gray-700
      const before = string.substring(Math.max(0, offset - 50), offset)
      if (before.includes('CardTitle') || before.includes('font-semibold') || before.includes('font-bold')) {
        return 'text-gray-700'
      }
      // Caso contrário, usar text-gray-600
      return 'text-gray-600'
    })
    
    // Garantir que números grandes tenham text-gray-900
    newContent = newContent.replace(
      /(text-3xl|text-4xl|text-2xl)\s+font-bold(?!\s+text-)/g,
      '$1 font-bold text-gray-900'
    )
    
    if (content !== newContent) {
      writeFileSync(filePath, newContent, 'utf-8')
      console.log(`✅ Corrigido: ${filePath}`)
      return true
    }
    return false
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error)
    return false
  }
}

// Executar correções
console.log('🔧 Corrigindo contraste de texto...\n')
let fixed = 0
filesToFix.forEach(file => {
  if (fixFile(file)) fixed++
})

console.log(`\n✨ ${fixed} arquivo(s) corrigido(s)!`)

