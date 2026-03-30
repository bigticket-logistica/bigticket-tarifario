import React, { useEffect, useRef, useState } from 'react'
import { Card, CardHeader, KpiCard, Grid, TableWrapper, Separator } from './UI.jsx'
import { fmt, pctSigned, PROJ_MONTHS, DATA_VINA, DATA_RM, TAM_LABELS } from '../data.js'
import {
  Chart, LineElement, PointElement, LineController,
  CategoryScale, LinearScale, Tooltip, Legend, Filler
} from 'chart.js'

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Legend, Filler)

const DIESEL_REF = 831
const USD_REF = 870

function calcTarifaProj(cobActual, pagActual, diesel, usd, ipc, pcomb, margen, isRM) {
  const fComb = (diesel / DIESEL_REF - 1) * (pcomb / 100)
  const fIpc = (ipc / 100) * 0.32
  const fUsd = (usd / USD_REF - 1) * 0.15
  const fOp = 0.009
  const factor = 1 + fComb + fIpc + fUsd + fOp
  if (isRM || pagActual === 0) return Math.round(cobActual * factor)
  const np = Math.round(pagActual * factor)
  const ncMinimo = Math.round(np / (1 - margen / 100))
  return Math.max(cobActual, ncMinimo)
}

function SliderProj({ label, value, onChange, min, max, step = 1, color = '#1B3D6F', suffix = '' }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: '#6B7A99', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'DM Mono, monospace', color }}>
          {typeof value === 'number' && value > 100 ? '$' + fmt(value) : value + suffix}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        style={{ width: '100%', accentColor: color }}
      />
    </div>
  )
}

