'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Campaign } from '@/lib/supabase/types'

interface Props {
  campaign: Campaign
  onClose: () => void
}

export default function TraceabilityUploadModal({ campaign, onClose }: Props) {
  const [stage, setStage] = useState<'initial' | 'execution' | 'final'>('execution')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [receipts, setReceipts] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages(prev => [...prev, ...files].slice(0, 5))
    files.forEach(f => {
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreviews(prev => [...prev, ev.target?.result as string].slice(0, 5))
      reader.readAsDataURL(f)
    })
  }

  const handleSubmit = async () => {
    if (!title || !description) return
    setSubmitting(true)

    const supabase = createClient()

    // Upload images
    const imageUrls: string[] = []
    for (const img of images) {
      const path = `traceability/${campaign.id}/${Date.now()}_${Math.random().toString(36).slice(2)}`
      const { data } = await supabase.storage.from('campaign-images').upload(path, img)
      if (data) {
        const { data: { publicUrl } } = supabase.storage.from('campaign-images').getPublicUrl(path)
        imageUrls.push(publicUrl)
      }
    }

    // Upload receipts
    const receiptUrls: string[] = []
    for (const rec of receipts) {
      const path = `receipts/${campaign.id}/${Date.now()}_${rec.name}`
      const { data } = await supabase.storage.from('campaign-documents').upload(path, rec)
      if (data) receiptUrls.push(data.path)
    }

    await supabase.from('traceability_updates').insert({
      campaign_id: campaign.id,
      stage,
      title,
      description,
      images: imageUrls,
      receipt_urls: receiptUrls,
    })

    setSuccess(true)
    setSubmitting(false)
    setTimeout(onClose, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="font-bold text-secondary">Subir actualización de trazabilidad</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <span className="text-4xl block mb-3">✅</span>
            <p className="font-bold text-secondary">¡Actualización publicada!</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Etapa</label>
              <div className="flex gap-2">
                {(['initial', 'execution', 'final'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStage(s)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      stage === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {s === 'initial' ? 'Inicio' : s === 'execution' ? 'Ejecución' : 'Final'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Título del hito *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej: Compra de insumos completada"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Descripción *</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe qué se logró en esta etapa..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Fotos de evidencia</label>
              <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" id="trace-images" />
              <label htmlFor="trace-images" className="flex items-center gap-2 cursor-pointer border border-dashed border-gray-200 rounded-xl p-3 hover:border-primary/50 transition-colors text-sm text-gray-500">
                <Upload className="w-4 h-4" /> Agregar fotos
              </label>
              {imagePreviews.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Facturas/Recibos</label>
              <input
                type="file"
                accept=".pdf,image/*"
                multiple
                onChange={e => setReceipts(Array.from(e.target.files || []))}
                className="hidden"
                id="trace-receipts"
              />
              <label htmlFor="trace-receipts" className="flex items-center gap-2 cursor-pointer border border-dashed border-gray-200 rounded-xl p-3 hover:border-primary/50 transition-colors text-sm text-gray-500">
                <Upload className="w-4 h-4" /> Agregar facturas ({receipts.length} archivo(s))
              </label>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !title || !description}
              className="w-full bg-primary hover:bg-primary-600 disabled:bg-gray-200 text-white py-3 rounded-xl font-bold transition-colors"
            >
              {submitting ? (
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Publicar actualización'
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
