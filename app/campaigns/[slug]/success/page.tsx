import { createClient } from '@/lib/supabase/server'
import SuccessClient from '@/components/donation/SuccessClient'

interface PageProps {
  params: { slug: string }
  searchParams: { reference?: string; id?: string; 'payment-status'?: string }
}

export default async function SuccessPage({ params, searchParams }: PageProps) {
  const reference = searchParams.reference || searchParams.id
  const supabase = createClient()

  let donation = null
  let campaign = null

  if (reference) {
    // Try to find donation by id (reference = donation id)
    const { data: donationData } = await supabase
      .from('donations')
      .select('*')
      .eq('id', reference)
      .single()

    if (donationData) {
      donation = donationData
      // Verify with Wompi API if we have a transaction id
      if (donationData.wompi_transaction_id && donationData.status === 'pending') {
        const wompiRes = await fetch(
          `https://sandbox.wompi.co/v1/transactions/${donationData.wompi_transaction_id}`,
          { cache: 'no-store' }
        )
        if (wompiRes.ok) {
          const wompiData = await wompiRes.json()
          const wompiStatus = wompiData.data?.status
          const newStatus = wompiStatus === 'APPROVED' ? 'approved' : wompiStatus === 'DECLINED' ? 'declined' : 'pending'

          await supabase
            .from('donations')
            .update({ status: newStatus })
            .eq('id', reference)

          donation = { ...donationData, status: newStatus }
        }
      }
    }

    const { data: campaignData } = await supabase
      .from('campaigns')
      .select('title, slug')
      .eq('slug', params.slug)
      .single()
    campaign = campaignData
  }

  return <SuccessClient donation={donation} campaign={campaign} />
}
