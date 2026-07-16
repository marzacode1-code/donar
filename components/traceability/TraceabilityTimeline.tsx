'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, FileText } from 'lucide-react'
import { timeAgo } from '@/lib/utils/format'
import type { TraceabilityUpdate } from '@/lib/supabase/types'

const STAGE_CONFIG = {
  initial: { label: 'Inicio', color: 'bg-blue-500', textColor: 'text-blue-600', bg: 'bg-blue-50' },
  execution: { label: 'Ejecución', color: 'bg-accent', textColor: 'text-accent-600', bg: 'bg-accent-50' },
  final: { label: 'Final', color: 'bg-success', textColor: 'text-success', bg: 'bg-success/10' },
}

interface TraceabilityTimelineProps {
  updates: TraceabilityUpdate[]
}

export default function TraceabilityTimeline({ updates }: TraceabilityTimelineProps) {
  if (updates.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-10 h-10 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400">Las actualizaciones de trazabilidad aparecerán aquí.</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100" />

      <div className="space-y-6">
        {updates.map((update, i) => {
          const stage = STAGE_CONFIG[update.stage]
          return (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-14"
            >
              {/* Dot */}
              <div className={`absolute left-3 top-1 w-5 h-5 rounded-full ${stage.color} flex items-center justify-center ring-4 ring-white`}>
                <CheckCircle className="w-3 h-3 text-white" />
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stage.bg} ${stage.textColor}`}>
                    {stage.label}
                  </span>
                  <span className="text-xs text-gray-400">{timeAgo(update.created_at)}</span>
                </div>

                <h4 className="font-bold text-secondary mb-1">{update.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">{update.description}</p>

                {/* Images */}
                {update.images && update.images.length > 0 && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {update.images.map((img, j) => (
                      <div key={j} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                        <Image src={img} alt="" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Receipts */}
                {update.receipt_urls && update.receipt_urls.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {update.receipt_urls.map((url, j) => (
                      <a
                        key={j}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Factura {j + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
