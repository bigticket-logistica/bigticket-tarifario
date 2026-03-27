import React, { useState } from 'react'
import { Card, Badge, TableWrapper } from './UI.jsx'
import { DATA_VINA, DATA_RM, calcTarifa, fmt, pct, pctSigned, TAM_LABELS } from '../data.js'

export default function Tarifario({ vars, factor }) {
  const [cecos, setCecos] = useState('C_VIÑA')
  const [size, setSize] = useState('all')

  const isRM = cecos === 'C_RM'
  const data = isRM ? DATA_RM : DATA_VINA
  const rows = data.filter(r => size === 'all' || r.tam === size)

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={cecos} onChange={e => setCecos(e.target.value)}>
          <option value="C_VIÑA">C_VIÑA — V Región</option>
          <option value="C_RM">C_RM — Urbano Santiago</option>
        </select>
        <select value={size} onChange={e => setSize(e.target.value)}>
          <option value="all">Todos los tamaños</option>
          <option value="SMALLTICKET">SMALLTICKET</option>
          <option value="MEDIUMTICKET">MEDIUMTICKET</option>
          <option value="BIGTICKET">BIGTICKET</option>
          <option value="SUPERBIGTICKET">SUPERBIGTICKET</option>
          <option value="OVERSIZED">OVERSIZED</option>
        </select>
        <div style={{ marginLeft: 'auto', fontSize: 10, color: '#6B7A99', fontFamily: 'DM Mono, monospace' }}>
          {rows.length} registros
        </div>
      </div>

      <Card padding={false}>
        <TableWrapper>
          <table style={{ minWidth: 820 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', minWidth: 130 }}>Zona</th>
                <th>Tamaño</th>
                <th>Cobrar hoy</th>
                <th>Pagar hoy</th>
                <th>Margen hoy</th>
                <th style={{ background: '#FFF3E8' }}>Nuevo cobrar</th>
                <th style={{ background: '#FFF3E8' }}>Nuevo pagar</th>
                <th style={{ background: '#FFF3E8' }}>Nuevo margen</th>
                <th>Alza $</th>
                <th>Alza %</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const { nc, np } = calcTarifa(r.cob, r.pag, factor.total, vars.margen, isRM)
                const mhoy = r.cob > 0 ? (r.cob - r.pag) / r.cob : 1
                const mnew = nc > 0 ? (nc - np) / nc : 0
                const alza = nc - r.cob
                const alzap = r.cob > 0 ? alza / r.cob : 0
                const ok = mnew >= vars.margen / 100 - 0.001
                return (
                  <tr key={i}>
                    <td>{r.zona}{r.veh ? ` (${r.veh})` : ''}</td>
                    <td><Badge variant="blue">{TAM_LABELS[r.tam]}</Badge></td>
                    <td>${fmt(r.cob)}</td>
                    <td>${fmt(r.pag)}</td>
                    <td>{pct(mhoy)}</td>
                    <td style={{ color: '#F47920', fontWeight: 600, background: '#FFF3E8' }}>${fmt(nc)}</td>
                    <td style={{ background: '#FFF3E8' }}>${fmt(np)}</td>
                    <td style={{ color: ok ? '#16A34A' : '#DC2626', fontWeight: 600, background: '#FFF3E8' }}>{pct(mnew)}</td>
                    <td style={{ color: '#F47920', fontWeight: 600 }}>+${fmt(alza)}</td>
                    <td style={{ color: '#F47920', fontWeight: 600 }}>{pctSigned(alzap)}</td>
                    <td><Badge variant={ok ? 'green' : 'red'}>{ok ? 'OK' : 'Revisar'}</Badge></td>
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
