# Motor n8n multi-tenant — ACELERAME

## Cómo funciona

El motor n8n vive en un host externo (n8n cloud o self-hosted) y se ejecuta cada 10 minutos. En cada tick:

1. **Lee la lista de clientes activos** desde el master Supabase:
   ```sql
   SELECT id, slug, supabase_url, supabase_anon_key, schema_db
   FROM master.clientes
   WHERE estado = 'activo' AND motor_activo = true;
   ```

2. **Para cada cliente**, abre conexión a SU Supabase y procesa su funnel:
   - Lee leads etapa 0 → envía DMs (etapa 1)
   - Verifica respuestas → avanza etapa
   - Genera replies con Claude → envía
   - etc.

3. **Después de cada acción**, descuenta créditos del cliente:
   ```sql
   SELECT master.descontar_creditos(
     '<cliente_id>'::uuid,
     'dm_ig',         -- accion
     1,               -- cantidad
     '<lead_handle>'::text,  -- referencia
     '{"campana": "..."}'::jsonb
   );
   ```
   Esta función:
   - Resta del saldo
   - Inserta registro en `creditos_consumo`
   - Si saldo llega a 0, desactiva motor automáticamente

4. **Si el cliente se queda sin créditos** durante un tick, se envía notificación por email.

## Acciones y costos

| Acción | Créditos | Costo USD aprox |
|---|---|---|
| dm_ig | 1 | $0.10 |
| email | 0.3 | $0.03 |
| whatsapp | 3 | $0.30 |
| ia_mensaje | 2 | $0.20 |
| enriquecimiento | 5 | $0.50 |

## Estructura del workflow refactorizado

```
[Cron 10min]
    ↓
[GET master.clientes WHERE motor_activo=true]
    ↓
[Loop por cliente]
    ├── [Setup: crear conexión Supabase del cliente]
    ├── [CEREBRO: planificar acciones según etapas]
    ├── [Ejecutar acciones via Apify (DMs, scraping)]
    ├── [Generar replies con Claude]
    ├── [POST master.descontar_creditos por cada acción]
    └── [Loop next cliente]
```

## Archivos

- `n8n_MANANA.json` (raíz del proyecto) → workflow original mono-tenant Sukhafé
- Próximo trabajo: convertir a multi-tenant siguiendo este esquema

## Notas técnicas

- El workflow NO debe usar credenciales hardcoded del Supabase de Poncho.
  Tiene que leer `supabase_url` y `supabase_anon_key` de cada fila de `master.clientes`.

- El nodo "Descontar Créditos" debe ejecutarse DESPUÉS de cada acción exitosa,
  nunca antes. Si la acción falla, no se descuenta.

- Los founders (`es_founder = true`) descuentan créditos también pero su saldo
  inicial es muy alto (10000+). Sirve como contabilidad interna.
