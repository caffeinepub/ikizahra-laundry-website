import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { LoginButton } from './LoginButton';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showGalleryPage, setShowGalleryPage] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setShowGalleryPage(false);
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const handleGalleryClick = () => {
    setShowGalleryPage(true);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const menuItems = [
    { label: 'Beranda', href: '#home', action: () => scrollToSection('#home') },
    { label: 'Layanan', href: '#services', action: () => scrollToSection('#services') },
    { label: 'Kontak', href: '#contact', action: () => scrollToSection('#contact') },
    { label: 'Galeri & Pengaturan Gambar', href: '#gallery', action: handleGalleryClick },
  ];

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('galleryPageChange', { detail: { showGalleryPage } }));
  }, [showGalleryPage]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md shadow-md' : 'bg-background/80 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <button
            onClick={() => scrollToSection('#home')}
            className="flex items-center gap-3 hover:opacity-90 transition-all duration-300 group"
          >
            <div className="relative">
              <img
                src="/assets/generated/ikizahra-logo-transparent.dim_200x200.png"
                alt="Ikizahra Laundry"
                className="h-10 w-10 md:h-12 md:w-12 transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col items-start">
              <span className="header-brand-text text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-wide">
                Iki Zahra Laundry
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block font-medium tracking-wider">
                www.ikizahralaundry.co.id
              </span>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-4">
            {menuItems.map((item) => (
              <button
                key={item.href}
                onClick={item.action}
                className="text-foreground/80 hover:text-primary transition-colors font-medium"
              >
                {item.label}
              </button>
            ))}
            <LoginButton />
          </nav>

          <div className="lg:hidden flex items-center gap-2">
            <LoginButton />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4 mt-8">
                  {menuItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={item.action}
                      className="text-lg text-left py-2 hover:text-primary transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
