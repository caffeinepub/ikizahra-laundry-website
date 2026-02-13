import { useGetContactInfo } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone, MapPin, Clock } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { CustomerPhotoUploader } from './CustomerPhotoUploader';

export function Contact() {
  const { data: contactInfo, isLoading } = useGetContactInfo();

  if (isLoading) {
    return (
      <section id="contact" className="py-20 gradient-luxury-beige-gold">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-64 mx-auto mb-12" />
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-24 gradient-luxury-beige-gold relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-sky-300/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-cyan-300/20 to-transparent rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-sky-800 via-blue-700 to-cyan-700 bg-clip-text text-transparent">
            Contact Us
          </h2>
          <p className="text-lg md:text-xl text-sky-800/80 max-w-2xl mx-auto leading-relaxed">
            We're ready to serve you. Contact us for more information or to place an order
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Contact Info Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="luxury-card border-sky-200/50 hover:scale-105 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center mb-3 shadow-md">
                  <Phone className="h-7 w-7 text-sky-600" />
                </div>
                <CardTitle className="text-base text-sky-900 font-semibold">Phone</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={`tel:${contactInfo?.phone || '6285716733929'}`}
                  className="text-sm text-sky-700 hover:text-sky-900 transition-colors font-medium"
                >
                  62 857-1673-3929
                </a>
              </CardContent>
            </Card>

            <Card className="luxury-card border-green-200/50 hover:scale-105 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mb-3 shadow-md">
                  <SiWhatsapp className="h-7 w-7 text-green-600" />
                </div>
                <CardTitle className="text-base text-sky-900 font-semibold">WhatsApp</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={contactInfo?.whatsapp || 'https://wa.me/6285716733929'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-sky-700 hover:text-sky-900 transition-colors font-medium"
                >
                  62 857-1673-3929
                </a>
              </CardContent>
            </Card>

            <Card className="luxury-card border-sky-200/50 hover:scale-105 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center mb-3 shadow-md">
                  <MapPin className="h-7 w-7 text-sky-600" />
                </div>
                <CardTitle className="text-base text-sky-900 font-semibold">Address</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-sky-700 leading-relaxed">
                  Jl. Cempaka Warna No. 26 RT 09 RW 04, Cempaka Putih, Jakarta Pusat
                </p>
              </CardContent>
            </Card>

            <Card className="luxury-card border-sky-200/50 hover:scale-105 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-3 shadow-md">
                  <Clock className="h-7 w-7 text-sky-600" />
                </div>
                <CardTitle className="text-base text-sky-900 font-semibold">Operating Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-sky-700 font-medium">
                  Monday - Saturday
                </p>
                <p className="text-sm text-sky-700">
                  08:00 - 20:00 WIB
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Photo Upload Component */}
          <CustomerPhotoUploader />
        </div>
      </div>
    </section>
  );
}
