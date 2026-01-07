// Redirecionar para a página principal do WhatsApp
import { redirect } from "next/navigation"

export default async function RecepcionistaChatPage({
  params,
}: {
  params: Promise<{ telefone: string }>
}) {
  const { telefone } = await params
  redirect(`/whatsapp?telefone=${encodeURIComponent(telefone)}`)
}
