'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils/format'
import type { Profile } from '@/lib/supabase/types'

interface Comment {
  id: string
  content: string
  created_at: string
  profiles: {
    full_name: string | null
    avatar_url: string | null
  } | null
}

interface CommentSectionProps {
  campaignId: string
  comments: Comment[]
  currentUser: Profile | null
}

export default function CommentSection({ campaignId, comments: initialComments, currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !currentUser) return
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('comments')
      .insert({ campaign_id: campaignId, user_id: currentUser.id, content: text.trim() })
      .select('*, profiles(*)')
      .single()

    if (!error && data) {
      setComments([data as Comment, ...comments])
      setText('')
    }
    setLoading(false)
  }

  const handleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h3 className="font-bold text-secondary text-lg mb-5 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        Comentarios ({comments.length})
      </h3>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            {currentUser.avatar_url ? (
              <Image src={currentUser.avatar_url} alt="" width={36} height={36} className="rounded-full flex-shrink-0 mt-0.5" />
            ) : (
              <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {currentUser.full_name?.[0] || 'U'}
              </div>
            )}
            <div className="flex-1 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribe un comentario de apoyo..."
                maxLength={1000}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              />
              <button
                type="submit"
                disabled={!text.trim() || loading}
                className="bg-primary hover:bg-primary-600 disabled:bg-gray-200 text-white px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 text-sm font-semibold"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Enviar
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 bg-gray-50 rounded-xl p-4 flex items-center justify-between">
          <p className="text-gray-500 text-sm">Inicia sesión para comentar.</p>
          <button
            onClick={handleLogin}
            className="flex items-center gap-1.5 text-primary font-semibold text-sm hover:underline"
          >
            <LogIn className="w-4 h-4" /> Iniciar sesión
          </button>
        </div>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {comments.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Sé el primero en comentar.</p>
          ) : (
            comments.map((comment) => {
              const profile = comment.profiles
              const name = profile?.full_name || 'Usuario'
              const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              return (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  {profile?.avatar_url ? (
                    <Image src={profile.avatar_url} alt="" width={32} height={32} className="rounded-full flex-shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs flex-shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-secondary text-sm">{name}</span>
                      <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
