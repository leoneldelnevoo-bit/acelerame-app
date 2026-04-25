# ACELERAME · SaaS

Motor de prospección B2B multi-canal automatizada con IA.

## Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** Tailwind CSS + paleta "Oro Moderno" (negro + dorado)
- **Database:** Supabase (schema `master` + proyecto por cliente)
- **Auth:** Supabase Auth
- **Payments:** USDT/TRON (TRC20) manual · Stripe (futuro)
- **Deploy:** Vercel

## Arquitectura multi-tenant

```
┌─────────────────────────────────────┐
│  Supabase MASTER (schema `master`) │
│  • clientes                         │
│  • creditos_saldo                   │
│  • creditos_consumo                 │
│  • creditos_compras                 │
│  • pagos_usdt_pendientes            │
│  • precios_acciones                 │
│  • paquetes_credito                 │
│  • configuracion                    │
└─────────────┬───────────────────────┘
              │
              │ (cada cliente referencia a su Supabase propio)
              ▼
┌─────────────────────────────────────┐
│  Supabase del CLIENTE (BYODB)       │
│  • prospeccion_leads                │
│  • pipelines                        │
│  • conversaciones                   │
└─────────────────────────────────────┘
```

## Setup local

```bash
npm install
cp .env.example .env.local
# completar las variables
npm run dev
```

## Deploy

Auto-deploy a Vercel al push a `main`.

## Modelo de cobro

- Sin suscripción mensual
- Pay-per-use: el cliente carga "créditos" (1 crédito = $0.10 USD)
- Paquetes: Starter ($50/500) · Growth ($150/2000) · Pro ($400/6000)

## Roadmap

- [x] Schema master + datos Poncho cargados
- [x] Landing pública
- [x] Auth (login/registro)
- [x] Dashboard con widget de saldo
- [ ] Página /creditos con historial de consumo
- [ ] Página /recargar con flujo USDT/TRON
- [ ] Verificación blockchain automática
- [ ] Panel admin
- [ ] Workflow n8n parametrizado
- [ ] Migración Poncho al nuevo sistema

<!-- deploy 1777085257386 -->
