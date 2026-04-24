import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  try {
    console.log('🔄 Iniciando setup do banco de dados...')

    // Ler o arquivo SQL
    const sqlPath = path.join(process.cwd(), 'scripts/001_create_schema.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    // Executar o SQL
    const { error } = await supabase.rpc('exec', { sql })

    if (error) {
      console.error('❌ Erro ao executar SQL:', error)
      process.exit(1)
    }

    console.log('✅ Banco de dados configurado com sucesso!')
  } catch (err) {
    console.error('❌ Erro:', err.message)
    process.exit(1)
  }
}

setupDatabase()
