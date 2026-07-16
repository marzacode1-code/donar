import HomeClient from '@/components/home/HomeClient'
import { MOCK_CAMPAIGNS, MOCK_STATS, IS_DEMO } from '@/lib/utils/mockData'
import type { Campaign, PlatformStats } from '@/lib/supabase/types'

export const revalidate = 60

export default async function HomePage() {
  let campaigns: Campaign[] = MOCK_CAMPAIGNS
  let stats: PlatformStats = MOCK_STATS

  if (!IS_DEMO) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const [campaignsResult, statsResult] = await Promise.all([
      supabase.from('campaigns').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(10),
      supabase.from('platform_stats').select('*').single(),
    ])
    if (campaignsResult.data) campaigns = campaignsResult.data as Campaign[]
    if (statsResult.data) stats = statsResult.data as PlatformStats
  }

  return <HomeClient campaigns={campaigns} stats={stats} />
}
