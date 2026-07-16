export const WOMPI_BASE_URL = 'https://sandbox.wompi.co/v1'

export interface WompiTransaction {
  id: string
  status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING'
  reference: string
  amount_in_cents: number
  currency: string
  payment_method_type: string
}

export async function getWompiTransaction(transactionId: string): Promise<WompiTransaction | null> {
  try {
    const res = await fetch(`${WOMPI_BASE_URL}/transactions/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
      },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.data
  } catch {
    return null
  }
}

export async function buildWompiChecksum(
  reference: string,
  amountInCents: number,
  currency: string,
  expirationTime: string,
): Promise<string> {
  const integritySecret = process.env.WOMPI_EVENTS_SECRET!
  const data = `${reference}${amountInCents}${currency}${expirationTime}${integritySecret}`
  const encoded = new TextEncoder().encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
