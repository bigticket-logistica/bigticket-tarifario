import React from 'react'

export function Card({ children, style = {}, padding = true }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #DDE2EE',
      borderRadius: 12,
      padding: padding ? '16px' : 0,
      ...style
    }}>
      {children}
    </div>
  )
}

export function CardHeader({ children }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 700,
      color: '#6B7A99',
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      marginBottom: 12,
      paddingBottom: 10,
      borderBottom: '1px solid #E8EAF0',
    }}>
      {children}
    </div>
  )
}

export function KpiCard({ label, value, sub, color = '#1a2035', topColor = '#DDE2EE' }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #DDE2EE',
      borderRadius: 10,
      padding: '14px 16px',
      borderTop: `3px solid ${topColor}`,
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7A99', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'DM Mono, monospace', color, lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 10, color: '#6B7A99', marginTop: 4, fontFamily: 'DM Mono, monospace' }}>{sub}</div>}
    </div>
  )
}

export function Badge({ children, variant = 'blue' }) {
  const styles = {
    blue: { bg: '#E8EEF7', color: '#1B3D6F' },
    green: { bg: '#DCFCE7', color: '#15803D' },
    red: { bg: '#FEE2E2', color: '#B91C1C' },
    orange: { bg: '#FFF3E8', color: '#C95E0A' },
    gray: { bg: '#F1F5F9', color: '#475569' },
  }
  const s = styles[variant] || styles.blue
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 20,
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.5px',
      background: s.bg,
      color: s.color,
    }}>
      {children}
    </span>
  )
}

export function SliderRow({ label, value, display, min, max, step = 1, onChange, variant = 'orange', hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: '#1a2035' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'DM Mono, monospace', color: variant === 'blue' ? '#1B3D6F' : '#F47920' }}>
          {display}
        </span>
      </div>
      <input
        type="range"
        className={variant === 'blue' ? 'blue' : ''}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(+e.target.value)}
      />
      {hint && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#6B7A99', marginTop: 3, fontFamily: 'DM Mono, monospace' }}>
          {hint.map((h, i) => <span key={i}>{h}</span>)}
        </div>
      )}
    </div>
  )
}

export function Separator() {
  return <div style={{ borderTop: '1px solid #E8EAF0', margin: '12px 0' }} />
}

export function Grid({ cols = 2, gap = 14, children, style = {} }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gap,
      ...style
    }}>
      {children}
    </div>
  )
}

export function FactorBar({ label, value, max, color }) {
  const width = Math.min(100, (value / max) * 100)
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: '#1a2035' }}>{label}</span>
        <span style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', fontWeight: 600, color }}>
          +{(value * 100).toFixed(1)}%
        </span>
      </div>
      <div style={{ height: 5, background: '#E8EAF0', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${width}%`, background: color, borderRadius: 3, transition: 'width 0.3s ease' }} />
      </div>
    </div>
  )
}

export function AlertStrip({ children, variant = 'orange' }) {
  const colors = {
    orange: { bg: '#F47920', text: '#fff' },
    blue: { bg: '#1B3D6F', text: '#fff' },
    green: { bg: '#16A34A', text: '#fff' },
    red: { bg: '#DC2626', text: '#fff' },
  }
  const c = colors[variant]
  return (
    <div style={{ background: c.bg, padding: '6px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 6, height: 6, background: c.text, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ color: c.text, fontSize: 11, fontWeight: 600, letterSpacing: '0.2px' }}>{children}</div>
    </div>
  )
}

export function TableWrapper({ children }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      {children}
    </div>
  )
}
