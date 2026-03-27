import React from 'react'
import { Card, CardHeader, KpiCard, Badge, FactorBar, Separator, Grid } from './UI.jsx'
import { calcTarifa, fmt, pct, pctSigned, SIZES_AVG, TAM_LABELS } from '../data.js'


function FormulaLine({ vars, factor }) {
  const { total, fComb, fIpc, fUsd, fOp } = factor
  const lines = [
    { comment: true, text: `// F_diesel = (${Math.round(vars.diesel)} / ${vars.dieselRef} - 1) x ${vars.pcomb}%`, result: `= +${(fComb*100).toFixed(1)}%` },
    { comment: true, text: `// F_ipc    = ${(vars.ipc/100*100).toFixed(1)}% x 32%`, result: `= +${(fIpc*100).toFixed(1)}%` },
    { comment: true, text: `// F_usd    = (${Math.round(vars.usd)} / ${vars.usdRef} - 1) x 15%`, result: `= +${(fUsd*100).toFixed(1)}%` },
    { comment: true, text: `// F_op     = (idx_prom - 1) x 15%`, result: `= +${(fOp*100).toFixed(1)}%` },
  ]
  const sep = '-'.repeat(50)
  const factorLine = `Factor = 1 + ${(fComb*100).toFixed(1)}% + ${(fIpc*100).toFixed(1)}% + ${(fUsd*100).toFixed(1)}% + ${(fOp*100).toFixed(1)}%`
  const newCobrar = `Nuevo_Cobrar = (Pagar x ${total.toFixed(4)}) / (1 - ${vars.margen}%)`
  return (
    <div>
      {lines.map((l, i) => (
        <div key={i}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>{l.text}{'  '}</span>
          <span style={{ color: '#60A5FA' }}>{l.result}</span>
        </div>
      ))}
      <div style={{ color: 'rgba(255,255,255,0.3)', margin: '4px 0' }}>{sep}</div>
      <div>
        <span style={{ color: '#F47920', fontWeight: 500 }}>{factorLine}</span>
        <span style={{ color: '#F47920', fontWeight: 700 }}> = {total.toFixed(4)}x</span>
      </div>
      <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>{`// Nuevo cobrar C_VIÑA (mantener margen ${vars.margen}%)`}</div>
      <div>
        <span style={{ color: '#F47920' }}>Nuevo_Cobrar</span>
        <span style={{ color: '#fff' }}> = (Pagar x {total.toFixed(4)}) / (1 - {vars.margen}%)</span>
      </div>
    </div>
  )
}

