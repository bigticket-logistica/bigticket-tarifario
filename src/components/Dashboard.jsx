import React, { useState } from 'react'
import { Card, CardHeader, KpiCard, Badge, FactorBar, Separator, Grid } from './UI.jsx'
import { calcDetalle, fmt, pct, pctSigned, SIZES_AVG, TAM_LABELS, DATA_VINA } from '../data.js'

function FormulaLine({ vars, factor }) {
  const { total, fComb, fIpc, fUsd, fOp } = factor
  const lines = [
    { text: `// F_diesel = (${Math.round(vars.diesel)} / ${vars.dieselRef} - 1) x ${vars.pcomb}%`, result: `= +${(fComb*100).toFixed(1)}%` },
    { text: `// F_ipc    = ${vars.ipc.toFixed(1)}% x 32%`, result: `= +${(fIpc*100).toFixed(1)}%` },
    { text: `// F_usd    = (${Math.round(vars.usd)} / ${vars.usdRef} - 1) x 15%`, result: `= +${(fUsd*100).toFixed(1)}%` },
    { text: `// F_op     = (idx_prom - 1) x 15%`, result: `= +${(fOp*100).toFixed(1)}%` },
  ]
  return (
    <div>
      {lines.map((l, i) => (
        <div key={i}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>{l.text}{'  '}</span>
          <span style={{ color: '#60A5FA' }}>{l.result}</span>
        </div>
      ))}
      <div style={{ color: 'rgba(255,255,255,0.3)', margin: '4px 0' }}>{'—'.repeat(48)}</div>
      <div>
        <span style={{ color: '#F47920' }}>Factor = 1 + {(fComb*100).toFixed(1)}% + {(fIpc*100).toFixed(1)}% + {(fUsd*100).toFixed(1)}% + {(fOp*100).toFixed(1)}%</span>
        <span style={{ color: '#fff', fontWeight: 700 }}> = {total.toFixed(4)}x</span>
      </div>
      <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>
        {'// Nuevo cobrar C_VIÑA: solo sube si margen cae bajo ' + vars.margen + '%'}
      </div>
      <div>
        <span style={{ color: '#F47920' }}>Nuevo_Cobrar</span>
        <span style={{ color: '#fff' }}> = MAX(Cobrar_actual, (Pagar x {total.toFixed(3)}) / (1 - {vars.margen}%))</span>
      </div>
    </div>
  )
}

