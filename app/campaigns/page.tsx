import CampaignsClient from '@/components/campaigns/CampaignsClient'
import { MOCK_CAMPAIGNS, IS_DEMO } from '@/lib/utils/mockData'
import type { Campaign } from '@/lib/supabase/types'

export const revalidate = 30

export const metadata = {
  title: 'Explorar Campañas',
  description: 'Descubre campañas sociales verificadas en Colombia.',
}

export default async function CampaignsPage() {
  let campaigns: Campaign[] = MOCK_CAMPAIGNS

  if (!IS_DEMO) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const { data } = await supabase.from('campaigns').select('*').in('status', ['active', 'executing']).order('collected_amount', { ascending: false })
    if (data) campaigns = data as Campaign[]
  }

  return <CampaignsClient campaigns={campaigns} />
}
