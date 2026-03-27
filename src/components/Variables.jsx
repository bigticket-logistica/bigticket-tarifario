import React from 'react'
import { Card, CardHeader, SliderRow, Separator, Grid } from './UI.jsx'
import { pct, pctSigned } from '../data.js'

export default function Variables({ vars, setVars, factor }) {
  const set = (key) => (val) => setVars(v => ({ ...v, [key]: val }))
  const { total, fComb, fIpc, fUsd, fOp } = factor

  return (
    <Grid cols={2} gap={14}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card>
          <CardHeader>Combustible</CardHeader>
          <SliderRow label="Diésel actual ($/L)" value={vars.diesel} display={'$' + vars.diesel.toLocaleString('es-CL')} min={500} max={2500} onChange={set('diesel')} hint={['$500', `ref: $${vars.dieselRef}`, '$2.500']} />
          <SliderRow label="Participación combustible en costo" value={vars.pcomb} display={vars.pcomb + '%'} min={15} max={45} onChange={set('pcomb')} hint={['15%', '', '45%']} />
          <SliderRow label="Petróleo Brent (USD/bbl)" value={vars.brent} display={'$' + vars.brent} min={50} max={160} onChange={set('brent')} variant="blue" hint={['$50', 'actual: $102', '$160']} />
        </Card>
        <Card>
          <CardHeader>Macro</CardHeader>
          <SliderRow label="USD / CLP actual" value={vars.usd} display={'$' + vars.usd.toLocaleString('es-CL')} min={700} max={1300} onChange={set('usd')} variant="blue" hint={['$700', `ref: $${vars.usdRef}`, '$1.300']} />
          <SliderRow label="IPC acumulado 12 meses (%)" value={vars.ipc} display={vars.ipc.toFixed(1) + '%'} min={0} max={20} step={0.1} onChange={set('ipc')} variant="blue" hint={['0%', '', '20%']} />
          <SliderRow label="Margen objetivo (%)" value={vars.margen} display={vars.margen + '%'} min={10} max={40} step={0.5} onChange={set('margen')} hint={['10%', '', '40%']} />
        </Card>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card>
          <CardHeader>Costos operacionales (índices, base = 100)</CardHeader>
          <SliderRow label="Mano de obra" value={vars.rrh} display={(vars.rrh / 100).toFixed(3)} min={100} max={130} step={0.1} onChange={set('rrh')} />
          <SliderRow label="Peajes y concesiones" value={vars.peaj} display={(vars.peaj / 100).toFixed(3)} min={100} max={130} step={0.1} onChange={set('peaj')} />
          <SliderRow label="Depreciación / mantención" value={vars.dep} display={(vars.dep / 100).toFixed(3)} min={100} max={135} step={0.1} onChange={set('dep')} />
          <SliderRow label="Seguros vehículo" value={vars.seg} display={(vars.seg / 100).toFixed(3)} min={100} max={130} step={0.1} onChange={set('seg')} />
        </Card>

        <Card>
          <CardHeader>Resultado en tiempo real</CardHeader>
          <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px solid #E8EAF0', marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7A99', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>
              Factor total de ajuste
            </div>
            <div style={{ fontSize: 44, fontWeight: 700, fontFamily: 'DM Mono, monospace', color: '#F47920' }}>
              {total.toFixed(3)}x
            </div>
            <div style={{ fontSize: 11, color: '#6B7A99', fontFamily: 'DM Mono, monospace' }}>
              +{((total - 1) * 100).toFixed(1)}% sobre costo base
            </div>
          </div>

          <Grid cols={2} gap={8}>
            {[
              { lbl: 'F_combustible', val: fComb, color: '#DC2626' },
              { lbl: 'F_ipc/laboral', val: fIpc, color: '#1B3D6F' },
              { lbl: 'F_tipo cambio', val: fUsd, color: '#F47920' },
              { lbl: 'F_operacional', val: fOp, color: '#16A34A' },
            ].map(item => (
              <div key={item.lbl} style={{ padding: '8px 10px', background: '#F5F6F8', borderRadius: 6 }}>
                <div style={{ fontSize: 9, color: '#6B7A99', marginBottom: 2 }}>{item.lbl}</div>
                <div style={{ fontWeight: 600, color: item.color, fontFamily: 'DM Mono, monospace', fontSize: 13 }}>
                  +{pct(item.val)}
                </div>
              </div>
            ))}
          </Grid>
        </Card>
      </div>
    </Grid>
  )
}