function EditableKpi({ label, value, onChange, prefix = '', suffix = '', color = '#1B3D6F' }) {
  const [editing, setEditing] = useState(false)
  const [tmp, setTmp] = useState(value)
  return (
    <div style={{ background: '#F5F6F8', borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: '#6B7A99', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>{label}</div>
      {editing ? (
        <input
          type="number"
          value={tmp}
          onChange={e => setTmp(+e.target.value)}
          onBlur={() => { onChange(tmp); setEditing(false) }}
          onKeyDown={e => e.key === 'Enter' && (onChange(tmp), setEditing(false))}
          autoFocus
          style={{ width: '100%', fontSize: 16, fontWeight: 700, fontFamily: 'DM Mono, monospace', color, border: '1px solid ' + color, borderRadius: 4, padding: '2px 6px', background: '#fff' }}
        />
      ) : (
        <div
          onClick={() => { setTmp(value); setEditing(true) }}
          style={{ fontSize: 16, fontWeight: 700, fontFamily: 'DM Mono, monospace', color, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {prefix}{fmt(value)}{suffix}
          <span style={{ fontSize: 9, color: '#6B7A99', fontWeight: 400 }}>✎ editar</span>
        </div>
      )}
    </div>
  )
}

export default function Dashboard({ vars, factor }) {
  const { total, fComb, fIpc, fUsd, fOp } = factor
  const margen = vars.margen

  const [arriendoBoxer, setArriendoBoxer] = useState(110000)
  const [arriendoPartner, setArriendoPartner] = useState(85000)
  const [guiasMesVina, setGuiasMesVina] = useState(3000)
  const [guiasMesRM, setGuiasMesRM] = useState(5000)
  const [diasHabiles, setDiasHabiles] = useState(22)

  const zonaConAjuste = DATA_VINA.filter(r => calcDetalle(r.cob, r.pag, total, margen, false).necesitaAjuste)
  const zonaOK = DATA_VINA.filter(r => !calcDetalle(r.cob, r.pag, total, margen, false).necesitaAjuste)

  const impactoVina = DATA_VINA.reduce((acc, r) => {
    const { nc, necesitaAjuste } = calcDetalle(r.cob, r.pag, total, margen, false)
    return acc + (necesitaAjuste ? nc - r.cob : 0)
  }, 0)
  const impactoVinaTotal = (impactoVina / DATA_VINA.length) * guiasMesVina

  const cobrosRM = [2500, 5500, 9500, 11500, 18500]
  const cobrosRMNuevos = cobrosRM.map(c => Math.round(c * total))
  const cobPromedioRMNuevo = cobrosRMNuevos.reduce((a, b) => a + b, 0) / cobrosRMNuevos.length
  const alzaPromRM = cobPromedioRMNuevo - cobrosRM.reduce((a, b) => a + b, 0) / cobrosRM.length
  const impactoRMTotal = alzaPromRM * guiasMesRM
  const peqBoxer = Math.ceil(arriendoBoxer / cobPromedioRMNuevo)
  const peqPartner = Math.ceil(arriendoPartner / cobPromedioRMNuevo)

  const costSegs = [
    { lbl: 'Combustible', w: vars.pcomb / 100, c: '#DC2626' },
    { lbl: 'Laboral', w: 0.32, c: '#1B3D6F' },
    { lbl: 'USD imp.', w: 0.15, c: '#F47920' },
    { lbl: 'Operac.', w: 0.15, c: '#16A34A' },
    { lbl: 'Otros', w: Math.max(0, 1 - vars.pcomb / 100 - 0.62), c: '#CBD5E1' },
  ]

  return (
    <div>
      <Grid cols={4} gap={12} style={{ marginBottom: 16 }}>
        <KpiCard label="Factor de ajuste" value={total.toFixed(3) + 'x'} sub="sobre costo base" color="#F47920" topColor="#F47920" />
        <KpiCard label="Diésel actual" value={'$' + fmt(vars.diesel)} sub={`ref. $${fmt(vars.dieselRef)}/L (+${pct((vars.diesel/vars.dieselRef)-1)})`} color="#DC2626" topColor="#DC2626" />
        <KpiCard label="USD / CLP" value={'$' + fmt(vars.usd)} sub={`ref. $${fmt(vars.usdRef)} (${pctSigned((vars.usd-vars.usdRef)/vars.usdRef)})`} color="#1B3D6F" topColor="#1B3D6F" />
        <KpiCard label="Margen objetivo" value={vars.margen + '%'} sub="piso mínimo garantizado" color="#16A34A" topColor="#16A34A" />
      </Grid>

      <Grid cols={2} gap={14} style={{ marginBottom: 14 }}>
        <Card>
          <CardHeader>Desglose del factor de ajuste</CardHeader>
          <FactorBar label="Combustible" value={fComb} max={0.25} color="#DC2626" />
          <FactorBar label="IPC / Laboral" value={fIpc} max={0.08} color="#1B3D6F" />
          <FactorBar label="Tipo de cambio" value={fUsd} max={0.08} color="#F47920" />
          <FactorBar label="Operacional" value={fOp} max={0.05} color="#16A34A" />
          <Separator />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#6B7A99' }}>Factor total</span>
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'DM Mono, monospace', color: '#F47920' }}>{total.toFixed(3)}x</span>
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7A99', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>Estructura de costos</div>
          <div style={{ height: 28, display: 'flex', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
            {costSegs.map(s => (
              <div key={s.lbl} style={{ flex: s.w, background: s.c, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 20 }}>
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
          <CardHeader>Zonas C_VIÑA — estado de precios</CardHeader>
          <Grid cols={2} gap={10} style={{ marginBottom: 14 }}>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#16A34A', fontFamily: 'DM Mono, monospace' }}>{zonaOK.length}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#16A34A', marginTop: 2 }}>Zonas con Margen OK</div>
              <div style={{ fontSize: 9, color: '#6B7A99', marginTop: 4 }}>No requieren cambio de precio</div>
            </div>
            <div style={{ background: '#FFF3E8', border: '1px solid #FDDCBE', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#F47920', fontFamily: 'DM Mono, monospace' }}>{zonaConAjuste.length}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#F47920', marginTop: 2 }}>Zonas requieren ajuste</div>
              <div style={{ fontSize: 9, color: '#6B7A99', marginTop: 4 }}>Margen caería bajo {margen}%</div>
            </div>
          </Grid>
          {zonaConAjuste.length > 0 ? (
            <>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7A99', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>Zonas que necesitan ajuste</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[...new Set(zonaConAjuste.map(r => r.zona))].map(z => (
                  <span key={z} style={{ background: '#FFF3E8', color: '#C95E0A', border: '1px solid #FDDCBE', borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 600 }}>{z}</span>
                ))}
              </div>
            </>
          ) : (
            <div style={{ background: '#F0FDF4', borderRadius: 8, padding: 12, textAlign: 'center', fontSize: 11, color: '#16A34A', fontWeight: 600 }}>
              Todas las zonas mantienen margen sobre {margen}%
            </div>
          )}
          <Separator />
          <CardHeader>Impacto por tamaño C_VIÑA — promedio zonas</CardHeader>
          <table>
            <thead>
              <tr><th>Tamaño</th><th>Cobrar hoy</th><th>Nuevo cobrar</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {SIZES_AVG.map(s => {
                const { nc, necesitaAjuste, margenNuevo } = calcDetalle(s.cob, s.pag, total, margen, false)
                return (
                  <tr key={s.tam}>
                    <td><Badge variant="blue">{TAM_LABELS[s.tam]}</Badge></td>
                    <td>${fmt(s.cob)}</td>
                    <td style={{ color: necesitaAjuste ? '#F47920' : '#16A34A', fontWeight: 600 }}>${fmt(nc)}</td>
                    <td><Badge variant={necesitaAjuste ? 'orange' : 'green'}>{necesitaAjuste ? 'Ajustar' : pct(margenNuevo) + ' margen'}</Badge></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      </Grid>

      <Grid cols={2} gap={14} style={{ marginBottom: 14 }}>
        <Card>
          <CardHeader>Impacto en facturación mensual — C_VIÑA</CardHeader>
          <div style={{ fontSize: 10, color: '#6B7A99', marginBottom: 10 }}>Haz clic en cualquier número para editarlo con tus datos reales</div>
          <EditableKpi label="Guías por mes C_VIÑA" value={guiasMesVina} onChange={setGuiasMesVina} suffix=" guías" color="#1B3D6F" />
          <div style={{ background: zonaConAjuste.length > 0 ? '#FFF3E8' : '#F0FDF4', borderRadius: 8, padding: 14, marginTop: 12 }}>
            <div style={{ fontSize: 10, color: '#6B7A99', marginBottom: 4 }}>Aumento estimado de facturación mensual</div>
            <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'DM Mono, monospace', color: zonaConAjuste.length > 0 ? '#F47920' : '#16A34A' }}>
              ${fmt(Math.abs(Math.round(impactoVinaTotal)))}
            </div>
            <div style={{ fontSize: 10, color: '#6B7A99', marginTop: 4 }}>
              {zonaConAjuste.length > 0
                ? `Aplica a ${zonaConAjuste.length} filas con ajuste requerido`
                : 'Sin ajuste de precio necesario — margen garantizado'}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>C_RM — punto de equilibrio y facturación</CardHeader>
          <div style={{ fontSize: 10, color: '#6B7A99', marginBottom: 10 }}>Haz clic en cualquier número para editarlo</div>
          <Grid cols={2} gap={8} style={{ marginBottom: 10 }}>
            <EditableKpi label="Arriendo Boxer ($/día)" value={arriendoBoxer} onChange={setArriendoBoxer} prefix="$" color="#1B3D6F" />
            <EditableKpi label="Arriendo Partner ($/día)" value={arriendoPartner} onChange={setArriendoPartner} prefix="$" color="#1B3D6F" />
            <EditableKpi label="Días hábiles/mes" value={diasHabiles} onChange={setDiasHabiles} suffix=" días" color="#1B3D6F" />
            <EditableKpi label="Guías por mes C_RM" value={guiasMesRM} onChange={setGuiasMesRM} suffix=" guías" color="#1B3D6F" />
          </Grid>
          <Separator />
          <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7A99', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>
            Guías mínimas por día para cubrir arriendo
          </div>
          <Grid cols={2} gap={8} style={{ marginBottom: 12 }}>
            <div style={{ background: '#E8EEF7', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#1B3D6F', fontWeight: 600, marginBottom: 4 }}>BOXER</div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'DM Mono, monospace', color: '#1B3D6F' }}>{peqBoxer}</div>
              <div style={{ fontSize: 9, color: '#6B7A99' }}>guías/día mínimo</div>
            </div>
            <div style={{ background: '#E8EEF7', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#1B3D6F', fontWeight: 600, marginBottom: 4 }}>PARTNER</div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'DM Mono, monospace', color: '#1B3D6F' }}>{peqPartner}</div>
              <div style={{ fontSize: 9, color: '#6B7A99' }}>guías/día mínimo</div>
            </div>
          </Grid>
          <div style={{ background: '#FFF3E8', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 10, color: '#6B7A99', marginBottom: 4 }}>Aumento facturación mensual C_RM con factor {total.toFixed(3)}x</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'DM Mono, monospace', color: '#F47920' }}>
              +${fmt(Math.round(impactoRMTotal))}
            </div>
            <div style={{ fontSize: 9, color: '#6B7A99', marginTop: 2 }}>sobre {fmt(guiasMesRM)} guías/mes estimadas</div>
          </div>
        </Card>
      </Grid>

      <Card>
        <CardHeader>Fórmula matemática activa</CardHeader>
        <div style={{ background: '#1B3D6F', borderRadius: 8, padding: '14px 16px', fontFamily: 'DM Mono, monospace', fontSize: 11, lineHeight: 2 }}>
          <FormulaLine vars={vars} factor={factor} />
        </div>
      </Card>
    </div>
  )
}
