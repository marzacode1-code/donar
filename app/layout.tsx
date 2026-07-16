import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { IS_DEMO } from '@/lib/utils/mockData'

export const metadata: Metadata = {
  title: {
    default: 'DonaTech — Donaciones con Trazabilidad Real',
    template: '%s | DonaTech',
  },
  description: 'Plataforma de crowdfunding social para Colombia. Donaciones con trazabilidad total.',
  keywords: ['donaciones', 'crowdfunding', 'Colombia', 'causas sociales', 'transparencia'],
  openGraph: {
    siteName: 'DonaTech',
    locale: 'es_CO',
    type: 'website',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let profile = null

  if (!IS_DEMO) {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        profile = data
      }
    } catch {
      // Supabase not configured — demo mode
    }
  }

  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAFAFA]">
        <Header profile={profile} />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
