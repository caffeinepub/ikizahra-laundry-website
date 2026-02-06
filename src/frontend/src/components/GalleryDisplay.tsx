import { useState, useEffect } from 'react';
import { useGetOrderedGalleryImages, useUpdateImageDescription, useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Edit2, Image as ImageIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ImageType } from '../backend';
import { GalleryManagementPage } from './GalleryManagementPage';

export function GalleryDisplay() {
  const { identity } = useInternetIdentity();
  const { data: images, isLoading } = useGetOrderedGalleryImages();
  const { data: isAdmin } = useIsCallerAdmin();
  const updateDescription = useUpdateImageDescription();

  const [editingImage, setEditingImage] = useState<{ id: bigint; description: string } | null>(null);
  const [newDescription, setNewDescription] = useState('');
  const [showGalleryPage, setShowGalleryPage] = useState(false);

  // Listen for gallery page navigation
  useEffect(() => {
    const handleGalleryPageChange = (e: CustomEvent) => {
      setShowGalleryPage(e.detail.showGalleryPage);
    };

    window.addEventListener('galleryPageChange', handleGalleryPageChange as EventListener);
    return () => {
      window.removeEventListener('galleryPageChange', handleGalleryPageChange as EventListener);
    };
  }, []);

  const handleEditClick = (id: bigint, currentDesc: string) => {
    setEditingImage({ id, description: currentDesc });
    setNewDescription(currentDesc);
  };

  const handleSaveDescription = async () => {
    if (!editingImage) return;

    try {
      await updateDescription.mutateAsync({
        id: editingImage.id,
        description: newDescription,
      });
      toast.success('Deskripsi berhasil diperbarui');
      setEditingImage(null);
      setNewDescription('');
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || 'Gagal memperbarui deskripsi');
    }
  };

  const handleAddImageClick = () => {
    setShowGalleryPage(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter only gallery images (not hero, logo, or service images)
  const galleryImages = images?.filter(img => img.imageType === ImageType.gallery) || [];

  // Show gallery management page if requested
  if (showGalleryPage) {
    return <GalleryManagementPage onClose={() => setShowGalleryPage(false)} />;
  }

  if (isLoading) {
    return (
      <section className="py-16 md:py-20 gradient-luxury-mint-beige">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-[4/3]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="gallery" className="py-20 gradient-luxury-mint-beige relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-mint-300/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-beige-300/20 to-transparent rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-700 bg-clip-text text-transparent">
              Galeri Kami
            </h2>
            <p className="text-lg md:text-xl text-emerald-800/80 max-w-2xl mx-auto leading-relaxed">
              Lihat hasil kerja dan fasilitas laundry kami yang berkualitas tinggi
            </p>
          </div>

          {galleryImages.length === 0 ? (
            <Card className="max-w-2xl mx-auto luxury-card border-emerald-200/50">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-6 shadow-lg">
                  <ImageIcon className="h-12 w-12 text-emerald-600" />
                </div>
                <p className="text-emerald-800/80 text-center text-xl mb-6 font-medium">
                  Belum ada gambar di galeri
                </p>
                {isAdmin && identity && (
                  <Button 
                    onClick={handleAddImageClick} 
                    className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    size="lg"
                  >
                    <Plus className="h-5 w-5" />
                    Tambah Gambar
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {galleryImages.map((image) => (
                  <Card key={Number(image.id)} className="luxury-card border-emerald-200/50 overflow-hidden group hover:scale-105 transition-all duration-300">
                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 aspect-[4/3]">
                      {image.image && (
                        <img
                          src={image.image.getDirectURL()}
                          alt={image.description}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm text-emerald-900/90 leading-relaxed whitespace-pre-wrap break-words">
                            {image.description}
                          </p>
                        </div>
                        {isAdmin && identity && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 flex-shrink-0 hover:bg-emerald-100"
                            onClick={() => handleEditClick(image.id, image.description)}
                          >
                            <Edit2 className="h-4 w-4 text-emerald-700" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {isAdmin && identity && (
                <div className="flex justify-center mt-12">
                  <Button 
                    onClick={handleAddImageClick} 
                    size="lg" 
                    className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 px-8 py-6 text-lg"
                  >
                    <Plus className="h-5 w-5" />
                    Tambah Gambar
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Dialog open={!!editingImage} onOpenChange={(open) => !open && setEditingImage(null)}>
        <DialogContent className="luxury-card">
          <DialogHeader>
            <DialogTitle className="text-emerald-900">Edit Deskripsi Gambar</DialogTitle>
            <DialogDescription>
              Perbarui deskripsi untuk gambar ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-emerald-900 font-medium">Deskripsi</Label>
              <Textarea
                id="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Masukkan deskripsi gambar..."
                rows={8}
                className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400 min-h-[200px] resize-y"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingImage(null)}>
              Batal
            </Button>
            <Button 
              onClick={handleSaveDescription} 
              disabled={updateDescription.isPending}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              {updateDescription.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
