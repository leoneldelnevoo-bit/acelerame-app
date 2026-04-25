# ACELERAME SaaS

Motor de prospección B2B con IA. Multi-tenant, BYODB.

## Live

- **App**: https://acelerame-app.vercel.app
- **Dominio futuro**: acelerame.online (DNS pendiente)
- **Master DB**: Supabase `nulxpixgcdviuwfnxbqc` schema `master`

## Estructura

```
src/
├── app/
│   ├── (auth)/         # login, registro
│   ├── (dashboard)/    # dashboard, leads, bandeja, campanas, integraciones, creditos, recargar, admin
│   └── api/            # auth/signout, integraciones/supabase, campanas/motor, cron/verify-usdt
├── components/         # UI components
├── lib/
│   ├── cliente-db.ts   # ⭐ Helper BYODB: getClienteContext + createClienteSupabase
│   ├── supabase/       # master server/client
│   ├── tron/           # USDT payment verification
│   └── utils.ts        # formatNumber, formatUSD, timeAgo, cn
└── middleware.ts       # Auth gate
n8n/                    # Workflows multi-tenant (próximo refactor)
```

## Flujo end-to-end

1. Usuario se registra → master.clientes (sin DB conectada)
2. Va a /integraciones → pega URL + anon_key de su Supabase
3. API testea conexión + guarda credenciales encriptadas
4. Vuelve al /dashboard → ve sus métricas reales (leads, pipeline, conversaciones)
5. Va a /campanas → activa el motor (requiere saldo > 0)
6. n8n cron cada 10min lee master.clientes WHERE motor_activo=true
7. Por cada cliente: lee su pipeline, ejecuta acciones, descuenta créditos via master.descontar_creditos()

## Clientes registrados

- **Leo** (founder): 10.000 créditos · Supabase nulxpixgcdviuwfnxbqc/public · 464 leads cargados
- **Poncho** (founder): 2.666 créditos · Supabase ntmoehzdqvbvcgnoxxpp/public · 17.775 leads cargados
- **Ariel** (trial): pendiente DB

## Costos por acción

| Acción | Créditos |
|---|---|
| dm_ig | 1 |
| email | 0.3 |
| whatsapp | 3 |
| ia_mensaje | 2 |
| enriquecimiento | 5 |

1 crédito = $0.10 USD

## Paquetes

- Starter $50 → 500 créditos
- **Growth $150 → 2000 créditos** ⭐ (mejor ratio)
- Pro $400 → 6000 créditos

Pago: USDT/TRON manual con verificación blockchain automática (cron 3min).
Wallet: `TDzkBiQiMc8EnxWZ5f1wVBi4hSx5aRfHWy`

## Auth

- Cliente: poncho@sukhafe.com / Sukhafe2026!
- Admin: leoneldelnevo@gmail.com / Acelerame2026!

