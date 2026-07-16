import { IS_DEMO, MOCK_CAMPAIGNS } from '@/lib/utils/mockData'
import DashboardClient from '@/components/dashboard/DashboardClient'
import type { Campaign, Donation, Profile } from '@/lib/supabase/types'

export const metadata = { title: 'Mi Dashboard' }

const DEMO_PROFILE: Profile = {
  id: 'demo',
  full_name: 'Ana Martínez (Demo)',
  avatar_url: null,
  email: 'demo@donatech.co',
  role: 'creator',
  department: 'Valle del Cauca',
  city: 'Cali',
  kyc_verified: true,
  kyc_document_url: null,
  created_at: new Date().toISOString(),
}

const DEMO_DONATIONS: Donation[] = [
  { id: 'd1', campaign_id: '1', donor_id: null, amount: 50000, wompi_transaction_id: null, wompi_reference: null, status: 'approved', donor_name: 'María García', donor_message: null, is_anonymous: false, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'd2', campaign_id: '1', donor_id: null, amount: 100000, wompi_transaction_id: null, wompi_reference: null, status: 'approved', donor_name: 'Carlos Restrepo', donor_message: null, is_anonymous: false, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 'd3', campaign_id: '2', donor_id: null, amount: 20000, wompi_transaction_id: null, wompi_reference: null, status: 'approved', donor_name: null, donor_message: null, is_anonymous: true, created_at: new Date(Date.now() - 86400000).toISOString() },
]

export default async function DashboardPage() {
  if (IS_DEMO) {
    return (
      <DashboardClient
        profile={DEMO_PROFILE}
        campaigns={MOCK_CAMPAIGNS.slice(0, 3) as Campaign[]}
        donations={DEMO_DONATIONS}
      />
    )
  }

  const { redirect } = await import('next/navigation')
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/campaigns')
  const userId = user!.id

  const [profileResult, campaignsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('campaigns').select('*').eq('creator_id', userId).order('created_at', { ascending: false }),
  ])
  const profile = profileResult.data
  const campaigns = campaignsResult.data || []
  const campaignIds = campaigns.map(c => c.id)
  const { data: donations } = campaignIds.length > 0
    ? await supabase.from('donations').select('*').in('campaign_id', campaignIds).eq('status', 'approved').order('created_at', { ascending: false }).limit(50)
    : { data: [] }

  return <DashboardClient profile={profile} campaigns={campaigns} donations={donations || []} />
}
