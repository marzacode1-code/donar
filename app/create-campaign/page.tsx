import { IS_DEMO } from '@/lib/utils/mockData'
import CreateCampaignWizard from '@/components/forms/CreateCampaignWizard'

export const metadata = {
  title: 'Crear Campaña',
  description: 'Crea una campaña social verificada en DonaTech.',
}

export default async function CreateCampaignPage() {
  let profile = null

  if (!IS_DEMO) {
    const { redirect } = await import('next/navigation')
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/campaigns')
    const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
    profile = data
  }

  return <CreateCampaignWizard profile={profile} />
}