export default function Dashboard({ vars, factor }) {
  const { total, fComb, fIpc, fUsd, fOp } = factor
  const margen = vars.margen

  const methods = [
    { n: 'Lineal +$3.000', nc: 20986 + 3000, np: Math.round(7577 * total) },
    { n: 'Estándar +20%', nc: Math.round(20986 * 1.20), np: Math.round(7577 * total) },
    { n: 'Porcentual variable ★', ...calcTarifa(20986, 7577, total, margen, false) },
  ]

  const costSegs = [
    { lbl: 'Combustible', w: vars.pcomb / 100, c: '#DC2626' },
    { lbl: 'Laboral', w: 0.32, c: '#1B3D6F' },
    { lbl: 'USD imp.', w: 0.15, c: '#F47920' },
    { lbl: 'Operac.', w: 0.15, c: '#16A34A' },
    { lbl: 'Otros', w: Math.max(0, 1 - vars.pcomb / 100 - 0.32 - 0.15 - 0.15), c: '#CBD5E1' },
  ]

  return (
    <div>
      <Grid cols={4} gap={12} style={{ marginBottom: 16 }}>
        <KpiCard label="Factor de ajuste" value={total.toFixed(3) + 'x'} sub="sobre precio actual" color="#F47920" topColor="#F47920" />
        <KpiCard label="Diésel actual" value={'$' + fmt(vars.diesel)} sub={`ref. $${fmt(vars.dieselRef)}/L (+${pct((vars.diesel / vars.dieselRef) - 1)})`} color="#DC2626" topColor="#DC2626" />
        <KpiCard label="USD / CLP" value={'$' + fmt(vars.usd)} sub={`ref. $${fmt(vars.usdRef)} (${pctSigned((vars.usd - vars.usdRef) / vars.usdRef)})`} color="#1B3D6F" topColor="#1B3D6F" />
        <KpiCard label="Margen objetivo" value={vars.margen + '%'} sub="C_VIÑA y C_RM" color="#16A34A" topColor="#16A34A" />
      </Grid>

      <Grid cols={2} gap={14} style={{ marginBottom: 14 }}>
        <Card>
          <CardHeader>Desglose del factor de ajuste total</CardHeader>
          <FactorBar label="Combustible" value={fComb} max={0.25} color="#DC2626" />
          <FactorBar label="IPC / Laboral" value={fIpc} max={0.08} color="#1B3D6F" />
          <FactorBar label="Tipo de cambio" value={fUsd} max={0.08} color="#F47920" />
          <FactorBar label="Operacional" value={fOp} max={0.05} color="#16A34A" />
          <Separator />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#6B7A99' }}>Factor total</span>
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'DM Mono, monospace', color: '#F47920' }}>{total.toFixed(3)}x</span>
          </div>
          <Separator />
          <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7A99', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>
            Estructura de costos
          </div>
          <div style={{ height: 28, display: 'flex', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
            {costSegs.map(s => (
              <div key={s.lbl} style={{ flex: s.w, background: s.c, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 24 }}>
                <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{Math.round(s.w * 100)}%</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {costSegs.map(s => (
              <div key={s.lbl} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, background: s.c, borderRadius: 2 }} />
                <span style={{ fontSize: 9, color: '#6B7A99' }}>{s.lbl}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>Comparativa de métodos — C_VIÑA BIGTICKET promedio</CardHeader>
          <div style={{ fontSize: 10, color: '#6B7A99', marginBottom: 10 }}>Cobrar hoy: $20.986 / Pagar hoy: $7.577</div>
          <table>
            <thead>
              <tr><th>Método</th><th>Nuevo cobrar</th><th>Margen</th><th>Resultado</th></tr>
            </thead>
            <tbody>
              {methods.map((m, i) => {
                const nm = (m.nc - m.np) / m.nc
                const ok = nm >= margen / 100 - 0.001
                return (
                  <tr key={i}>
                    <td>{m.n}</td>
                    <td>${fmt(m.nc)}</td>
                    <td>{pct(nm)}</td>
                    <td><Badge variant={ok ? 'green' : 'red'}>{ok ? 'Cumple' : 'No cumple'}</Badge></td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <Separator />
          <CardHeader>Impacto por tamaño — C_VIÑA promedio</CardHeader>
          <table>
            <thead>
              <tr><th>Tamaño</th><th>Cobrar hoy</th><th>Nuevo cobrar</th><th>Alza %</th></tr>
            </thead>
            <tbody>
              {SIZES_AVG.map(s => {
                const { nc } = calcTarifa(s.cob, s.pag, total, margen, false)
                const alza = (nc - s.cob) / s.cob
                return (
                  <tr key={s.tam}>
                    <td><Badge variant="blue">{TAM_LABELS[s.tam]}</Badge></td>
                    <td>${fmt(s.cob)}</td>
                    <td style={{ color: '#F47920', fontWeight: 600 }}>${fmt(nc)}</td>
                    <td style={{ color: '#F47920', fontWeight: 600 }}>{pctSigned(alza)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      </Grid>

      <Card>
        <CardHeader>Fórmula matemática activa</CardHeader>
        <div style={{
          background: '#1B3D6F',
          borderRadius: 8,
          padding: '14px 16px',
          fontFamily: 'DM Mono, monospace',
          fontSize: 11,
          lineHeight: 2,
          whiteSpace: 'pre-wrap',
        }}>
          <FormulaLine vars={vars} factor={factor} />
        </div>
      </Card>
    </div>
  )
}
