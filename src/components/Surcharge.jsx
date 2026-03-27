import React, { useState } from 'react'
import { Card, CardHeader, SliderRow, Separator, Grid } from './UI.jsx'
import { fmt, pct } from '../data.js'

const DIESEL_LEVELS = [700, 831, 900, 1000, 1100, 1200, 1300, 1411, 1500, 1600, 1800, 2000]
const COBRO_BASES = [5000, 10000, 15000, 20000, 30000, 50000]

export default function Surcharge({ vars }) {
  const [dieselAct, setDieselAct] = useState(1411)
  const [dieselRef, setDieselRef] = useState(831)
  const [umbral, setUmbral] = useState(5)
  const pcomb = vars.pcomb / 100

  const variacion = (dieselAct - dieselRef) / dieselRef
  const activa = variacion > umbral / 100
  const surpct = Math.max(0, variacion * pcomb)

  const getStatus = (dl) => {
    const s = Math.max(0, (dl - dieselRef) / dieselRef * pcomb)
    if (dl < dieselRef) return { label: 'Bajo ref.', variant: 'green' }
    if (s > 0.15) return { label: 'Crítico', variant: 'red' }
    if (s > 0.05) return { label: 'Alto', variant: 'orange' }
    return { label: 'Base', variant: 'blue' }
  }

  return (
    <Grid cols={2} gap={14}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card>
          <CardHeader>Configuración del mecanismo</CardHeader>
          <SliderRow label="Precio diésel actual ($/L)" value={dieselAct} display={'$' + dieselAct.toLocaleString('es-CL')} min={500} max={2500} onChange={setDieselAct} />
          <SliderRow label="Precio referencia contrato ($/L)" value={dieselRef} display={'$' + dieselRef.toLocaleString('es-CL')} min={400} max={1600} onChange={setDieselRef} variant="blue" />
          <SliderRow label="Umbral de activación (%)" value={umbral} display={umbral + '%'} min={1} max={20} step={0.5} onChange={setUmbral} />
          <Separator />

          <Grid cols={2} gap={10} style={{ marginBottom: 12 }}>
            <div style={{ padding: 12, background: '#F5F6F8', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#6B7A99', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>Variación</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'DM Mono, monospace', color: variacion > 0 ? '#DC2626' : '#16A34A' }}>
                {variacion >= 0 ? '+' : ''}{pct(variacion)}
              </div>
            </div>
            <div style={{ padding: 12, background: activa ? '#FFF3E8' : '#F5F6F8', borderRadius: 8, textAlign: 'center', border: activa ? '1px solid #FDDCBE' : '1px solid transparent' }}>
              <div style={{ fontSize: 9, color: '#6B7A99', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>Surcharge</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'DM Mono, monospace', color: activa ? '#F47920' : '#6B7A99' }}>
                +{pct(surpct)}
              </div>
            </div>
          </Grid>

          <div style={{
            padding: '8px 12px', borderRadius: 6,
            background: activa ? '#FFF3E8' : '#F0FDF4',
            border: `1px solid ${activa ? '#FDDCBE' : '#BBF7D0'}`,
            fontSize: 11, fontWeight: 600,
            color: activa ? '#C95E0A' : '#15803D',
          }}>
            {activa ? 'Surcharge activo — aplicar recargo al cobro' : 'Sin recargo — dentro del umbral definido'}
          </div>
        </Card>

        <Card>
          <CardHeader>Recargo por nivel de cobro base</CardHeader>
          <table>
            <thead>
              <tr><th style={{ textAlign: 'left' }}>Cobro base</th><th>Recargo</th><th>Total a cobrar</th></tr>
            </thead>
            <tbody>
              {COBRO_BASES.map(b => (
                <tr key={b}>
                  <td>${fmt(b)}</td>
                  <td style={{ color: activa ? '#F47920' : '#6B7A99' }}>
                    {activa ? `+$${fmt(Math.round(b * surpct))}` : '—'}
                  </td>
                  <td style={{ fontWeight: 600, color: '#1B3D6F' }}>${fmt(Math.round(b * (1 + surpct)))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card>
        <CardHeader>Tabla de referencia — surcharge por nivel de diésel</CardHeader>
        <div style={{ overflowY: 'auto', maxHeight: 480 }}>
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Diésel ($/L)</th>
                <th>Variación</th>
                <th>Surcharge %</th>
                <th>s/$10.000</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {DIESEL_LEVELS.map(dl => {
                const vr = (dl - dieselRef) / dieselRef
                const s = Math.max(0, vr * pcomb)
                const isActive = Math.abs(dl - dieselAct) < 55
                const { label, variant } = getStatus(dl)
                const varColor = dl < dieselRef ? '#16A34A' : dl <= dieselRef * 1.1 ? '#6B7A99' : dl <= dieselRef * 1.3 ? '#D97706' : '#DC2626'
                return (
                  <tr key={dl} style={{ background: isActive ? '#FFF3E8' : 'transparent' }}>
                    <td style={{ fontWeight: isActive ? 600 : 400 }}>${fmt(dl)}</td>
                    <td style={{ color: varColor }}>{vr >= 0 ? '+' : ''}{pct(vr)}</td>
                    <td style={{ color: varColor, fontWeight: 600 }}>{pct(s)}</td>
                    <td style={{ color: varColor }}>{s > 0 ? `+$${fmt(Math.round(10000 * s))}` : '—'}</td>
                    <td>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700,
                        background: variant === 'green' ? '#DCFCE7' : variant === 'red' ? '#FEE2E2' : variant === 'orange' ? '#FFF3E8' : '#E8EEF7',
                        color: variant === 'green' ? '#15803D' : variant === 'red' ? '#B91C1C' : variant === 'orange' ? '#C95E0A' : '#1B3D6F',
                      }}>{label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </Grid>
  )
}
