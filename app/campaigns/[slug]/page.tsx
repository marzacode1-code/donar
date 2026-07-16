import { notFound } from 'next/navigation'
import CampaignDetailClient from '@/components/campaigns/CampaignDetailClient'
import { MOCK_CAMPAIGNS, IS_DEMO } from '@/lib/utils/mockData'
import type { Campaign, Profile, Donation, TraceabilityUpdate } from '@/lib/supabase/types'

export const revalidate = 60

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps) {
  if (IS_DEMO) {
    const campaign = MOCK_CAMPAIGNS.find(c => c.slug === params.slug)
    if (!campaign) return {}
    return { title: campaign.title, description: campaign.description.slice(0, 160) }
  }
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const { data } = await supabase.from('campaigns').select('title, description').eq('slug', params.slug).single()
    if (!data) return {}
    return { title: data.title, description: data.description.slice(0, 160) }
  } catch {
    return {}
  }
}

const MOCK_DONATIONS: Donation[] = [
  { id: 'd1', campaign_id: '1', donor_id: null, amount: 50000, wompi_transaction_id: null, wompi_reference: null, status: 'approved', donor_name: 'María García', donor_message: '¡Ánimo, los apoyamos!', is_anonymous: false, created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'd2', campaign_id: '1', donor_id: null, amount: 20000, wompi_transaction_id: null, wompi_reference: null, status: 'approved', donor_name: null, donor_message: null, is_anonymous: true, created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'd3', campaign_id: '1', donor_id: null, amount: 100000, wompi_transaction_id: null, wompi_reference: null, status: 'approved', donor_name: 'Carlos Restrepo', donor_message: 'Una causa muy noble, sigamos adelante.', is_anonymous: false, created_at: new Date(Date.now() - 86400000).toISOString() },
]

const MOCK_UPDATES: TraceabilityUpdate[] = [
  { id: 't1', campaign_id: '1', stage: 'initial', title: 'Inicio de la campaña', description: 'Comenzamos el proceso de registro y planificación. Identificamos los puntos de mayor concentración de animales y contactamos a veterinarios voluntarios.', images: [], receipt_urls: [], created_at: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: 't2', campaign_id: '1', stage: 'execution', title: 'Primera compra de insumos', description: 'Adquirimos 200 kg de concentrado premium y vitaminas para el primer mes. Las facturas están adjuntas para total transparencia.', images: [], receipt_urls: [], created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
]

const MOCK_COMMENTS = [
  { id: 'c1', campaign_id: '1', content: 'Excelente iniciativa, los apoyo completamente desde Bogotá.', created_at: new Date(Date.now() - 3600000).toISOString(), profiles: { full_name: 'Laura Mendez', avatar_url: null } },
  { id: 'c2', campaign_id: '1', content: '¿Cómo puedo ayudar como voluntario además de donar?', created_at: new Date(Date.now() - 7200000).toISOString(), profiles: { full_name: 'Andrés Castillo', avatar_url: null } },
]

export default async function CampaignDetailPage({ params }: PageProps) {
  let campaign: Campaign | null = null
  let creator: Profile | null = null
  let donations: Donation[] = MOCK_DONATIONS
  let comments = MOCK_COMMENTS
  let traceabilityUpdates: TraceabilityUpdate[] = MOCK_UPDATES
  let currentUser: Profile | null = null

  if (IS_DEMO) {
    campaign = MOCK_CAMPAIGNS.find(c => c.slug === params.slug) || null
    creator = { id: 'u1', full_name: 'Ana Martínez', avatar_url: null, email: 'ana@donatech.co', role: 'creator', department: 'Valle del Cauca', city: 'Cali', kyc_verified: true, kyc_document_url: null, created_at: new Date().toISOString() }
  } else {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const [campaignResult, authResult] = await Promise.all([
      supabase.from('campaigns').select('*').eq('slug', params.slug).single(),
      supabase.auth.getUser(),
    ])
    if (campaignResult.error || !campaignResult.data) notFound()
    campaign = campaignResult.data as Campaign
    const user = authResult.data.user
    const [creatorResult, donationsResult, commentsResult, traceabilityResult, profileResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', campaign!.creator_id).single(),
      supabase.from('donations').select('*').eq('campaign_id', campaign!.id).eq('status', 'approved').order('created_at', { ascending: false }).limit(20),
      supabase.from('comments').select('*, profiles(*)').eq('campaign_id', campaign!.id).order('created_at', { ascending: false }),
      supabase.from('traceability_updates').select('*').eq('campaign_id', campaign!.id).order('created_at', { ascending: true }),
      user ? supabase.from('profiles').select('*').eq('id', user.id).single() : Promise.resolve({ data: null }),
    ])
    creator = creatorResult.data as Profile
    donations = (donationsResult.data || []) as Donation[]
    comments = commentsResult.data || []
    traceabilityUpdates = (traceabilityResult.data || []) as TraceabilityUpdate[]
    currentUser = profileResult.data
  }

  if (!campaign) notFound()

  return (
    <CampaignDetailClient
      campaign={campaign}
      creator={creator}
      donations={donations}
      comments={comments}
      traceabilityUpdates={traceabilityUpdates}
      currentUser={currentUser}
    />
  )
}
