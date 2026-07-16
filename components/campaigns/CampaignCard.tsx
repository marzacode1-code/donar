'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MapPin, Clock } from 'lucide-react'
import ProgressBar from './ProgressBar'
import CategoryBadge from '@/components/ui/CategoryBadge'
import StatusBadge from '@/components/ui/StatusBadge'
import { daysLeft } from '@/lib/utils/format'
import type { Campaign } from '@/lib/supabase/types'

interface CampaignCardProps {
  campaign: Campaign
  index?: number
}

export default function CampaignCard({ campaign, index = 0 }: CampaignCardProps) {
  const days = daysLeft(campaign.deadline)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
      className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100 transition-shadow"
    >
      <Link href={`/campaigns/${campaign.slug}`} className="block">
        {/* Image */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {campaign.cover_image_url ? (
            <Image
              src={campaign.cover_image_url}
              alt={campaign.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
              <span className="text-4xl">🤝</span>
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            <CategoryBadge category={campaign.category} />
          </div>
          <div className="absolute top-3 right-3">
            <StatusBadge status={campaign.status} />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-secondary text-base leading-tight mb-1 line-clamp-2">
            {campaign.title}
          </h3>

          <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>{campaign.city}, {campaign.department}</span>
          </div>

          <ProgressBar collected={campaign.collected_amount} goal={campaign.goal_amount} size="sm" />

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {days > 0 ? `${days} días restantes` : 'Plazo vencido'}
            </span>
            <span className="text-xs font-semibold text-primary bg-primary-50 px-2 py-0.5 rounded-full">
              Aportar →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
