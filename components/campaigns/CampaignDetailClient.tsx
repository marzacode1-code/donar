'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MapPin, Share2, Users, Clock, CheckCircle } from 'lucide-react'
import ProgressBar from './ProgressBar'
import CategoryBadge from '@/components/ui/CategoryBadge'
import StatusBadge from '@/components/ui/StatusBadge'
import RealtimeCounter from '@/components/realtime/RealtimeCounter'
import DonationToast from '@/components/realtime/DonationToast'
import DonationWidget from '@/components/donation/DonationWidget'
import DonationList from '@/components/donation/DonationList'
import CommentSection from '@/components/comments/CommentSection'
import TraceabilityTimeline from '@/components/traceability/TraceabilityTimeline'
import { daysLeft, formatCOP } from '@/lib/utils/format'
import type { Campaign, Profile, Donation, TraceabilityUpdate } from '@/lib/supabase/types'

type Tab = 'historia' | 'trazabilidad' | 'donantes'

interface CampaignDetailClientProps {
  campaign: Campaign
  creator: Profile | null
  donations: Donation[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  comments: any[]
  traceabilityUpdates: TraceabilityUpdate[]
  currentUser: Profile | null
}

export default function CampaignDetailClient({
  campaign,
  creator,
  donations,
  comments,
  traceabilityUpdates,
  currentUser,
}: CampaignDetailClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('historia')
  const days = daysLeft(campaign.deadline)

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: `Apoya esta causa: ${campaign.title}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DonationToast campaignId={campaign.id} />

      {/* Hero */}
      <div className="relative h-64 md:h-96 bg-gray-200 overflow-hidden">
        {campaign.cover_image_url ? (
          <Image
            src={campaign.cover_image_url}
            alt={campaign.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
            <span className="text-6xl">🤝</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-4 right-4 sm:left-8">
          <div className="flex gap-2 mb-3 flex-wrap">
            <CategoryBadge category={campaign.category} />
            <StatusBadge status={campaign.status} />
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white leading-tight max-w-3xl">
            {campaign.title}
          </h1>
          <div className="flex items-center gap-1 text-gray-300 text-sm mt-2">
            <MapPin className="w-4 h-4" /> {campaign.city}, {campaign.department}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donation widget — appears first on mobile, sidebar on desktop */}
          <div className="lg:col-span-1 lg:row-start-1 order-first lg:order-last">
            <div className="lg:sticky lg:top-20">
              <DonationWidget campaign={campaign} currentUser={currentUser} />
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 lg:row-start-1 order-last lg:order-first space-y-6">
            {/* Meta */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-card"
            >
              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <RealtimeCounter
                    initial={campaign.collected_amount}
                    campaignId={campaign.id}
                    className="text-3xl font-black text-secondary tabular-nums"
                  />
                  <span className="text-gray-400 text-sm">de {formatCOP(campaign.goal_amount)}</span>
                </div>
                <ProgressBar
                  collected={campaign.collected_amount}
                  goal={campaign.goal_amount}
                  showLabel={false}
                  size="lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100">
                <div className="text-center">
                  <div className="font-bold text-secondary text-xl tabular-nums">{donations.length}</div>
                  <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-0.5">
                    <Users className="w-3 h-3" /> Donantes
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-secondary text-xl tabular-nums">{days}</div>
                  <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> Días restantes
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-secondary text-xl">
                    {Math.round((campaign.collected_amount / campaign.goal_amount) * 100)}%
                  </div>
                  <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-0.5">
                    <CheckCircle className="w-3 h-3" /> Logrado
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-3">
                  {creator?.avatar_url && (
                    <Image src={creator.avatar_url} alt="" width={36} height={36} className="rounded-full" />
                  )}
                  <div>
                    <div className="text-xs text-gray-400">Creado por</div>
                    <div className="font-semibold text-secondary text-sm">{creator?.full_name || 'Creador'}</div>
                  </div>
                </div>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm border border-gray-200 px-3 py-1.5 rounded-lg"
                >
                  <Share2 className="w-4 h-4" /> Compartir
                </button>
              </div>
            </motion.div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
                {(['historia', 'trazabilidad', 'donantes'] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-shrink-0 flex-1 min-w-[90px] py-4 px-3 text-sm font-semibold transition-colors relative whitespace-nowrap ${
                      activeTab === tab ? 'text-primary' : 'text-gray-500 hover:text-secondary'
                    }`}
                  >
                    {tab === 'historia' ? 'Historia' : tab === 'trazabilidad' ? 'Trazabilidad' : 'Donantes'}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'historia' && (
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                    {campaign.description}
                  </div>
                )}
                {activeTab === 'trazabilidad' && (
                  <TraceabilityTimeline updates={traceabilityUpdates} />
                )}
                {activeTab === 'donantes' && (
                  <DonationList donations={donations} />
                )}
              </div>
            </div>

            {/* Image gallery */}
            {campaign.images && campaign.images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-card overflow-hidden p-4"
              >
                <h3 className="font-bold text-secondary text-sm mb-3 px-2">Galería de imágenes</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {campaign.images.slice(0, 6).map((url, i) => (
                    <div key={i} className="relative h-32 rounded-xl overflow-hidden bg-gray-100">
                      <Image
                        src={url}
                        alt={`Imagen ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Comments */}
            <CommentSection
              campaignId={campaign.id}
              comments={comments}
              currentUser={currentUser}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
