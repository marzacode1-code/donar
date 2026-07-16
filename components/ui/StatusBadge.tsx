'use client'

import { motion } from 'framer-motion'

const STATUS_CONFIG = {
  pending: { label: 'En Revisión', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  active: { label: 'Activa', color: 'bg-green-100 text-green-700 border-green-200' },
  executing: { label: 'En Ejecución', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  finished: { label: 'Finalizada', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-700 border-red-200' },
} as const

type Status = keyof typeof STATUS_CONFIG

interface StatusBadgeProps {
  status: Status
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color}`}
    >
      {status === 'active' && (
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse-slow" />
      )}
      {config.label}
    </motion.span>
  )
}
