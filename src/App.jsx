import React, { useState, useMemo } from 'react'
import { AlertStrip } from './components/UI.jsx'
import Dashboard from './components/Dashboard.jsx'
import Variables from './components/Variables.jsx'
import Tarifario from './components/Tarifario.jsx'
import Variacion from './components/Variacion.jsx'
import Proyecciones from './components/Proyecciones.jsx'
import Surcharge from './components/Surcharge.jsx'
import { DEFAULTS, calcFactor } from './data.js'

const TABS = [
  { id: 'dashboard', label: 'Resumen' },
  { id: 'variables', label: 'Variables' },
  { id: 'tarifario', label: 'Tarifario' },
  { id: 'variacion', label: 'Variación' },
  { id: 'proyecciones', label: 'Proyecciones' },
  { id: 'surcharge', label: 'Fuel Surcharge' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [vars, setVars] = useState(DEFAULTS)
  const factor = useMemo(() => calcFactor(vars), [vars])

  return (
    <div style={{ minHeight: '100vh', background: '#F5F6F8' }}>
      <div style={{ background: '#1B3D6F', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: '#fff', borderRadius: 6, padding: '4px 12px' }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#1B3D6F', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              big<span style={{ color: '#F47920' }}>ticket</span>
            </div>
            <div style={{ fontSize: 7, color: '#6B7A99', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500 }}>
              logística y transporte
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 500 }}>
            Motor Tarifario Dinámico — 
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Mono, monospace' }}>Factor activo</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#F47920', fontFamily: 'DM Mono, monospace' }}>
              {factor.total.toFixed(3)}x
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'DM Mono, monospace' }}>
            26/03/2026
          </div>
        </div>
      </div>

      <AlertStrip>
        Alerta de mercado: Diésel +$580/L (+69.8%) — Mayor alza desde 1991 — Ajuste tarifario requerido
      </AlertStrip>

      <div style={{ background: '#fff', borderBottom: '2px solid #E8EAF0', padding: '0 20px', display: 'flex', gap: 0 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 18px',
              fontSize: 12,
              fontWeight: activeTab === tab.id ? 600 : 500,
              color: activeTab === tab.id ? '#F47920' : '#6B7A99',
              border: 'none',
              background: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? '#F47920' : 'transparent'}`,
              marginBottom: -2,
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '16px 20px' }}>
        {activeTab === 'dashboard' && <Dashboard vars={vars} factor={factor} />}
        {activeTab === 'variables' && <Variables vars={vars} setVars={setVars} factor={factor} />}
        {activeTab === 'tarifario' && <Tarifario vars={vars} factor={factor} />}
        {activeTab === 'variacion' && <Variacion vars={vars} factor={factor} />}
        {activeTab === 'proyecciones' && <Proyecciones vars={vars} />}
        {activeTab === 'surcharge' && <Surcharge vars={vars} />}
      </div>

      <div style={{ textAlign: 'center', padding: '20px', fontSize: 10, color: '#6B7A99', borderTop: '1px solid #E8EAF0', marginTop: 20 }}>
        Bigticket Logística y Transporte · Motor Tarifario Dinámico v1.0 · CANON 2026
      </div>
    </div>
  )
}
