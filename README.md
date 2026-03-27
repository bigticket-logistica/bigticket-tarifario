# Bigticket — Motor Tarifario Dinámico

Motor de cálculo tarifario para Bigticket Logística y Transporte, cliente CANON 2026.

## Stack

- **React 18** + **Vite 5**
- **Chart.js 4** para proyecciones
- Sin dependencias CSS externas — diseño propio en colores corporativos Bigticket

## Correr localmente

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

## Build para producción

```bash
npm run build
```

El output queda en `/dist` listo para Vercel o cualquier hosting estático.

## Deploy en Vercel

### Opción 1 — Vercel CLI
```bash
npm i -g vercel
vercel
```

### Opción 2 — GitHub + Vercel
1. Sube este repo a GitHub
2. En [vercel.com](https://vercel.com) → New Project → importa el repo
3. Framework: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy ✓

## Estructura

```
src/
├── data.js              # Datos tarifario + motor matemático
├── App.jsx              # Shell principal + estado global
├── index.css            # Estilos globales + colores Bigticket
└── components/
    ├── UI.jsx           # Componentes reutilizables
    ├── Dashboard.jsx    # Resumen + factor + métodos
    ├── Variables.jsx    # Sliders de inputs
    ├── Tarifario.jsx    # Tabla completa cobrar/pagar
    ├── Variacion.jsx    # Comparativo actual vs nuevo
    ├── Proyecciones.jsx # Escenarios 12 meses
    └── Surcharge.jsx    # Fuel surcharge automático
```

## Lógica matemática

```
Factor_total = 1
  + (Diesel_actual/Diesel_ref - 1) × % participación combustible  // ≈ +19.5%
  + IPC_acumulado × 0.32                                          // ≈ +1.5%
  + (USD_actual/USD_ref - 1) × 0.15                              // ≈ +1.6%
  + (Índice_operacional_prom - 1) × 0.15                         // ≈ +0.9%

Nuevo_Pagar   = Pagar_actual × Factor_total
Nuevo_Cobrar  = Nuevo_Pagar / (1 - Margen_objetivo)
```

## Colores corporativos

| Token | Hex |
|---|---|
| Naranja Bigticket | `#F47920` |
| Azul Bigticket | `#1B3D6F` |
| Blanco | `#FFFFFF` |
