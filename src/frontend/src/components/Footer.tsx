import { useGetContactInfo } from '../hooks/useQueries';
import { SiFacebook, SiInstagram, SiWhatsapp } from 'react-icons/si';
import { Heart } from 'lucide-react';

export function Footer() {
  const { data: contactInfo } = useGetContactInfo();

  return (
    <footer className="bg-gradient-to-br from-sky-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm flex items-center justify-center p-2 shadow-lg">
                <img
                  src="/assets/generated/ikizahra-logo-transparent.dim_200x200.png"
                  alt="Iki Zahra Laundry"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-sky-100 bg-clip-text text-transparent">
                Iki Zahra Laundry
              </span>
            </div>
            <p className="text-sky-100/90 text-sm leading-relaxed">
              Layanan laundry profesional yang menyediakan cuci, setrika, dan jasa operator. Tersedia layanan self-service dan operator-service dengan harga terjangkau.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-xl mb-6 bg-gradient-to-r from-white to-sky-100 bg-clip-text text-transparent">
              Kontak
            </h3>
            <div className="space-y-3 text-sm text-sky-100/90">
              <p className="flex items-center gap-2">
                <span className="text-lg">📞</span>
                <span>62 857-1673-3929</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-lg">📍</span>
                <span>Jl. Cempaka Warna No. 26 RT 09 RW 04<br />Cempaka Putih, Jakarta Pusat</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-lg">🕐</span>
                <span>Senin - Sabtu: 08.00 - 20.00 WIB</span>
              </p>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-semibold text-xl mb-6 bg-gradient-to-r from-white to-sky-100 bg-clip-text text-transparent">
              Ikuti Kami
            </h3>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-700/80 to-sky-600/80 hover:from-sky-600 hover:to-sky-500 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                aria-label="Facebook"
              >
                <SiFacebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-600/80 to-purple-600/80 hover:from-pink-500 hover:to-purple-500 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                aria-label="Instagram"
              >
                <SiInstagram className="h-5 w-5" />
              </a>
              <a
                href={contactInfo?.whatsapp || 'https://wa.me/6285716733929'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600/80 to-emerald-600/80 hover:from-green-500 hover:to-emerald-500 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                aria-label="WhatsApp"
              >
                <SiWhatsapp className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-sky-700/50 pt-8 text-center">
          <p className="flex items-center justify-center gap-2 flex-wrap text-sm text-sky-100/80">
            © 2025 Iki Zahra Laundry. Built with <Heart className="h-4 w-4 text-red-400 fill-red-400 animate-pulse" /> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-300 hover:text-white hover:underline transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
