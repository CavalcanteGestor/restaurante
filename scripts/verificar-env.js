// Script para verificar se as variáveis de ambiente estão configuradas
const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env.local')

console.log('🔍 Verificando configuração do Supabase...\n')

if (!fs.existsSync(envPath)) {
  console.error('❌ Arquivo .env.local não encontrado!')
  console.log('\n📝 Crie o arquivo .env.local com as seguintes variáveis:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon')
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=')
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim()
    }
  }
})

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]

let allOk = true

requiredVars.forEach(varName => {
  const value = envVars[varName]
  if (!value || value === '' || value.includes('sua-') || value.includes('seu-')) {
    console.error(`❌ ${varName} não configurada ou está com valor de exemplo`)
    allOk = false
  } else {
    const displayValue = varName.includes('KEY') 
      ? `${value.substring(0, 20)}...` 
      : value
    console.log(`✅ ${varName}: ${displayValue}`)
  }
})

if (allOk) {
  console.log('\n✅ Todas as variáveis estão configuradas!')
  console.log('\n⚠️  IMPORTANTE: Reinicie o servidor Next.js após configurar as variáveis:')
  console.log('   npm run dev')
} else {
  console.log('\n❌ Configure as variáveis faltantes no arquivo .env.local')
  console.log('\n📖 Como obter as chaves:')
  console.log('   1. Acesse: Supabase Dashboard > Settings > API')
  console.log('   2. Copie a "Project URL" para NEXT_PUBLIC_SUPABASE_URL')
  console.log('   3. Copie a "anon public" key para NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

