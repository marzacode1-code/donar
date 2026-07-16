import { IS_DEMO, MOCK_CAMPAIGNS, MOCK_STATS } from '@/lib/utils/mockData'
import AdminClient from '@/components/admin/AdminClient'

export const metadata = { title: 'Administración' }

const DEMO_PENDING = [
  {
    id: 'p1',
    title: 'Biblioteca comunitaria en Soacha',
    slug: 'biblioteca-comunitaria-soacha',
    description: 'Queremos crear una biblioteca digital y física para los niños del barrio San Mateo en Soacha. Contamos con el apoyo de 5 docentes voluntarios y un espacio prestado.',
    category: 'ayuda_social',
    department: 'Cundinamarca',
    city: 'Soacha',
    goal_amount: 4500000,
    collected_amount: 0,
    status: 'pending',
    deadline: '2025-10-01',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    profiles: { full_name: 'Pedro Álvarez', email: 'pedro@gmail.com', kyc_document_url: 'kyc/doc.pdf' },
  },
]

export default async function AdminPage() {
  if (IS_DEMO) {
    return (
      <AdminClient
        pending={DEMO_PENDING}
        allCampaigns={MOCK_CAMPAIGNS}
        stats={MOCK_STATS}
      />
    )
  }

  const { redirect } = await import('next/navigation')
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const userId = user!.id
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (profile?.role !== 'admin') redirect('/')

  const [pendingResult, allCampaignsResult, statsResult] = await Promise.all([
    supabase.from('campaigns').select('*, profiles(*)').eq('status', 'pending').order('created_at', { ascending: true }),
    supabase.from('campaigns').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('platform_stats').select('*').single(),
  ])

  return (
    <AdminClient
      pending={pendingResult.data || []}
      allCampaigns={allCampaignsResult.data || []}
      stats={statsResult.data}
    />
  )
}
