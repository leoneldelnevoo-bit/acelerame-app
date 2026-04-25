/**
 * Verificación de transacciones USDT en red TRON.
 * Usamos TronGrid API (free tier, no necesita key para consultas básicas).
 *
 * USDT en TRON es un contrato TRC20:
 *   address: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t (contrato oficial USDT)
 *   decimals: 6
 */

const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
const TRONGRID_API = 'https://api.trongrid.io'

export interface TronTransfer {
  txHash: string
  from: string
  to: string
  amountUSD: number
  timestamp: number
  confirmed: boolean
}

/**
 * Busca transferencias USDT entrantes a una wallet TRON en un rango de tiempo.
 * @param walletAddress Nuestra wallet (destino)
 * @param minTimestamp Timestamp mínimo en ms (ej: hace 3 horas)
 */
export async function getRecentUSDTTransfers(
  walletAddress: string,
  minTimestamp: number
): Promise<TronTransfer[]> {
  const url = `${TRONGRID_API}/v1/accounts/${walletAddress}/transactions/trc20` +
    `?only_to=true` +
    `&contract_address=${USDT_CONTRACT}` +
    `&min_timestamp=${minTimestamp}` +
    `&limit=50`

  const headers: Record<string, string> = { 'Accept': 'application/json' }
  if (process.env.TRONGRID_API_KEY) {
    headers['TRON-PRO-API-KEY'] = process.env.TRONGRID_API_KEY
  }

  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`TronGrid API ${response.status}: ${await response.text()}`)
  }

  const data = await response.json()
  if (!data.data || !Array.isArray(data.data)) return []

  return data.data
    .filter((tx: any) => tx.to === walletAddress)
    .map((tx: any) => ({
      txHash: tx.transaction_id,
      from: tx.from,
      to: tx.to,
      // USDT tiene 6 decimales en TRON
      amountUSD: Number(tx.value) / 1_000_000,
      timestamp: Number(tx.block_timestamp),
      confirmed: true,
    }))
}

/**
 * Verificar una transacción específica por hash.
 */
export async function getTransactionByHash(txHash: string): Promise<TronTransfer | null> {
  const url = `${TRONGRID_API}/wallet/gettransactioninfobyid?value=${txHash}`
  const headers: Record<string, string> = { 'Accept': 'application/json' }
  if (process.env.TRONGRID_API_KEY) {
    headers['TRON-PRO-API-KEY'] = process.env.TRONGRID_API_KEY
  }

  const response = await fetch(url, { headers })
  if (!response.ok) return null

  const tx = await response.json()
  if (!tx || !tx.receipt) return null

  // Requiere parseo más profundo del log para extraer from/to/amount
  // Simplificado: este helper es útil solo para confirmar existencia
  return {
    txHash,
    from: '',
    to: '',
    amountUSD: 0,
    timestamp: tx.blockTimeStamp || 0,
    confirmed: tx.receipt.result === 'SUCCESS',
  }
}
