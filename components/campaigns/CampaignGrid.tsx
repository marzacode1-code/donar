import CampaignCard from './CampaignCard'
import type { Campaign } from '@/lib/supabase/types'

interface CampaignGridProps {
  campaigns: Campaign[]
}

function CampaignCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100">
      <div className="skeleton h-48" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-2.5 w-full" />
        <div className="skeleton h-2 w-1/3" />
      </div>
    </div>
  )
}

export function CampaignGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CampaignCardSkeleton key={i} />
      ))}
    </div>
  )
}

export default function CampaignGrid({ campaigns }: CampaignGridProps) {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl block mb-4">🔍</span>
        <h3 className="text-xl font-bold text-secondary mb-2">No hay campañas aquí</h3>
        <p className="text-gray-500">Intenta con otros filtros o sé el primero en crear una causa.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign, i) => (
        <CampaignCard key={campaign.id} campaign={campaign} index={i} />
      ))}
    </div>
  )
}
