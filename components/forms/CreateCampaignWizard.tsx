'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, ChevronRight, ChevronLeft, Upload, Plus, Trash2, PawPrint, Users, HeartPulse, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils/format'
import type { Profile } from '@/lib/supabase/types'

const DEPARTMENTS = ['Amazonas','Antioquia','Arauca','Atlántico','Bolívar','Boyacá','Caldas','Caquetá','Casanare','Cauca','Cesar','Chocó','Córdoba','Cundinamarca','Guainía','Guaviare','Huila','La Guajira','Magdalena','Meta','Nariño','Norte de Santander','Putumayo','Quindío','Risaralda','San Andrés','Santander','Sucre','Tolima','Valle del Cauca','Vaupés','Vichada']

const campaignSchema = z.object({
  title: z.string().min(10, 'Mínimo 10 caracteres').max(100),
  category: z.enum(['bienestar_animal', 'ayuda_social', 'salud', 'deporte']),
  department: z.string().min(1, 'Selecciona un departamento'),
  city: z.string().min(2, 'Ingresa tu ciudad'),
  description: z.string().min(100, 'Mínimo 100 caracteres'),
  goal_amount: z.number().min(100000, 'Meta mínima $100.000 COP'),
  deadline: z.string().min(1, 'Selecciona fecha límite'),
})

type CampaignFormData = z.infer<typeof campaignSchema>

interface BudgetItem {
  item: string
  quantity: number
  unit_price: number
}

interface CreateCampaignWizardProps {
  profile: Profile | null
}

const STEP_LABELS = ['Identidad', 'Detalles', 'Presupuesto', 'Evidencias', 'Revisión']

