import { NextRequest, NextResponse } from "next/server"
import { getReservasByDateRange } from "@/lib/db/reservas"

/**
 * GET /api/relatorios/pdf?periodo=mes&mes=01&ano=2026
 * Gera PDF de relatório
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const periodo = searchParams.get("periodo") || "mes"
    const mes = searchParams.get("mes") || String(new Date().getMonth() + 1).padStart(2, '0')
    const ano = searchParams.get("ano") || String(new Date().getFullYear())

    // Calcular data início e fim
    let dataInicio: string
    let dataFim: string

    if (periodo === "mes") {
      dataInicio = `${ano}-${mes}-01`
      const ultimoDia = new Date(parseInt(ano), parseInt(mes), 0).getDate()
      dataFim = `${ano}-${mes}-${ultimoDia}`
    } else if (periodo === "ano") {
      dataInicio = `${ano}-01-01`
      dataFim = `${ano}-12-31`
    } else {
      // Hoje
      const hoje = new Date().toISOString().split('T')[0]
      dataInicio = hoje
      dataFim = hoje
    }

    const reservas = await getReservasByDateRange(dataInicio, dataFim)

    const totalReservas = reservas.length
    const confirmadas = reservas.filter(r => r.etapa === 'confirmado').length
    const canceladas = reservas.filter(r => r.etapa === 'cancelado').length
    const pendentes = reservas.filter(r => r.etapa === 'interesse' || r.etapa === 'pendente').length
    const totalPessoas = reservas.reduce((sum, r) => sum + r.numero_pessoas, 0)

    // Gerar HTML do relatório
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório de Reservas - Est! Est!! Est!!!</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 40px;
      background: #fff;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #8B2E3D;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #8B2E3D;
      font-size: 32px;
      margin-bottom: 10px;
      font-weight: 700;
    }
    .header p {
      color: #666;
      font-size: 16px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    .stat {
      background: linear-gradient(135deg, #f5f0e8 0%, #fff 100%);
      border: 2px solid #8B2E3D;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }
    .stat-value {
      font-size: 36px;
      font-weight: bold;
      color: #8B2E3D;
      margin-bottom: 5px;
    }
    .stat-label {
      font-size: 14px;
      color: #666;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    th {
      background: linear-gradient(135deg, #8B2E3D 0%, #7A1F2E 100%);
      color: white;
      padding: 12px;
      text-align: left;
      font-size: 14px;
      font-weight: 600;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 13px;
      color: #333;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    tr:hover {
      background-color: #f5f0e8;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .badge-confirmado { background: #10b981; color: white; }
    .badge-pendente { background: #f59e0b; color: white; }
    .badge-cancelado { background: #ef4444; color: white; }
    .footer {
      text-align: center;
      color: #999;
      font-size: 12px;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
    @media print {
      body { padding: 20px; }
      .header { page-break-after: avoid; }
      table { page-break-inside: avoid; }
      tr { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🍝 Est! Est!! Est!!! Ristorante</h1>
    <p>Relatório de Reservas - ${periodo === 'mes' ? `${mes}/${ano}` : periodo === 'ano' ? ano : 'Hoje'}</p>
    <p style="font-size: 12px; color: #999; margin-top: 10px;">
      Gerado em: ${new Date().toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}
    </p>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-value">${totalReservas}</div>
      <div class="stat-label">Total de Reservas</div>
    </div>
    <div class="stat">
      <div class="stat-value" style="color: #10b981;">${confirmadas}</div>
      <div class="stat-label">Confirmadas</div>
    </div>
    <div class="stat">
      <div class="stat-value" style="color: #f59e0b;">${pendentes}</div>
      <div class="stat-label">Pendentes</div>
    </div>
    <div class="stat">
      <div class="stat-value" style="color: #6366f1;">${totalPessoas}</div>
      <div class="stat-label">Total de Pessoas</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Nome</th>
        <th>Telefone</th>
        <th>Data</th>
        <th>Horário</th>
        <th>Pessoas</th>
        <th>Mesas</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${reservas.map(r => `
        <tr>
          <td><strong>${r.nome}</strong></td>
          <td>${r.telefone}</td>
          <td>${new Date(r.data_reserva).toLocaleDateString('pt-BR')}</td>
          <td>${r.horario_reserva}</td>
          <td>${r.numero_pessoas}</td>
          <td>${r.mesas || 'N/A'}</td>
          <td>
            <span class="badge badge-${r.etapa}">${r.etapa}</span>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p><strong>Est! Est!! Est!!! Ristorante</strong></p>
    <p>Sistema de Gestão de Reservas • © ${new Date().getFullYear()}</p>
  </div>
</body>
</html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error: any) {
    console.error("[Relatórios PDF] Erro:", error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

