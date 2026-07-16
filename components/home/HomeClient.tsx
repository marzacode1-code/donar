'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Shield, TrendingUp, CheckCircle, ArrowRight, Search } from 'lucide-react'
import CampaignGrid from '@/components/campaigns/CampaignGrid'
import { AnimatedCounter } from '@/components/realtime/RealtimeCounter'
import { formatCOP } from '@/lib/utils/format'
import type { Campaign, PlatformStats } from '@/lib/supabase/types'

const TYPEWRITER_TEXTS = [
  'Donaciones con Trazabilidad Real.',
  'Ejecutamos el cambio contigo.',
  'Colombia donando con impacto.',
]

const DEPARTMENTS = ['Todos', 'Valle del Cauca', 'Antioquia', 'Atlántico', 'Cundinamarca', 'Nariño']
const CATEGORIES: { value: string; label: string; emoji: string }[] = [
  { value: 'todos', label: 'Todos', emoji: '✨' },
  { value: 'bienestar_animal', label: 'Bienestar Animal', emoji: '🐾' },
  { value: 'ayuda_social', label: 'Ayuda Social', emoji: '🤝' },
  { value: 'salud', label: 'Salud', emoji: '❤️‍🩹' },
  { value: 'deporte', label: 'Deporte', emoji: '🏆' },
]

interface HomeClientProps {
  campaigns: Campaign[]
  stats: PlatformStats
}

function TypewriterHero() {
  const [textIndex, setTextIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const target = TYPEWRITER_TEXTS[textIndex]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayed.length < target.length) {
          setDisplayed(target.slice(0, displayed.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        if (displayed.length > 0) {
          setDisplayed(displayed.slice(0, -1))
        } else {
          setIsDeleting(false)
          setTextIndex((i) => (i + 1) % TYPEWRITER_TEXTS.length)
        }
      }
    }, isDeleting ? 40 : 80)
    return () => clearTimeout(timeout)
  }, [displayed, isDeleting, textIndex])

  return (
    <span>
      {displayed}
      <span className="inline-block w-0.5 h-8 bg-accent ml-1 animate-pulse" />
    </span>
  )
}

export default function HomeClient({ campaigns, stats }: HomeClientProps) {
  const [selectedDept, setSelectedDept] = useState('Todos')
  const [selectedCat, setSelectedCat] = useState('todos')

  const filtered = campaigns.filter((c) => {
    const deptMatch = selectedDept === 'Todos' || c.department === selectedDept
    const catMatch = selectedCat === 'todos' || c.category === selectedCat
    return deptMatch && catMatch
  })

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-secondary via-secondary to-[#1A1B2E] text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full filter blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-accent rounded-full filter blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-100 border border-primary/30 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Heart className="w-4 h-4 fill-current" />
              Crowdfunding social para Colombia
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4 min-h-[4rem] md:min-h-[6rem] text-white">
              <TypewriterHero />
            </h1>

            <p className="text-lg text-gray-300 mb-8 max-w-xl">
              Nosotros <strong className="text-accent">no entregamos el dinero</strong>, ejecutamos el cambio.
              Trazabilidad total, desde la donación hasta el impacto real.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/campaigns"
                className="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                <Search className="w-5 h-5" /> Ver Campañas
              </Link>
              <Link
                href="/create-campaign"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Crear una causa <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 max-w-3xl"
          >
            {[
              { label: 'Total donado', value: stats.total_collected, format: formatCOP },
              { label: 'Campañas activas', value: stats.active_campaigns },
              { label: 'Donaciones', value: stats.total_donations },
              { label: 'Donantes', value: stats.total_users },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-2xl font-black tabular-nums text-white">
                  <AnimatedCounter
                    value={stat.value}
                    format={stat.format}
                  />
                </div>
                <div className="text-xs text-white/60 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-black text-secondary mb-3">¿Cómo funciona?</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Simple, transparente y con impacto real.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                color: 'bg-primary-50 text-primary',
                step: '01',
                title: 'Elige una causa',
                desc: 'Explora campañas verificadas en tu departamento o categoría. Cada proyecto pasa por una revisión rigurosa.',
              },
              {
                icon: Shield,
                color: 'bg-blue-50 text-blue-600',
                step: '02',
                title: 'Dona con seguridad',
                desc: 'Paga con PSE, tarjeta o Nequi vía Wompi. Tu dinero va directo a la ejecución del proyecto, nunca al creador.',
              },
              {
                icon: TrendingUp,
                color: 'bg-success/10 text-success',
                step: '03',
                title: 'Sigue el impacto',
                desc: 'Recibe actualizaciones en tiempo real con fotos, facturas y evidencias de cómo se usó tu donación.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center p-6"
              >
                <div className={`inline-flex w-16 h-16 rounded-2xl ${item.color} items-center justify-center mb-4`}>
                  <item.icon className="w-8 h-8" />
                </div>
                <div className="text-xs font-bold text-gray-400 mb-2">PASO {item.step}</div>
                <h3 className="text-xl font-bold text-secondary mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Campaigns */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-black text-secondary">Campañas Activas</h2>
              <p className="text-gray-500 mt-1">Apoya causas que necesitan tu ayuda hoy</p>
            </div>
            <Link href="/campaigns" className="flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
              Ver todas <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCat(cat.value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCat === cat.value
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <span>{cat.emoji}</span> {cat.label}
                </motion.button>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {DEPARTMENTS.map((dept) => (
                <motion.button
                  key={dept}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedDept === dept
                      ? 'bg-secondary text-white'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-secondary/50'
                  }`}
                >
                  {dept}
                </motion.button>
              ))}
            </div>
          </div>

          <CampaignGrid campaigns={filtered} />
        </div>
      </section>

      {/* Trust section */}
      <section className="py-16 bg-gradient-to-r from-primary-50 to-accent-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
            <h2 className="text-3xl font-black text-secondary mb-4">
              Tu dinero genera impacto real
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Cada peso donado está respaldado por evidencias fotográficas, facturas reales y
              actualizaciones verificadas. Transparencia total de principio a fin.
            </p>
            <Link
              href="/create-campaign"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-600 transition-colors"
            >
              Crear una causa social <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
