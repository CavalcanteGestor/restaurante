import { NextRequest, NextResponse } from "next/server"
import { getReservas } from "@/lib/db/reservas"
import { formatDate, formatTime } from "@/lib/utils/date"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const data = searchParams.get("data")
    const dataInicio = searchParams.get("dataInicio")
    const dataFim = searchParams.get("dataFim")
    const turno = searchParams.get("turno")
    const mes = searchParams.get("mes") // formato: YYYY-MM
    const ano = searchParams.get("ano") // formato: YYYY

    let reservas = []

    if (mes) {
      // Buscar reservas do mês
      const [anoMes, mesNum] = mes.split('-')
      const dataInicioMes = `${anoMes}-${mesNum}-01`
      const ultimoDia = new Date(parseInt(anoMes), parseInt(mesNum), 0).getDate()
      const dataFimMes = `${anoMes}-${mesNum}-${ultimoDia.toString().padStart(2, '0')}`
      
      const todasReservas = await getReservas({})
      reservas = todasReservas.filter(r => {
        const dataReserva = new Date(r.data_reserva)
        return dataReserva >= new Date(dataInicioMes) && dataReserva <= new Date(dataFimMes)
      })
    } else if (ano) {
      // Buscar reservas do ano
      const todasReservas = await getReservas({})
      reservas = todasReservas.filter(r => {
        const dataReserva = new Date(r.data_reserva)
        return dataReserva.getFullYear() === parseInt(ano)
      })
    } else if (dataInicio && dataFim) {
      // Buscar reservas no período
      const todasReservas = await getReservas({})
      reservas = todasReservas.filter(r => {
        const dataReserva = new Date(r.data_reserva)
        return dataReserva >= new Date(dataInicio) && dataReserva <= new Date(dataFim)
      })
      
      // Filtrar por turno se especificado
      if (turno) {
        reservas = reservas.filter(r => r.turno === turno)
      }
    } else if (data) {
      // Buscar reservas do dia
      reservas = await getReservas({ data })
      
      // Filtrar por turno se especificado
      if (turno) {
        reservas = reservas.filter(r => r.turno === turno)
      }
    } else {
      return NextResponse.json(
        { error: "Parâmetros inválidos. Use: data, dataInicio+dataFim, mes ou ano" },
        { status: 400 }
      )
    }

    if (reservas.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma reserva encontrada para os filtros especificados" },
        { status: 404 }
      )
    }

    // Ordenar por data e horário
    reservas.sort((a, b) => {
      const dataA = new Date(`${a.data_reserva} ${a.horario_reserva}`)
      const dataB = new Date(`${b.data_reserva} ${b.horario_reserva}`)
      return dataA.getTime() - dataB.getTime()
    })

    // Gerar HTML do PDF
    const titulo = mes 
      ? `Reservas de ${new Date(mes + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
      : ano
      ? `Reservas de ${ano}`
      : dataInicio && dataFim
      ? `Reservas de ${formatDate(dataInicio)} a ${formatDate(dataFim)}${turno ? ` - ${turno === 'almoco' ? 'Almoço' : 'Jantar'}` : ''}`
      : data
      ? `Reservas de ${formatDate(data)}${turno ? ` - ${turno === 'almoco' ? 'Almoço' : 'Jantar'}` : ''}`
      : 'Reservas'

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${titulo}</title>
  <style>
    @page {
      size: A4;
      margin: 1.5cm;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #1a1a1a;
      line-height: 1.6;
      font-size: 12px;
    }
    .header {
      border-bottom: 3px solid #8B2E3D;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .logo {
      font-size: 20px;
      font-weight: bold;
      color: #8B2E3D;
      margin-bottom: 5px;
    }
    .subtitle {
      color: #666;
      font-size: 12px;
    }
    .info-header {
      background-color: #f9f9f9;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 15px;
      font-size: 11px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th {
      background-color: #8B2E3D;
      color: white;
      padding: 8px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
    }
    td {
      padding: 8px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 11px;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
    }
    .badge-confirmada {
      background-color: #d1fae5;
      color: #065f46;
    }
    .badge-pendente {
      background-color: #fef3c7;
      color: #92400e;
    }
    .badge-cancelada {
      background-color: #fee2e2;
      color: #991b1b;
    }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 2px solid #E8DDD0;
      text-align: center;
      color: #666;
      font-size: 10px;
    }
    .summary {
      background-color: #F5F0E8;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #8B2E3D;
    }
    .summary-item {
      display: inline-block;
      margin-right: 20px;
      font-size: 11px;
    }
    .summary-label {
      font-weight: 600;
      color: #555;
    }
    .summary-value {
      color: #8B2E3D;
      font-weight: bold;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">EST! EST!! EST!!! CUCINA ITALIANA</div>
    <div class="subtitle">Relatório de Reservas</div>
  </div>

  <div class="info-header">
    <strong>${titulo}</strong><br>
    Total de reservas: ${reservas.length}<br>
    Data de geração: ${new Date().toLocaleString('pt-BR')}
  </div>

  <div class="summary">
    <div class="summary-item">
      <span class="summary-label">Total:</span>
      <span class="summary-value">${reservas.length}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">Confirmadas:</span>
      <span class="summary-value">${reservas.filter(r => r.etapa === 'reserva_confirmada').length}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">Pendentes:</span>
      <span class="summary-value">${reservas.filter(r => r.etapa === 'interesse').length}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">Canceladas:</span>
      <span class="summary-value">${reservas.filter(r => r.etapa === 'cancelado').length}</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Cliente</th>
        <th>Telefone</th>
        <th>Data</th>
        <th>Horário</th>
        <th>Período</th>
        <th>Pessoas</th>
        <th>Mesas</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${reservas.map((reserva) => `
        <tr>
          <td>${reserva.nome}</td>
          <td>${reserva.telefone}</td>
          <td>${formatDate(reserva.data_reserva)}</td>
          <td>${formatTime(reserva.horario_reserva)}</td>
          <td>${reserva.turno === 'almoco' ? 'Almoço' : 'Jantar'}</td>
          <td>${reserva.numero_pessoas}</td>
          <td>${reserva.mesas || '-'}</td>
          <td>
            <span class="badge ${
              reserva.etapa === 'reserva_confirmada' ? 'badge-confirmada' :
              reserva.etapa === 'interesse' ? 'badge-pendente' :
              'badge-cancelada'
            }">
              ${reserva.etapa === 'reserva_confirmada' ? 'Confirmada' :
                reserva.etapa === 'interesse' ? 'Pendente' :
                reserva.etapa === 'cancelado' ? 'Cancelada' : 'Interesse'}
            </span>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Este documento foi gerado automaticamente pelo Sistema de Gestão de Reservas</p>
    <p>Est! Est!! Est!!! Ristorante - ${new Date().getFullYear()}</p>
  </div>
</body>
</html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="reservas-${titulo.toLowerCase().replace(/\s+/g, '-')}.html"`,
      },
    })
  } catch (error: any) {
    console.error("Erro ao gerar PDF:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

