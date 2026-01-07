import { NextRequest, NextResponse } from "next/server"
import { getReservaById } from "@/lib/db/reservas"
import { formatDate, formatTime } from "@/lib/utils/date"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reserva = await getReservaById(id)

    if (!reserva) {
      return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 })
    }

    // Gerar HTML do PDF
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reserva - ${reserva.nome}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #1a1a1a;
      line-height: 1.6;
    }
    .header {
      border-bottom: 3px solid #8B2E3D;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #8B2E3D;
      margin-bottom: 5px;
    }
    .subtitle {
      color: #666;
      font-size: 14px;
    }
    .content {
      margin-top: 30px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #8B2E3D;
      margin-bottom: 15px;
      border-bottom: 2px solid #E8DDD0;
      padding-bottom: 8px;
    }
    .info-row {
      display: flex;
      margin-bottom: 12px;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .info-label {
      font-weight: 600;
      color: #555;
      width: 180px;
      flex-shrink: 0;
    }
    .info-value {
      color: #1a1a1a;
      flex: 1;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 5px;
    }
    .badge-confirmada {
      background-color: #d1fae5;
      color: #065f46;
    }
    .badge-pendente {
      background-color: #fef3c7;
      color: #92400e;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #E8DDD0;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .mesas {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #8B2E3D;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">EST! EST!! EST!!! CUCINA ITALIANA</div>
    <div class="subtitle">Comprovante de Reserva</div>
  </div>

  <div class="content">
    <div class="section">
      <div class="section-title">Informações da Reserva</div>
      <div class="info-row">
        <div class="info-label">Número da Reserva:</div>
        <div class="info-value">${reserva.id.substring(0, 8).toUpperCase()}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Status:</div>
        <div class="info-value">
          <span class="badge ${
            reserva.etapa === 'reserva_confirmada' ? 'badge-confirmada' : 'badge-pendente'
          }">
            ${reserva.etapa === 'reserva_confirmada' ? 'Confirmada' : 'Pendente'}
          </span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Dados do Cliente</div>
      <div class="info-row">
        <div class="info-label">Nome:</div>
        <div class="info-value">${reserva.nome}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Telefone:</div>
        <div class="info-value">${reserva.telefone}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Detalhes da Reserva</div>
      <div class="info-row">
        <div class="info-label">Data:</div>
        <div class="info-value">${formatDate(reserva.data_reserva)}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Horário:</div>
        <div class="info-value">${formatTime(reserva.horario_reserva)}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Período:</div>
        <div class="info-value">${reserva.turno === 'almoco' ? 'Almoço' : 'Jantar'}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Número de Pessoas:</div>
        <div class="info-value">${reserva.numero_pessoas} ${reserva.numero_pessoas === 1 ? 'pessoa' : 'pessoas'}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Turno:</div>
        <div class="info-value">${reserva.turno || 'N/A'}</div>
      </div>
      ${reserva.mesas ? `
      <div class="info-row">
        <div class="info-label">Mesas:</div>
        <div class="info-value">
          <div class="mesas">${reserva.mesas.split('+').join(' + ')}</div>
        </div>
      </div>
      ` : ''}
      ${reserva.contexto ? `
      <div class="info-row">
        <div class="info-label">Observações:</div>
        <div class="info-value">${reserva.contexto}</div>
      </div>
      ` : ''}
    </div>
  </div>

  <div class="footer">
    <p>Este documento foi gerado automaticamente pelo Sistema de Gestão de Reservas</p>
    <p>Data de geração: ${new Date().toLocaleString('pt-BR')}</p>
  </div>
</body>
</html>
    `

    // Retornar HTML que pode ser impresso como PDF pelo navegador
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="reserva-${reserva.id.substring(0, 8)}.html"`,
      },
    })
  } catch (error: any) {
    console.error("Erro ao gerar PDF:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

