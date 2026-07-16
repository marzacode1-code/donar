import { PawPrint, Users, HeartPulse, Trophy } from 'lucide-react'

const CATEGORIES = {
  bienestar_animal: { label: 'Bienestar Animal', icon: PawPrint, color: 'bg-orange-100 text-orange-700' },
  ayuda_social: { label: 'Ayuda Social', icon: Users, color: 'bg-blue-100 text-blue-700' },
  salud: { label: 'Salud', icon: HeartPulse, color: 'bg-red-100 text-red-700' },
  deporte: { label: 'Deporte', icon: Trophy, color: 'bg-green-100 text-green-700' },
} as const

type Category = keyof typeof CATEGORIES

interface CategoryBadgeProps {
  category: Category
  size?: 'sm' | 'md'
}

export default function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const { label, icon: Icon, color } = CATEGORIES[category] || CATEGORIES.ayuda_social
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${color} ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {label}
    </span>
  )
}

export { CATEGORIES }
export type { Category }
