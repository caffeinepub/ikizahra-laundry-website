import { useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { GalleryDisplay } from './components/GalleryDisplay';
import { ServicesWithPricing } from './components/ServicesWithPricing';
import { Contact } from './components/Contact';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { ProfileSetup } from './components/ProfileSetup';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetBackgroundTheme } from './hooks/useQueries';
import { PatternType } from './backend';

function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: backgroundTheme } = useGetBackgroundTheme();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !isInitializing && !profileLoading && isFetched && userProfile === null;

  // Apply background theme
  useEffect(() => {
    if (backgroundTheme) {
      const root = document.documentElement;
      
      // Apply background color
      root.style.setProperty('--bg-pattern-color', backgroundTheme.baseColor);
      
      // Apply transparency (convert 0-100 to 0-1)
      const opacity = Number(backgroundTheme.transparencyLevel) / 100;
      root.style.setProperty('--bg-pattern-opacity', opacity.toString());
      
      // Apply pattern intensity (affects size/scale)
      const intensity = Number(backgroundTheme.patternIntensity) / 100;
      root.style.setProperty('--bg-pattern-intensity', intensity.toString());
    }
  }, [backgroundTheme]);

  const getPatternClass = () => {
    if (!backgroundTheme) return 'laundry-bg-bubbles';
    
    switch (backgroundTheme.pattern) {
      case PatternType.bubbles:
        return 'laundry-bg-bubbles';
      case PatternType.fabricTexture:
        return 'laundry-bg-fabric';
      case PatternType.waterRipples:
        return 'laundry-bg-ripples';
      default:
        return 'laundry-bg-bubbles';
    }
  };

  const patternClass = getPatternClass();

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <div className={`laundry-bg-pattern ${patternClass}`}>
          <Hero />
        </div>
        <div className={`laundry-bg-pattern ${patternClass}`}>
          <GalleryDisplay />
        </div>
        <div className={`laundry-bg-pattern ${patternClass}`}>
          <ServicesWithPricing />
        </div>
        <div className={`laundry-bg-pattern ${patternClass}`}>
          <Contact />
        </div>
        <AdminPanel />
      </main>
      <Footer />
      <Toaster />
      <ProfileSetup open={showProfileSetup} />
    </div>
  );
}

export default App;

