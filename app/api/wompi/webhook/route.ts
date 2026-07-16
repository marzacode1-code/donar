import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'

function verifyWompiSignature(payload: string, signature: string, secret: string): boolean {
  const hash = createHash('sha256').update(payload + secret).digest('hex')
  return hash === signature
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-event-checksum') || ''
    const secret = process.env.WOMPI_EVENTS_SECRET || ''

    // Verify signature in production
    if (secret && !verifyWompiSignature(body, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)

    if (event.event !== 'transaction.updated') {
      return NextResponse.json({ received: true })
    }

    const transaction = event.data?.transaction
    if (!transaction) {
      return NextResponse.json({ received: true })
    }

    const reference = transaction.reference
    const wompiStatus = transaction.status
    const transactionId = transaction.id

    const newStatus: 'approved' | 'declined' | 'pending' =
      wompiStatus === 'APPROVED' ? 'approved' :
      wompiStatus === 'DECLINED' || wompiStatus === 'VOIDED' || wompiStatus === 'ERROR' ? 'declined' :
      'pending'

    const supabase = createServiceClient()

    const { data: donation } = await supabase
      .from('donations')
      .select('id, status')
      .eq('id', reference)
      .single()

    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 })
    }

    if (donation.status !== newStatus) {
      await supabase
        .from('donations')
        .update({
          status: newStatus,
          wompi_transaction_id: transactionId,
          wompi_reference: reference,
        })
        .eq('id', reference)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Wompi webhook error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