const CATEGORY_OPTIONS = [
  { value: 'bienestar_animal', label: 'Bienestar Animal', icon: PawPrint, color: 'border-orange-300 bg-orange-50 text-orange-700' },
  { value: 'ayuda_social', label: 'Ayuda Social', icon: Users, color: 'border-blue-300 bg-blue-50 text-blue-700' },
  { value: 'salud', label: 'Salud', icon: HeartPulse, color: 'border-red-300 bg-red-50 text-red-700' },
  { value: 'deporte', label: 'Deporte', icon: Trophy, color: 'border-green-300 bg-green-50 text-green-700' },
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function CreateCampaignWizard({ profile: _p }: CreateCampaignWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [kycAccepted, setKycAccepted] = useState(false)
  const [kycFile, setKycFile] = useState<File | null>(null)
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([{ item: '', quantity: 1, unit_price: 0 }])
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: { goal_amount: 0 },
  })

  const title = watch('title', '')
  const category = watch('category')
  const goalAmount = watch('goal_amount', 0)
  const budgetTotal = budgetItems.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages(prev => [...prev, ...files].slice(0, 6))
    files.forEach(f => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImagePreviews(prev => [...prev, ev.target?.result as string].slice(0, 6))
      }
      reader.readAsDataURL(f)
    })
  }

  const addBudgetItem = () => setBudgetItems(prev => [...prev, { item: '', quantity: 1, unit_price: 0 }])
  const removeBudgetItem = (i: number) => setBudgetItems(prev => prev.filter((_, idx) => idx !== i))
  const updateBudgetItem = (i: number, field: keyof BudgetItem, value: string | number) => {
    setBudgetItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  const onSubmit = async (data: CampaignFormData) => {
    setSubmitting(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // Update creator role
      await supabase.from('profiles').update({ role: 'creator' }).eq('id', user.id)

      // Upload KYC document
      if (kycFile) {
        const ext = kycFile.name.split('.').pop()
        const { data: kycData } = await supabase.storage
          .from('campaign-documents')
          .upload(`kyc/${user.id}_${Date.now()}.${ext}`, kycFile)
        if (kycData) {
          await supabase.from('profiles').update({ kyc_document_url: kycData.path }).eq('id', user.id)
        }
      }

      // Upload campaign images
      const imageUrls: string[] = []
      for (const img of images) {
        const ext = img.name.split('.').pop()
        const path = `campaigns/${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const { data: imgData } = await supabase.storage.from('campaign-images').upload(path, img)
        if (imgData) {
          const { data: { publicUrl } } = supabase.storage.from('campaign-images').getPublicUrl(path)
          imageUrls.push(publicUrl)
        }
      }

      // Create campaign
      const slug = slugify(data.title) + '-' + Date.now().toString(36)
      const { error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          creator_id: user.id,
          title: data.title,
          slug,
          description: data.description,
          category: data.category,
          department: data.department,
          city: data.city,
          goal_amount: data.goal_amount,
          deadline: data.deadline,
          cover_image_url: imageUrls[0] || null,
          images: imageUrls,
          budget_breakdown: budgetItems as unknown as import('@/lib/supabase/types').Json,
          status: 'pending',
        })
      if (campaignError) throw campaignError

      router.push('/dashboard?created=true')
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al crear la campaña')
      setSubmitting(false)
    }
  }

  const canProceedStep0 = kycAccepted
  const canProceedStep1 = title.length >= 10 && category && watch('department') && watch('city') && watch('description')?.length >= 100
  const canProceedStep2 = goalAmount >= 100000
  const canProceedStep3 = images.length >= 2

  const canProceed = [canProceedStep0, canProceedStep1, canProceedStep2, canProceedStep3, true][step]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Progress */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-secondary mb-6">Crear una campaña</h1>
        <div className="flex items-center gap-0">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < step ? 'bg-success text-white' : i === step ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${i === step ? 'text-primary font-semibold' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all ${i < step ? 'bg-success' : 'bg-gray-100'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          {/* Step 0: KYC */}
          {step === 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h2 className="text-xl font-bold text-secondary mb-2">Verifica tu identidad</h2>
              <p className="text-gray-500 text-sm mb-6">Para garantizar la confianza en la plataforma, necesitamos verificar tu identidad.</p>

              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center mb-4 hover:border-primary/50 transition-colors">
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-2">Sube una foto de tu cédula (frente y reverso)</p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setKycFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="kyc-upload"
                />
                <label htmlFor="kyc-upload" className="cursor-pointer text-primary text-sm font-semibold hover:underline">
                  {kycFile ? `✓ ${kycFile.name}` : 'Seleccionar archivo'}
                </label>
              </div>

              <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  checked={kycAccepted}
                  onChange={(e) => setKycAccepted(e.target.checked)}
                  className="accent-primary mt-0.5 w-4 h-4"
                />
                <span className="text-sm text-gray-700">
                  Confirmo que todos los datos e información que proporcionaré son reales y verídicos.
                  Entiendo que proporcionar información falsa puede resultar en la cancelación de mi campaña.
                </span>
              </label>
            </div>
          )}

          {/* Step 1: Campaign details */}
          {step === 1 && (
            <div className="bg-white rounded-2xl p-6 shadow-card space-y-5">
              <h2 className="text-xl font-bold text-secondary">Detalles de la causa</h2>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Título de la campaña *</label>
                <input
                  {...register('title')}
                  placeholder="Ej: Alimentar 50 perros callejeros en Cali"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                {title && <p className="text-xs text-gray-400 mt-1">Slug: {slugify(title) || '...'}</p>}
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Categoría *</label>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue('category', opt.value as 'bienestar_animal' | 'ayuda_social' | 'salud' | 'deporte')}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        category === opt.value ? opt.color : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <opt.icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{opt.label}</span>
                    </button>
                  ))}
                </div>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Departamento *</label>
                  <select
                    {...register('department')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Selecciona...</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Ciudad *</label>
                  <input
                    {...register('city')}
                    placeholder="Ej: Cali"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Descripción completa *</label>
                <textarea
                  {...register('description')}
                  rows={6}
                  placeholder="Describe el problema que quieres resolver, el impacto esperado, y por qué esta causa es importante..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{watch('description')?.length || 0}/100 mínimo</p>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Fecha límite *</label>
                <input
                  type="date"
                  {...register('deadline')}
                  min={new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline.message}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Budget */}
          {step === 2 && (
            <div className="bg-white rounded-2xl p-6 shadow-card space-y-5">
              <h2 className="text-xl font-bold text-secondary">Presupuesto</h2>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Meta de recaudación (COP) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-gray-500">$</span>
                  <input
                    type="number"
                    {...register('goal_amount', { valueAsNumber: true })}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 tabular-nums"
                  />
                </div>
                {errors.goal_amount && <p className="text-red-500 text-xs mt-1">{errors.goal_amount.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700">Desglose de insumos</label>
                  <button type="button" onClick={addBudgetItem} className="flex items-center gap-1 text-primary text-sm font-semibold">
                    <Plus className="w-4 h-4" /> Agregar ítem
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 px-2">
                    <span className="col-span-5">Ítem</span>
                    <span className="col-span-2">Cant.</span>
                    <span className="col-span-3">Precio unit.</span>
                    <span className="col-span-2 text-right">Total</span>
                  </div>

                  {budgetItems.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        value={item.item}
                        onChange={(e) => updateBudgetItem(i, 'item', e.target.value)}
                        placeholder="Nombre"
                        className="col-span-5 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateBudgetItem(i, 'quantity', Number(e.target.value))}
                        min={1}
                        className="col-span-2 px-2 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateBudgetItem(i, 'unit_price', Number(e.target.value))}
                        placeholder="0"
                        className="col-span-3 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                      <div className="col-span-2 flex items-center justify-end gap-1">
                        <span className="text-xs font-medium text-secondary tabular-nums">
                          ${(item.quantity * item.unit_price).toLocaleString('es-CO')}
                        </span>
                        {budgetItems.length > 1 && (
                          <button type="button" onClick={() => removeBudgetItem(i)} className="text-gray-300 hover:text-red-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 font-bold text-secondary">
                    <span>Total calculado</span>
                    <span className="tabular-nums">${budgetTotal.toLocaleString('es-CO')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Evidence images */}
          {step === 3 && (
            <div className="bg-white rounded-2xl p-6 shadow-card space-y-5">
              <h2 className="text-xl font-bold text-secondary">Evidencias iniciales</h2>
              <p className="text-gray-500 text-sm">Sube al menos 2 fotos que evidencien la problemática que quieres resolver.</p>

              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-2">Arrastra o selecciona imágenes (máx. 6)</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="evidence-upload"
                />
                <label htmlFor="evidence-upload" className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors inline-block">
                  Seleccionar imágenes
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImages(prev => prev.filter((_, idx) => idx !== i))
                          setImagePreviews(prev => prev.filter((_, idx) => idx !== i))
                        }}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <Trash2 className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {images.length < 2 && (
                <p className="text-amber-600 text-sm text-center bg-amber-50 px-4 py-2 rounded-lg">
                  Necesitas al menos 2 imágenes para continuar.
                </p>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="bg-white rounded-2xl p-6 shadow-card space-y-4">
              <h2 className="text-xl font-bold text-secondary">Revisión final</h2>

              <div className="space-y-3">
                {[
                  { label: 'Identidad KYC', ok: kycAccepted },
                  { label: 'Título de campaña', ok: title.length >= 10 },
                  { label: 'Categoría y ubicación', ok: !!category && !!watch('department') },
                  { label: 'Descripción completa', ok: watch('description')?.length >= 100 },
                  { label: 'Meta de recaudación', ok: goalAmount >= 100000 },
                  { label: 'Evidencias fotográficas', ok: images.length >= 2 },
                ].map((check) => (
                  <div key={check.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <CheckCircle className={`w-5 h-5 flex-shrink-0 ${check.ok ? 'text-success' : 'text-gray-300'}`} />
                    <span className={`text-sm font-medium ${check.ok ? 'text-secondary' : 'text-gray-400'}`}>{check.label}</span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                Tu campaña será revisada por nuestro equipo antes de ser publicada (24-48 horas hábiles).
                Recibirás un email con el resultado.
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-0 transition-all"
        >
          <ChevronLeft className="w-5 h-5" /> Anterior
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={() => canProceed && setStep(s => s + 1)}
            disabled={!canProceed}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-600 disabled:bg-gray-200 text-white rounded-xl font-bold transition-all"
          >
            Siguiente <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-600 text-white rounded-xl font-bold transition-all"
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            Enviar para Revisión
          </button>
        )}
      </div>
    </div>
  )
}
