import Link from 'next/link'
import { Heart, Share2, Globe } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-secondary text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="font-bold text-xl">
                Dona<span className="text-primary">Tech</span>
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
              Donaciones con trazabilidad real. Nosotros no entregamos el dinero, ejecutamos el cambio.
              Plataforma de crowdfunding social para Colombia.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-200">Plataforma</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/campaigns" className="hover:text-white transition-colors">Explorar campañas</Link></li>
              <li><Link href="/create-campaign" className="hover:text-white transition-colors">Crear campaña</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Mi dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-200">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/terminos" className="hover:text-white transition-colors">Términos de uso</Link></li>
              <li><Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link></li>
              <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} DonaTech. Todos los derechos reservados.</span>
          <span>Pagos seguros con Wompi/PSE 🇨🇴</span>
        </div>
      </div>
    </footer>
  )
}
