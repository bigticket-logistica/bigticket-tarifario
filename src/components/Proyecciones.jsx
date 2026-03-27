import React, { useEffect, useRef } from 'react'
import { Card, CardHeader, KpiCard, Grid, TableWrapper } from './UI.jsx'
import { buildProjections, fmt, pctSigned } from '../data.js'
import { Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Legend, Filler } from 'chart.js'

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Legend, Filler)

export default function Proyecciones({ vars }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const rows = buildProjections(vars)
  const dec = rows[8]
  const base = 20986

  useEffect(() => {
    if (!chartRef.current) return
    if (chartInstance.current) chartInstance.current.destroy()

    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: rows.map(r => r.m),
        datasets: [
          {
            label: 'Optimista', data: rows.map(r => r.t_o),
            borderColor: '#16A34A', backgroundColor: 'rgba(22,163,74,0.06)',
            tension: 0.4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#16A34A',
          },
          {
            label: 'Base', data: rows.map(r => r.t_b),
            borderColor: '#F47920', backgroundColor: 'rgba(244,121,32,0.06)',
            tension: 0.4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#F47920',
          },
          {
            label: 'Pesimista', data: rows.map(r => r.t_p),
            borderColor: '#DC2626', backgroundColor: 'rgba(220,38,38,0.06)',
            tension: 0.4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#DC2626',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#6B7A99', font: { size: 11, family: 'DM Mono' }, boxWidth: 12 } },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: $${Math.round(ctx.parsed.y).toLocaleString('es-CL')}`,
            },
          },
        },
        scales: {
          x: { ticks: { color: '#6B7A99', font: { size: 10 } }, grid: { color: 'rgba(221,226,238,0.6)' } },
          y: {
            ticks: { color: '#6B7A99', font: { size: 10, family: 'DM Mono' }, callback: v => '$' + Math.round(v).toLocaleString('es-CL') },
            grid: { color: 'rgba(221,226,238,0.6)' },
            min: 15000,
          },
        },
      },
    })

    return () => { if (chartInstance.current) chartInstance.current.destroy() }
  }, [vars])

  return (
    <div>
      <Grid cols={3} gap={12} style={{ marginBottom: 14 }}>
        <KpiCard label="Optimista — dic 2026" value={'$' + fmt(dec.t_o)} sub="Diésel baja $1.100/L | Resolución Ormuz" color="#16A34A" topColor="#16A34A" />
        <KpiCard label="Base — dic 2026" value={'$' + fmt(dec.t_b)} sub="Diésel estable + IPC acumulado" color="#F47920" topColor="#F47920" />
        <KpiCard label="Pesimista — dic 2026" value={'$' + fmt(dec.t_p)} sub="Diésel sube $1.800/L | Escalada" color="#DC2626" topColor="#DC2626" />
      </Grid>

      <Card style={{ marginBottom: 14 }}>
        <CardHeader>Evolución tarifa BIGTICKET C_VIÑA — 3 escenarios (Abr 2026 → Mar 2027)</CardHeader>
        <div style={{ position: 'relative', height: 220 }}>
          <canvas ref={chartRef} />
        </div>
      </Card>

      <Card padding={false}>
        <TableWrapper>
          <table style={{ minWidth: 720 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Mes</th>
                <th>Diésel Opt</th><th>Diésel Base</th><th>Diésel Pes</th>
                <th style={{ background: '#F0FDF4' }}>Tarifa Opt</th>
                <th style={{ background: '#FFF3E8' }}>Tarifa Base</th>
                <th style={{ background: '#FEF2F2' }}>Tarifa Pes</th>
                <th>Δ% Opt</th><th>Δ% Base</th><th>Δ% Pes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.m}</td>
                  <td>${fmt(r.d_o)}</td><td>${fmt(r.d_b)}</td><td>${fmt(r.d_p)}</td>
                  <td style={{ color: '#16A34A', fontWeight: 600, background: '#F0FDF4' }}>${fmt(r.t_o)}</td>
                  <td style={{ color: '#F47920', fontWeight: 600, background: '#FFF3E8' }}>${fmt(r.t_b)}</td>
                  <td style={{ color: '#DC2626', fontWeight: 600, background: '#FEF2F2' }}>${fmt(r.t_p)}</td>
                  <td style={{ color: '#16A34A' }}>{pctSigned((r.t_o - base) / base)}</td>
                  <td style={{ color: '#F47920' }}>{pctSigned((r.t_b - base) / base)}</td>
                  <td style={{ color: '#DC2626' }}>{pctSigned((r.t_p - base) / base)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>
      </Card>
    </div>
  )
}
