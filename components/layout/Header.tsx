'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Menu, X, Plus, LayoutDashboard, Shield, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'

interface HeaderProps {
  profile?: Profile | null
}

export default function Header({ profile }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const resetModal = () => {
    setEmail('')
    setPassword('')
    setName('')
    setError('')
    setShowPass(false)
    setLoading(false)
  }

  const openModal = (mode: 'login' | 'signup') => {
    resetModal()
    setAuthMode(mode)
    setShowAuthModal(true)
    setMenuOpen(false)
  }

  const closeModal = () => {
    setShowAuthModal(false)
    resetModal()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) {
      setError('Correo o contraseña incorrectos.')
      return
    }
    window.location.href = '/dashboard'
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: name }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error || 'Error al crear la cuenta.')
      return
    }
    // Auto login after signup
    await supabase.auth.signInWithPassword({ email, password })
    window.location.href = '/dashboard'
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="font-bold text-xl text-secondary">
                Dona<span className="text-primary">Tech</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/campaigns" className="text-gray-600 hover:text-primary font-medium transition-colors">
                Explorar
              </Link>
              {profile?.role === 'admin' && (
                <Link href="/admin" className="text-gray-600 hover:text-primary font-medium transition-colors flex items-center gap-1">
                  <Shield className="w-4 h-4" /> Admin
                </Link>
              )}
              {profile && (
                <Link href="/dashboard" className="text-gray-600 hover:text-primary font-medium transition-colors flex items-center gap-1">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
              )}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/create-campaign"
                className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" /> Crear Campaña
              </Link>
              {profile ? (
                <div className="flex items-center gap-2">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.full_name || ''}
                      width={36}
                      height={36}
                      className="rounded-full border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {profile.full_name?.[0] || 'U'}
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal('login')}
                    className="text-secondary border border-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                  >
                    Iniciar sesión
                  </button>
                  <button
                    onClick={() => openModal('signup')}
                    className="bg-secondary text-white px-4 py-2 rounded-lg font-medium hover:bg-secondary/90 transition-colors text-sm"
                  >
                    Registrarse
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menú"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-4 flex flex-col gap-4">
                <Link href="/campaigns" className="text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>
                  Explorar campañas
                </Link>
                {profile && (
                  <Link href="/dashboard" className="text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>
                    Mi dashboard
                  </Link>
                )}
                {profile?.role === 'admin' && (
                  <Link href="/admin" className="text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>
                    Administración
                  </Link>
                )}
                <Link
                  href="/create-campaign"
                  className="bg-primary text-white px-4 py-2 rounded-lg font-semibold text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Crear Campaña
                </Link>
                {profile ? (
                  <button onClick={handleLogout} className="text-gray-500 text-sm text-left">
                    Cerrar sesión
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => openModal('login')}
                      className="border border-gray-200 px-4 py-2 rounded-lg font-medium text-center"
                    >
                      Iniciar sesión
                    </button>
                    <button
                      onClick={() => openModal('signup')}
                      className="bg-secondary text-white px-4 py-2 rounded-lg font-medium text-center"
                    >
                      Registrarse
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-br from-primary to-primary-600 p-6 text-white relative">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white fill-white" />
                  </div>
                  <span className="font-bold text-xl">DonaTech</span>
                </div>
                <h2 className="text-2xl font-bold mt-3">
                  {authMode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {authMode === 'login'
                    ? 'Ingresa para gestionar tus campañas y donaciones.'
                    : 'Únete a la plataforma de donaciones más transparente de Colombia.'}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => { resetModal(); setAuthMode('login') }}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${authMode === 'login' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => { resetModal(); setAuthMode('signup') }}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${authMode === 'signup' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Registrarse
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={authMode === 'login' ? handleLogin : handleSignup}
                className="p-6 flex flex-col gap-4"
              >
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        placeholder="Tu nombre completo"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="tu@correo.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder={authMode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'}
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-2.5 rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : authMode === 'login' ? 'Entrar' : 'Crear cuenta'}
                </button>

                {authMode === 'login' && (
                  <p className="text-center text-xs text-gray-500 mt-1">
                    Cuentas demo: <span className="font-mono text-gray-700">ana@donatech.co</span> /{' '}
                    <span className="font-mono text-gray-700">donatech123</span>
                  </p>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
