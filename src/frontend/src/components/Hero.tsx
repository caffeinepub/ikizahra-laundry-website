import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGetImagesByType, useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { ImageType } from '../backend';
import { Edit2 } from 'lucide-react';
import { HeroBannerEditor } from './HeroBannerEditor';

export function Hero() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: heroImages } = useGetImagesByType(ImageType.hero);
  const [showEditor, setShowEditor] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Get the latest hero image
  const heroImage = heroImages && heroImages.length > 0 ? heroImages[heroImages.length - 1] : null;

  return (
    <>
      <section id="home" className="pt-16 md:pt-20 relative overflow-hidden">
        {/* Hero Banner Section with Luxury Gradient */}
        <div className="gradient-luxury-blue-mint relative">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="grid lg:grid-cols-2 gap-10 items-center max-w-7xl mx-auto">
              {/* Left Content */}
              <div className="space-y-8 text-center lg:text-left">
                <div className="space-y-5">
                  <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-sky-800 via-blue-700 to-cyan-700 bg-clip-text text-transparent leading-tight">
                    Iki Zahra Laundry
                  </h1>
                  <p className="text-xl md:text-2xl text-sky-800/90 leading-relaxed font-medium">
                    Laundry professional di Jakarta Pusat, Cempaka Putih
                  </p>
                  <p className="text-base md:text-lg text-sky-700/80 leading-relaxed max-w-xl mx-auto lg:mx-0">
                    Layanan laundry berkualitas tinggi dengan hasil terbaik dan harga terjangkau
                  </p>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                  <Button 
                    size="lg" 
                    onClick={() => scrollToSection('services')}
                    className="text-base md:text-lg px-8 md:px-10 py-6 md:py-7 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    Pesan Sekarang
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => scrollToSection('contact')}
                    className="text-base md:text-lg px-8 md:px-10 py-6 md:py-7 border-2 border-sky-600 text-sky-700 hover:bg-sky-50/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    Hubungi Kami
                  </Button>
                </div>
              </div>

              {/* Right Image - Using uploaded hero image or default */}
              <div className="flex justify-center lg:justify-end relative">
                <div className="relative w-full max-w-2xl">
                  <div className="absolute -inset-4 bg-gradient-to-r from-sky-400/20 to-cyan-400/20 rounded-3xl blur-2xl"></div>
                  {heroImage?.image ? (
                    <img
                      src={heroImage.image.getDirectURL()}
                      alt={heroImage.description || "Iki Zahra Laundry"}
                      className="relative w-full h-auto rounded-2xl shadow-2xl ring-4 ring-white/50"
                      loading="eager"
                    />
                  ) : (
                    <img
                      src="/assets/IMG-20260103-WA0001.jpg"
                      alt="Iki Zahra Laundry - Sambut Gembira Bersih Cemerlang"
                      className="relative w-full h-auto rounded-2xl shadow-2xl ring-4 ring-white/50"
                      loading="eager"
                    />
                  )}
                  
                  {/* Edit Button for Admin */}
                  {isAdmin && identity && (
                    <Button
                      onClick={() => setShowEditor(true)}
                      className="absolute top-4 right-4 gap-2 bg-white/95 hover:bg-white text-sky-700 shadow-lg hover:shadow-xl transition-all duration-300"
                      size="sm"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit Banner
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/50 to-transparent pointer-events-none"></div>
        </div>
      </section>

      {/* Hero Banner Editor Dialog */}
      {showEditor && (
        <HeroBannerEditor 
          open={showEditor} 
          onClose={() => setShowEditor(false)}
          currentImage={heroImage}
        />
      )}
    </>
  );
}