export default function Proyecciones({ vars }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  // Selector de referencia
  const [cecos, setCecos] = useState('C_VIÑA')
  const [zona, setZona] = useState('VALPARAISO')
  const [tam, setTam] = useState('BIGTICKET')

  const isRM = cecos === 'C_RM'
  const data = isRM ? DATA_RM : DATA_VINA
  const zonas = [...new Set(data.map(r => r.zona))].sort()
  const row = data.find(r => r.zona === zona && r.tam === tam) || data[0]

  // Supuestos escenario optimista
  const [optDieselFin, setOptDieselFin] = useState(1100)
  const [optUsdFin, setOptUsdFin] = useState(920)
  const [optIpcFin, setOptIpcFin] = useState(3.5)

  // Supuestos escenario base
  const [baseDieselFin, setBaseDieselFin] = useState(1450)
  const [baseUsdFin, setBaseUsdFin] = useState(990)
  const [baseIpcFin, setBaseIpcFin] = useState(6.5)

  // Supuestos escenario pesimista
  const [pesDieselFin, setPesDieselFin] = useState(1800)
  const [pesUsdFin, setPesUsdFin] = useState(1080)
  const [pesIpcFin, setPesIpcFin] = useState(9.5)

  const cobActual = row ? row.cob : 20986
  const pagActual = row ? row.pag : 7577

  const rows = PROJ_MONTHS.map((m, mi) => {
    const t = (mi + 1) / 12
    const interp = (start, end) => Math.round(start + (end - start) * t)
    const interpF = (start, end) => +(start + (end - start) * t).toFixed(2)

    const d_o = interp(1411, optDieselFin)
    const u_o = interp(965, optUsdFin)
    const i_o = interpF(4.8, optIpcFin)

    const d_b = interp(1411, baseDieselFin)
    const u_b = interp(965, baseUsdFin)
    const i_b = interpF(4.8, baseIpcFin)

    const d_p = interp(1411, pesDieselFin)
    const u_p = interp(965, pesUsdFin)
    const i_p = interpF(4.8, pesIpcFin)

    return {
      m, d_o, d_b, d_p, u_o, u_b, u_p, i_o, i_b, i_p,
      t_o: calcTarifaProj(cobActual, pagActual, d_o, u_o, i_o, vars.pcomb, vars.margen, isRM),
      t_b: calcTarifaProj(cobActual, pagActual, d_b, u_b, i_b, vars.pcomb, vars.margen, isRM),
      t_p: calcTarifaProj(cobActual, pagActual, d_p, u_p, i_p, vars.pcomb, vars.margen, isRM),
    }
  })

  const dec = rows[8]

  useEffect(() => {
    if (!chartRef.current) return
    if (chartInstance.current) chartInstance.current.destroy()
    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: rows.map(r => r.m),
        datasets: [
          {
            label: 'Optimista',
            data: rows.map(r => r.t_o),
            borderColor: '#16A34A', tension: 0.4, borderWidth: 2.5,
            pointRadius: 4, pointBackgroundColor: '#16A34A', fill: false,
          },
          {
            label: 'Base',
            data: rows.map(r => r.t_b),
            borderColor: '#F47920', tension: 0.4, borderWidth: 2.5,
            pointRadius: 4, pointBackgroundColor: '#F47920', fill: false,
          },
          {
            label: 'Pesimista',
            data: rows.map(r => r.t_p),
            borderColor: '#DC2626', tension: 0.4, borderWidth: 2.5,
            pointRadius: 4, pointBackgroundColor: '#DC2626', fill: false,
          },
          {
            label: 'Tarifa actual',
            data: rows.map(() => cobActual),
            borderColor: '#6B7A99', borderWidth: 1.5, borderDash: [6, 3],
            pointRadius: 0, fill: false,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#6B7A99', font: { size: 11, family: 'DM Mono' }, boxWidth: 14, padding: 16 } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: $${Math.round(ctx.parsed.y).toLocaleString('es-CL')}` } },
        },
        scales: {
          x: { ticks: { color: '#6B7A99', font: { size: 10 } }, grid: { color: 'rgba(221,226,238,0.6)' } },
          y: {
            ticks: { color: '#6B7A99', font: { size: 10, family: 'DM Mono' }, callback: v => '$' + Math.round(v).toLocaleString('es-CL') },
            grid: { color: 'rgba(221,226,238,0.6)' },
            min: Math.round(Math.min(...rows.map(r => r.t_o)) * 0.93),
            max: Math.round(Math.max(...rows.map(r => r.t_p)) * 1.07),
          },
        },
      },
    })
    return () => { if (chartInstance.current) chartInstance.current.destroy() }
  }, [vars, rows])

  return (
    <div>
      {/* Selector */}
      <Card style={{ marginBottom: 14 }}>
        <CardHeader>Seleccionar referencia de proyección</CardHeader>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 9, color: '#6B7A99', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>CECOS</div>
            <select value={cecos} onChange={e => { setCecos(e.target.value); setZona(e.target.value === 'C_RM' ? 'URBANO' : 'VALPARAISO') }}>
              <option value="C_VIÑA">C_VIÑA — V Región</option>
              <option value="C_RM">C_RM — Urbano</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 9, color: '#6B7A99', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>Zona</div>
            <select value={zona} onChange={e => setZona(e.target.value)}>
              {zonas.map(z => <option key={z}>{z}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 9, color: '#6B7A99', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>Tamaño</div>
            <select value={tam} onChange={e => setTam(e.target.value)}>
              {Object.entries(TAM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          {row && (
            <div style={{ marginLeft: 'auto', background: '#F5F6F8', borderRadius: 8, padding: '8px 14px', textAlign: 'right' }}>
              <div style={{ fontSize: 9, color: '#6B7A99', fontWeight: 600, textTransform: 'uppercase' }}>Tarifa actual seleccionada</div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'DM Mono, monospace', color: '#1B3D6F' }}>${fmt(cobActual)}</div>
              {!isRM && <div style={{ fontSize: 9, color: '#6B7A99' }}>Pagar actual: ${fmt(pagActual)}</div>}
            </div>
          )}
        </div>
      </Card>

      {/* KPIs diciembre */}
      <Grid cols={3} gap={12} style={{ marginBottom: 14 }}>
        <KpiCard label="Optimista — dic 2026" value={'$' + fmt(dec.t_o)}
          sub={`Diesel $${fmt(dec.d_o)} | USD $${fmt(dec.u_o)} | IPC ${dec.i_o}%`}
          color="#16A34A" topColor="#16A34A" />
        <KpiCard label="Base — dic 2026" value={'$' + fmt(dec.t_b)}
          sub={`Diesel $${fmt(dec.d_b)} | USD $${fmt(dec.u_b)} | IPC ${dec.i_b}%`}
          color="#F47920" topColor="#F47920" />
        <KpiCard label="Pesimista — dic 2026" value={'$' + fmt(dec.t_p)}
          sub={`Diesel $${fmt(dec.d_p)} | USD $${fmt(dec.u_p)} | IPC ${dec.i_p}%`}
          color="#DC2626" topColor="#DC2626" />
      </Grid>

      {/* Gráfico */}
      <Card style={{ marginBottom: 14 }}>
        <CardHeader>Proyección tarifa {zona} {TAM_LABELS[tam]} — Abr 2026 → Mar 2027</CardHeader>
        <div style={{ position: 'relative', height: 260 }}>
          <canvas ref={chartRef} />
        </div>
      </Card>

      {/* Supuestos editables */}
      <Grid cols={3} gap={14} style={{ marginBottom: 14 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 10, height: 10, background: '#16A34A', borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#16A34A' }}>Supuestos Optimista</span>
          </div>
          <div style={{ fontSize: 9, color: '#6B7A99', marginBottom: 10 }}>Valores que se alcanzarían en Mar 2027</div>
          <SliderProj label="Diésel final ($/L)" value={optDieselFin} onChange={setOptDieselFin} min={600} max={1600} color="#16A34A" />
          <SliderProj label="USD/CLP final" value={optUsdFin} onChange={setOptUsdFin} min={700} max={1100} color="#16A34A" />
          <SliderProj label="IPC final (%)" value={optIpcFin} onChange={setOptIpcFin} min={1} max={10} step={0.1} color="#16A34A" suffix="%" />
          <Separator />
          <div style={{ fontSize: 10, color: '#16A34A', fontWeight: 600 }}>
            Tarifa resultante: ${fmt(rows[11].t_o)}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 10, height: 10, background: '#F47920', borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#F47920' }}>Supuestos Base</span>
          </div>
          <div style={{ fontSize: 9, color: '#6B7A99', marginBottom: 10 }}>Valores que se alcanzarían en Mar 2027</div>
          <SliderProj label="Diésel final ($/L)" value={baseDieselFin} onChange={setBaseDieselFin} min={1000} max={2000} color="#F47920" />
          <SliderProj label="USD/CLP final" value={baseUsdFin} onChange={setBaseUsdFin} min={800} max={1200} color="#F47920" />
          <SliderProj label="IPC final (%)" value={baseIpcFin} onChange={setBaseIpcFin} min={2} max={15} step={0.1} color="#F47920" suffix="%" />
          <Separator />
          <div style={{ fontSize: 10, color: '#F47920', fontWeight: 600 }}>
            Tarifa resultante: ${fmt(rows[11].t_b)}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 10, height: 10, background: '#DC2626', borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#DC2626' }}>Supuestos Pesimista</span>
          </div>
          <div style={{ fontSize: 9, color: '#6B7A99', marginBottom: 10 }}>Valores que se alcanzarían en Mar 2027</div>
          <SliderProj label="Diésel final ($/L)" value={pesDieselFin} onChange={setPesDieselFin} min={1300} max={2500} color="#DC2626" />
          <SliderProj label="USD/CLP final" value={pesUsdFin} onChange={setPesUsdFin} min={900} max={1400} color="#DC2626" />
          <SliderProj label="IPC final (%)" value={pesIpcFin} onChange={setPesIpcFin} min={5} max={20} step={0.1} color="#DC2626" suffix="%" />
          <Separator />
          <div style={{ fontSize: 10, color: '#DC2626', fontWeight: 600 }}>
            Tarifa resultante: ${fmt(rows[11].t_p)}
          </div>
        </Card>
      </Grid>

      {/* Tabla */}
      <Card padding={false}>
        <TableWrapper>
          <table style={{ minWidth: 820 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Mes</th>
                <th>Diesel Opt</th><th>Diesel Base</th><th>Diesel Pes</th>
                <th>USD Opt</th><th>USD Base</th><th>USD Pes</th>
                <th style={{ background: '#F0FDF4' }}>Tarifa Opt</th>
                <th style={{ background: '#FFF3E8' }}>Tarifa Base</th>
                <th style={{ background: '#FEF2F2' }}>Tarifa Pes</th>
                <th>Δ% Opt</th><th>Δ% Base</th><th>Δ% Pes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{r.m}</td>
                  <td style={{ color: '#16A34A' }}>${fmt(r.d_o)}</td>
                  <td style={{ color: '#F47920' }}>${fmt(r.d_b)}</td>
                  <td style={{ color: '#DC2626' }}>${fmt(r.d_p)}</td>
                  <td style={{ color: '#16A34A' }}>${fmt(r.u_o)}</td>
                  <td style={{ color: '#F47920' }}>${fmt(r.u_b)}</td>
                  <td style={{ color: '#DC2626' }}>${fmt(r.u_p)}</td>
                  <td style={{ color: '#16A34A', fontWeight: 600, background: '#F0FDF4' }}>${fmt(r.t_o)}</td>
                  <td style={{ color: '#F47920', fontWeight: 600, background: '#FFF3E8' }}>${fmt(r.t_b)}</td>
                  <td style={{ color: '#DC2626', fontWeight: 600, background: '#FEF2F2' }}>${fmt(r.t_p)}</td>
                  <td style={{ color: '#16A34A' }}>{pctSigned((r.t_o - cobActual) / cobActual)}</td>
                  <td style={{ color: '#F47920' }}>{pctSigned((r.t_b - cobActual) / cobActual)}</td>
                  <td style={{ color: '#DC2626' }}>{pctSigned((r.t_p - cobActual) / cobActual)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>
      </Card>
    </div>
  )
}
