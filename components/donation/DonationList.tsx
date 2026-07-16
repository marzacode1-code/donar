import { Heart } from 'lucide-react'
import { formatCOP, timeAgo } from '@/lib/utils/format'
import type { Donation } from '@/lib/supabase/types'

interface DonationListProps {
  donations: Donation[]
}

export default function DonationList({ donations }: DonationListProps) {
  if (donations.length === 0) {
    return (
      <div className="text-center py-8">
        <Heart className="w-10 h-10 text-gray-200 mx-auto mb-3 fill-current" />
        <p className="text-gray-400">Sé el primero en donar a esta causa.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {donations.map((donation) => {
        const name = donation.is_anonymous ? 'Donante anónimo' : (donation.donor_name || 'Donante anónimo')
        const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        return (
          <div key={donation.id} className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-50 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
              {donation.is_anonymous ? '?' : initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold text-secondary text-sm">{name}</span>
                <span className="text-primary font-bold text-sm tabular-nums flex-shrink-0">{formatCOP(donation.amount)}</span>
              </div>
              {donation.donor_message && (
                <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">&ldquo;{donation.donor_message}&rdquo;</p>
              )}
              <span className="text-xs text-gray-400">{timeAgo(donation.created_at)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
