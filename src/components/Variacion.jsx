import React, { useState, useMemo } from 'react'
import { Card, CardHeader, Badge, Separator, Grid, TableWrapper } from './UI.jsx'
import { DATA_VINA, DATA_RM, calcTarifa, fmt, pct, pctSigned, SIZES_AVG, TAM_LABELS } from '../data.js'

function DiffRow({ label, old, newVal, delta, deltaColor = '#F47920' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '0.5px solid #E8EAF0' }}>
      <span style={{ flex: 1, fontSize: 11, fontWeight: 500, color: '#1a2035' }}>{label}</span>
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#6B7A99', textDecoration: 'line-through' }}>{old}</span>
      <span style={{ color: '#6B7A99', fontSize: 12 }}>→</span>
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, fontWeight: 600, color: '#F47920' }}>{newVal}</span>
      {delta && <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, fontWeight: 600, color: deltaColor }}>{delta}</span>}
    </div>
  )
}

export default function Variacion({ vars, factor }) {
  const [cecos, setCecos] = useState('C_VIÑA')
  const [zona, setZona] = useState('VALPARAISO')
  const [tam, setTam] = useState('BIGTICKET')

  const isRM = cecos === 'C_RM'
  const data = isRM ? DATA_RM : DATA_VINA
  const zonas = useMemo(() => [...new Set(data.map(r => r.zona))].sort(), [cecos, data])
  const row = data.find(r => r.zona === zona && r.tam === tam)

  const result = row ? calcTarifa(row.cob, row.pag, factor.total, vars.margen, isRM) : null
  const mhoy = row && row.cob > 0 ? (row.cob - row.pag) / row.cob : 0
  const mnew = result && result.nc > 0 ? (result.nc - result.np) / result.nc : 0
  const alzaCob = result ? result.nc - row.cob : 0
  const alzaPag = result && row ? result.np - row.pag : 0
  const ok = mnew >= vars.margen / 100 - 0.001

  return (
    <div>
      <Grid cols={2} gap={14} style={{ marginBottom: 14 }}>
        <Card>
          <CardHeader>Seleccionar zona y tamaño</CardHeader>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <select value={cecos} onChange={e => { setCecos(e.target.value); setZona(e.target.value === 'C_RM' ? 'URBANO' : 'VALPARAISO') }}>
              <option value="C_VIÑA">C_VIÑA</option>
              <option value="C_RM">C_RM</option>
            </select>
            <select value={zona} onChange={e => setZona(e.target.value)}>
              {zonas.map(z => <option key={z}>{z}</option>)}
            </select>
            <select value={tam} onChange={e => setTam(e.target.value)}>
              {Object.entries(TAM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {row && result ? (
            <>
              <DiffRow label="Cobrar por guía" old={`$${fmt(row.cob)}`} newVal={`$${fmt(result.nc)}`} delta={`+$${fmt(alzaCob)}`} />
              <DiffRow label="Pagar al tercero" old={`$${fmt(row.pag)}`} newVal={`$${fmt(result.np)}`} delta={result.np > 0 ? `+$${fmt(alzaPag)}` : '—'} deltaColor="#1B3D6F" />
              <DiffRow label="Margen" old={pct(mhoy)} newVal={pct(mnew)} delta={ok ? 'OK' : 'Revisar'} deltaColor={ok ? '#16A34A' : '#DC2626'} />
              <DiffRow label="Alza cobrar %" old="" newVal={pctSigned(alzaCob / row.cob)} delta="" />
              <DiffRow label="Factor aplicado" old="" newVal={factor.total.toFixed(4) + 'x'} delta="" />
            </>
          ) : (
            <div style={{ fontSize: 11, color: '#6B7A99' }}>Sin datos para esta combinación</div>
          )}
        </Card>

        <Card>
          <CardHeader>Variación visual</CardHeader>
          {row && result ? (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: '#6B7A99', marginBottom: 8, fontWeight: 600 }}>Cobrar por guía</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                  <div style={{
                    flex: row.cob, height: 32, background: '#E8EEF7', borderRadius: 4,
                    display: 'flex', alignItems: 'center', padding: '0 10px',
                    maxWidth: `${Math.round(row.cob / result.nc * 100)}%`
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#1B3D6F', whiteSpace: 'nowrap' }}>${fmt(row.cob)}</span>
                  </div>
                  <div style={{
                    flex: alzaCob, height: 32, background: '#F47920', borderRadius: 4,
                    display: 'flex', alignItems: 'center', padding: '0 8px',
                    maxWidth: `${Math.round(alzaCob / result.nc * 100)}%`, minWidth: 44
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>+${fmt(alzaCob)}</span>
                  </div>
                </div>
                <div style={{ fontSize: 9, color: '#6B7A99' }}>
                  Total nuevo: <strong style={{ color: '#F47920' }}>${fmt(result.nc)}</strong> — alza <strong style={{ color: '#F47920' }}>{pctSigned(alzaCob / row.cob)}</strong>
                </div>
              </div>

              {row.pag > 0 ? (
                <div>
                  <div style={{ fontSize: 10, color: '#6B7A99', marginBottom: 8, fontWeight: 600 }}>Pagar al tercero</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                    <div style={{
                      flex: row.pag, height: 32, background: '#E8EEF7', borderRadius: 4,
                      display: 'flex', alignItems: 'center', padding: '0 10px',
                      maxWidth: `${Math.round(row.pag / result.np * 100)}%`
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#1B3D6F', whiteSpace: 'nowrap' }}>${fmt(row.pag)}</span>
                    </div>
                    <div style={{
                      flex: alzaPag, height: 32, background: '#2D5FA0', borderRadius: 4,
                      display: 'flex', alignItems: 'center', padding: '0 8px',
                      maxWidth: `${Math.round(alzaPag / result.np * 100)}%`, minWidth: 40
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>+${fmt(alzaPag)}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 9, color: '#6B7A99' }}>
                    Total nuevo pagar: <strong style={{ color: '#1B3D6F' }}>${fmt(result.np)}</strong> — alza <strong style={{ color: '#1B3D6F' }}>{pctSigned(alzaPag / row.pag)}</strong>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 11, color: '#6B7A99', padding: '8px 0' }}>C_RM: modelo arriendo diario — sin pago por guía individual</div>
              )}
            </>
          ) : null}
        </Card>
      </Grid>

      <Card padding={false}>
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #E8EAF0', fontSize: 10, fontWeight: 700, color: '#6B7A99', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Resumen variación — todos los tamaños C_VIÑA (promedios)
        </div>
        <TableWrapper>
          <table style={{ minWidth: 780 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Tamaño</th>
                <th>Cobrar hoy</th><th>Nuevo cobrar</th>
                <th>Pagar hoy</th><th>Nuevo pagar</th>
                <th>Margen hoy</th><th>Nuevo margen</th>
                <th>Alza cobrar $</th><th>Alza cobrar %</th><th>Alza pagar $</th>
              </tr>
            </thead>
            <tbody>
              {SIZES_AVG.map(s => {
                const { nc, np } = calcTarifa(s.cob, s.pag, factor.total, vars.margen, false)
                const mh = (s.cob - s.pag) / s.cob
                const mn = (nc - np) / nc
                const ac = nc - s.cob, ap = np - s.pag
                return (
                  <tr key={s.tam}>
                    <td><Badge variant="blue">{TAM_LABELS[s.tam]}</Badge></td>
                    <td>${fmt(s.cob)}</td>
                    <td style={{ color: '#F47920', fontWeight: 600 }}>${fmt(nc)}</td>
                    <td>${fmt(s.pag)}</td>
                    <td style={{ color: '#1B3D6F', fontWeight: 600 }}>${fmt(np)}</td>
                    <td>{pct(mh)}</td>
                    <td style={{ color: '#16A34A', fontWeight: 600 }}>{pct(mn)}</td>
                    <td style={{ color: '#F47920', fontWeight: 600 }}>+${fmt(ac)}</td>
                    <td style={{ color: '#F47920', fontWeight: 600 }}>{pctSigned(ac / s.cob)}</td>
                    <td style={{ color: '#1B3D6F', fontWeight: 600 }}>+${fmt(ap)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </TableWrapper>
      </Card>
    </div>
  )
}
