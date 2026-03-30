import React, { useState } from 'react'
import { Card, Badge, TableWrapper } from './UI.jsx'
import { DATA_VINA, DATA_RM, calcTarifa, calcDetalle, fmt, pct, pctSigned, TAM_LABELS } from '../data.js'

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
                const { nc, np, margenHoy, margenNuevo, necesitaAjuste } = calcDetalle(r.cob, r.pag, factor.total, vars.margen, isRM)
                return (
                  <tr key={i} style={{ background: necesitaAjuste ? '#FFFBF5' : 'transparent' }}>
                    <td>{r.zona}{r.veh ? ` (${r.veh})` : ''}</td>
                    <td><Badge variant="blue">{TAM_LABELS[r.tam]}</Badge></td>
                    <td>${fmt(r.cob)}</td>
                    <td>${fmt(r.pag)}</td>
                    <td>{pct(margenHoy)}</td>
                    <td style={{ color: necesitaAjuste ? '#F47920' : '#16A34A', fontWeight: 600, background: necesitaAjuste ? '#FFF3E8' : '#F0FDF4' }}>
                      ${fmt(nc)}
                    </td>
                    <td style={{ background: necesitaAjuste ? '#FFF3E8' : '#F0FDF4' }}>
                      ${fmt(np)}
                    </td>
                    <td style={{ color: '#16A34A', fontWeight: 600, background: necesitaAjuste ? '#FFF3E8' : '#F0FDF4' }}>
                      {pct(margenNuevo)}
                    </td>
                    <td style={{ color: necesitaAjuste ? '#F47920' : '#6B7A99', fontWeight: 600 }}>
                      {necesitaAjuste ? '+$' + fmt(nc - r.cob) : '—'}
                    </td>
                    <td style={{ color: necesitaAjuste ? '#F47920' : '#6B7A99', fontWeight: 600 }}>
                      {necesitaAjuste ? pctSigned((nc - r.cob) / r.cob) : '—'}
                    </td>
                    <td>
                      <Badge variant={necesitaAjuste ? 'orange' : 'green'}>
                        {necesitaAjuste ? 'Ajustar precio' : 'Margen OK'}
                      </Badge>
                    </td>
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
