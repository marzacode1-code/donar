'use client'

import { motion } from 'framer-motion'
import { progressPercent, formatCOP } from '@/lib/utils/format'

interface ProgressBarProps {
  collected: number
  goal: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function ProgressBar({ collected, goal, showLabel = true, size = 'md' }: ProgressBarProps) {
  const percent = progressPercent(collected, goal)
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' }

  return (
    <div>
      {showLabel && (
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-lg font-bold text-secondary tabular-nums">{formatCOP(collected)}</span>
          <span className="text-sm text-gray-500">de {formatCOP(goal)} • {percent}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${heights[size]}`}>
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
