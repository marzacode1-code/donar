'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import CampaignGrid from './CampaignGrid'
import type { Campaign } from '@/lib/supabase/types'

const DEPARTMENTS = ['Valle del Cauca', 'Antioquia', 'Atlántico', 'Cundinamarca', 'Nariño', 'Bolívar', 'Santander']
const CATEGORIES = [
  { value: 'bienestar_animal', label: 'Bienestar Animal' },
  { value: 'ayuda_social', label: 'Ayuda Social' },
  { value: 'salud', label: 'Salud' },
  { value: 'deporte', label: 'Deporte' },
]
const STATUSES = [
  { value: 'active', label: 'Activa' },
  { value: 'executing', label: 'En Ejecución' },
]

interface Filters {
  search: string
  category: string
  department: string
  status: string
  minGoal: string
  maxGoal: string
}

interface CampaignsClientProps {
  campaigns: Campaign[]
}

export default function CampaignsClient({ campaigns }: CampaignsClientProps) {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    department: '',
    status: '',
    minGoal: '',
    maxGoal: '',
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const setFilter = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = () => setFilters({ search: '', category: '', department: '', status: '', minGoal: '', maxGoal: '' })

  const hasFilters = Object.values(filters).some(Boolean)

  const filtered = campaigns.filter((c) => {
    if (filters.search && !c.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !c.description.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.category && c.category !== filters.category) return false
    if (filters.department && c.department !== filters.department) return false
    if (filters.status && c.status !== filters.status) return false
    if (filters.minGoal && c.goal_amount < Number(filters.minGoal)) return false
    if (filters.maxGoal && c.goal_amount > Number(filters.maxGoal)) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-secondary mb-2">Explorar Campañas</h1>
        <p className="text-gray-500">{filtered.length} causas encontradas</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar campañas..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
          />
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`flex items-center gap-2 px-4 py-3 border rounded-xl font-medium transition-colors ${
            hasFilters ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600 hover:border-primary/50'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="hidden sm:inline">Filtros</span>
          {hasFilters && <span className="w-2 h-2 bg-white rounded-full" />}
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1.5 px-4 py-3 text-gray-500 hover:text-primary transition-colors">
            <X className="w-4 h-4" /> Limpiar
          </button>
        )}
      </div>

      <div className="flex gap-8 relative">
        {/* Sidebar filters — overlay on mobile, inline on desktop */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="fixed left-0 top-0 h-full w-72 bg-white z-40 overflow-y-auto p-5 shadow-xl md:relative md:left-auto md:top-auto md:h-auto md:w-64 md:flex-shrink-0 md:border md:border-gray-100 md:rounded-2xl md:shadow-none md:sticky md:top-20 md:z-auto"
            >
            <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-secondary">Filtros</h3>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Categoría</label>
                <div className="space-y-1.5">
                  {CATEGORIES.map((cat) => (
                    <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={cat.value}
                        checked={filters.category === cat.value}
                        onChange={(e) => setFilter('category', e.target.value)}
                        className="accent-primary"
                      />
                      <span className="text-sm text-gray-700">{cat.label}</span>
                    </label>
                  ))}
                  {filters.category && (
                    <button onClick={() => setFilter('category', '')} className="text-xs text-primary">
                      Quitar filtro
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Departamento</label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilter('department', e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Todos</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Estado</label>
                <div className="space-y-1.5">
                  {STATUSES.map((s) => (
                    <label key={s.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={s.value}
                        checked={filters.status === s.value}
                        onChange={(e) => setFilter('status', e.target.value)}
                        className="accent-primary"
                      />
                      <span className="text-sm text-gray-700">{s.label}</span>
                    </label>
                  ))}
                  {filters.status && (
                    <button onClick={() => setFilter('status', '')} className="text-xs text-primary">Quitar filtro</button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Meta (COP)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minGoal}
                    onChange={(e) => setFilter('minGoal', e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxGoal}
                    onChange={(e) => setFilter('maxGoal', e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>
          </motion.aside>
          </>
        )}

        {/* Grid */}
        <div className="flex-1">
          <CampaignGrid campaigns={filtered} />
        </div>
      </div>
    </div>
  )
}
