import { useState, useRef } from 'react';
import { useGetContactInfo, useUploadCustomerPhoto } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone, MapPin, Clock, Upload, X } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function Contact() {
  const { data: contactInfo, isLoading } = useGetContactInfo();
  const uploadMutation = useUploadCustomerPhoto();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please select a JPEG, PNG, or WebP image.',
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large', {
        description: 'Maximum file size is 10MB.',
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('No file selected', {
        description: 'Please select an image to upload.',
      });
      return;
    }

    try {
      // Convert file to Uint8Array
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Create ExternalBlob with progress tracking
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await uploadMutation.mutateAsync(blob);
      
      toast.success('Photo uploaded successfully!', {
        description: 'Thank you for sharing your photo with us.',
      });
      
      // Clear selection and preview
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'An error occurred during upload.',
      });
      setUploadProgress(0);
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

          {/* Photo Upload Card */}
          <div className="relative max-w-3xl mx-auto">
            {/* Background Image Container */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <img
                src="/assets/generated/contact-woman-laundry.dim_800x600.jpg"
                alt="Woman loading laundry into washing machine"
                className="w-full h-full object-cover opacity-15"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-sky-50/95 to-blue-50/90"></div>
            </div>

            {/* Upload Card */}
            <Card className="luxury-card border-sky-200/50 relative z-10 backdrop-blur-sm bg-white/80">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-sky-900 text-center">Share Your Photo</CardTitle>
                <p className="text-center text-sky-700/80 mt-2">Upload a photo to share with us</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* File Input */}
                  <div className="flex flex-col items-center justify-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="photo-upload"
                    />
                    
                    {!previewUrl ? (
                      <label
                        htmlFor="photo-upload"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-sky-300 rounded-2xl cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition-all duration-300"
                      >
                        <Upload className="h-12 w-12 text-sky-400 mb-4" />
                        <p className="text-sky-700 font-medium mb-2">Click to select a photo</p>
                        <p className="text-sm text-sky-600">JPEG, PNG, or WebP (max 10MB)</p>
                      </label>
                    ) : (
                      <div className="relative w-full">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded-2xl shadow-lg"
                        />
                        <button
                          onClick={handleClearSelection}
                          className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                          disabled={uploadMutation.isPending}
                        >
                          <X className="h-5 w-5" />
                        </button>
                        {selectedFile && (
                          <div className="mt-3 text-center">
                            <p className="text-sm text-sky-700">
                              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Upload Progress */}
                  {uploadMutation.isPending && uploadProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-sky-700">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-sky-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-sky-600 to-blue-600 h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploadMutation.isPending}
                    className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-lg py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {uploadMutation.isPending ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
