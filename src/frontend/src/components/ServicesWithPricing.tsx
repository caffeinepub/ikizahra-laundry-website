import { useState, useEffect } from 'react';
import { useGetServicesByCategory, useGetServicesByStoreSubcategory, useCreateService, useCreateStoreSubcategoryService, useUpdateService, useUpdateStoreSubcategoryService, useDeleteService, useDeleteStoreSubcategoryService, useUploadServiceImage, useUploadStoreSubcategoryServiceImage, useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Edit2, Trash2, Upload, Store, Globe, Image as ImageIcon, X, Info, Users, UserCog } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { toast } from 'sonner';
import { ServiceCategory, StoreServiceCategory, ExternalBlob, AspectRatioOption } from '../backend';
import type { Service, StoreSubcategoryService } from '../backend';
import { processImageWithAspectRatio, validateImageFile, formatFileSize } from '../lib/imageProcessor';

type AspectRatioChoice = '1:1' | '4:3' | '9:16';

const WHATSAPP_NUMBER = '6285716733929';

export function ServicesWithPricing() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: onlineServices, isLoading: onlineLoading } = useGetServicesByCategory(ServiceCategory.online);
  const { data: selfServices, isLoading: selfLoading } = useGetServicesByStoreSubcategory(StoreServiceCategory.selfService);
  const { data: operatorServices, isLoading: operatorLoading } = useGetServicesByStoreSubcategory(StoreServiceCategory.operatorService);
  
  const createService = useCreateService();
  const createStoreSubcategoryService = useCreateStoreSubcategoryService();
  const updateService = useUpdateService();
  const updateStoreSubcategoryService = useUpdateStoreSubcategoryService();
  const deleteService = useDeleteService();
  const deleteStoreSubcategoryService = useDeleteStoreSubcategoryService();
  const uploadServiceImage = useUploadServiceImage();
  const uploadStoreSubcategoryServiceImage = useUploadStoreSubcategoryServiceImage();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageUploadDialogOpen, setImageUploadDialogOpen] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedStoreSubcategory, setSelectedStoreSubcategory] = useState<StoreServiceCategory | null>(null);
  const [editingService, setEditingService] = useState<Service | StoreSubcategoryService | null>(null);
  const [editingServiceType, setEditingServiceType] = useState<'online' | 'store'>('online');
  const [deletingService, setDeletingService] = useState<Service | StoreSubcategoryService | null>(null);
  const [deletingServiceType, setDeletingServiceType] = useState<'online' | 'store'>('online');
  const [uploadingService, setUploadingService] = useState<Service | StoreSubcategoryService | null>(null);
  const [uploadingServiceType, setUploadingServiceType] = useState<'online' | 'store'>('online');
  
  const [formData, setFormData] = useState({ name: '', description: '', price: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatioChoice>('1:1');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (selectedFile && previewUrl) {
      URL.revokeObjectURL(previewUrl);
      const newUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(newUrl);
    }
  }, [selectedAspectRatio]);

  const formatPrice = (price: bigint) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(price));
  };

  const getAspectRatioClass = (ratio: AspectRatioChoice) => {
    switch (ratio) {
      case '1:1':
        return 'aspect-square';
      case '4:3':
        return 'aspect-[4/3]';
      case '9:16':
        return 'aspect-[9/16]';
      default:
        return 'aspect-square';
    }
  };

  const getAspectRatioLabel = (ratio: AspectRatioChoice) => {
    switch (ratio) {
      case '1:1':
        return 'Persegi (1:1)';
      case '4:3':
        return 'Landscape (4:3)';
      case '9:16':
        return 'Vertikal (9:16)';
      default:
        return ratio;
    }
  };

  const mapAspectRatioToEnum = (ratio: AspectRatioChoice): AspectRatioOption => {
    switch (ratio) {
      case '1:1':
        return AspectRatioOption.square;
      case '4:3':
        return AspectRatioOption.landscape;
      case '9:16':
        return AspectRatioOption.portrait;
      default:
        return AspectRatioOption.square;
    }
  };

  const mapEnumToAspectRatio = (aspectRatio: AspectRatioOption): AspectRatioChoice => {
    switch (aspectRatio) {
      case AspectRatioOption.square:
        return '1:1';
      case AspectRatioOption.landscape:
        return '4:3';
      case AspectRatioOption.portrait:
        return '9:16';
      default:
        return '1:1';
    }
  };

  const getServiceImageAspectRatio = (service: Service | StoreSubcategoryService): AspectRatioChoice => {
    if (!service.image) return '1:1';
    return mapEnumToAspectRatio(service.image.aspectRatio);
  };

  // Calculate adaptive image container size based on text content length
  const calculateImageSize = (service: Service | StoreSubcategoryService): string => {
    const textLength = service.name.length + service.description.length;
    
    // Size ranges from 120px to 200px based on text length
    // Short text (< 50 chars): smaller image (120px)
    // Medium text (50-100 chars): medium image (150px)
    // Long text (100-150 chars): larger image (180px)
    // Very long text (> 150 chars): largest image (200px)
    let size = 120;
    
    if (textLength < 50) {
      size = 120;
    } else if (textLength < 100) {
      size = 150;
    } else if (textLength < 150) {
      size = 180;
    } else {
      size = 200;
    }
    
    return `${size}px`;
  };

  const createWhatsAppLink = (serviceName: string, price: bigint) => {
    const formattedPrice = formatPrice(price);
    const message = `Halo, saya ingin memesan layanan ${serviceName} dengan harga ${formattedPrice} dari website Iki Zahra Laundry.`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  };

  const handleCreateService = async () => {
    if (!formData.name || !formData.description || !formData.price) {
      toast.error('Nama, deskripsi, dan harga harus diisi');
      return;
    }

    try {
      if (selectedCategory) {
        await createService.mutateAsync({
          name: formData.name,
          description: formData.description,
          price: BigInt(parseInt(formData.price)),
          category: selectedCategory,
        });
      } else if (selectedStoreSubcategory) {
        await createStoreSubcategoryService.mutateAsync({
          name: formData.name,
          description: formData.description,
          price: BigInt(parseInt(formData.price)),
          subcategory: selectedStoreSubcategory,
        });
      }

      toast.success('Layanan berhasil ditambahkan');
      setCreateDialogOpen(false);
      setFormData({ name: '', description: '', price: '' });
      setSelectedCategory(null);
      setSelectedStoreSubcategory(null);
    } catch (error: any) {
      console.error('Create error:', error);
      toast.error(error.message || 'Gagal menambahkan layanan');
    }
  };

  const handleUpdateService = async () => {
    if (!editingService) return;

    try {
      if (editingServiceType === 'online') {
        await updateService.mutateAsync({
          id: editingService.id,
          name: formData.name,
          description: formData.description,
          price: BigInt(parseInt(formData.price || '0')),
        });
      } else {
        await updateStoreSubcategoryService.mutateAsync({
          id: editingService.id,
          name: formData.name,
          description: formData.description,
          price: BigInt(parseInt(formData.price || '0')),
        });
      }

      toast.success('Layanan berhasil diperbarui');
      setEditDialogOpen(false);
      setEditingService(null);
      setFormData({ name: '', description: '', price: '' });
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || 'Gagal memperbarui layanan');
    }
  };

  const handleDeleteService = async () => {
    if (!deletingService) return;

    try {
      if (deletingServiceType === 'online') {
        await deleteService.mutateAsync(deletingService.id);
      } else {
        await deleteStoreSubcategoryService.mutateAsync(deletingService.id);
      }
      toast.success('Layanan berhasil dihapus');
      setDeleteDialogOpen(false);
      setDeletingService(null);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Gagal menghapus layanan');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUploadImage = async () => {
    if (!selectedFile || !uploadingService) {
      toast.error('Mohon pilih gambar terlebih dahulu');
      return;
    }

    try {
      setIsProcessing(true);
      toast.info('Memproses gambar...', { duration: 2000 });

      const processedImage = await processImageWithAspectRatio(
        selectedFile, 
        selectedAspectRatio,
        1080,
        0.85
      );
      
      toast.success(`Gambar diproses: ${formatFileSize(processedImage.fileSizeBytes)}`, { duration: 2000 });

      setUploadProgress(0);
      let externalBlob = ExternalBlob.fromBytes(processedImage.blob);
      externalBlob = externalBlob.withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      if (uploadingServiceType === 'online') {
        await uploadServiceImage.mutateAsync({
          id: uploadingService.id,
          image: externalBlob,
          aspectRatio: mapAspectRatioToEnum(selectedAspectRatio),
          fileSizeBytes: BigInt(processedImage.fileSizeBytes),
          width: BigInt(processedImage.width),
          height: BigInt(processedImage.height),
        });
      } else {
        await uploadStoreSubcategoryServiceImage.mutateAsync({
          id: uploadingService.id,
          image: externalBlob,
          aspectRatio: mapAspectRatioToEnum(selectedAspectRatio),
          fileSizeBytes: BigInt(processedImage.fileSizeBytes),
          width: BigInt(processedImage.width),
          height: BigInt(processedImage.height),
        });
      }

      toast.success('Gambar berhasil diunggah!');
      resetImageUploadDialog();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Gagal mengunggah gambar. Silakan coba lagi.');
      setUploadProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImageUploadDialog = () => {
    setImageUploadDialogOpen(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setUploadingService(null);
    setUploadProgress(0);
    setIsProcessing(false);
    setSelectedAspectRatio('1:1');
  };

  const openEditDialog = (service: Service | StoreSubcategoryService, type: 'online' | 'store') => {
    setEditingService(service);
    setEditingServiceType(type);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
    });
    setEditDialogOpen(true);
  };

  const openImageUploadDialog = (service: Service | StoreSubcategoryService, type: 'online' | 'store') => {
    setUploadingService(service);
    setUploadingServiceType(type);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setIsProcessing(false);
    setSelectedAspectRatio('1:1');
    setImageUploadDialogOpen(true);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const renderServiceCard = (service: Service | StoreSubcategoryService, type: 'online' | 'store') => {
    const imageSize = calculateImageSize(service);
    
    return (
      <Card key={Number(service.id)} className="luxury-card border-sky-200/50 overflow-hidden hover:scale-105 transition-all duration-300 flex flex-col">
        <div 
          className="relative overflow-hidden bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center flex-shrink-0"
          style={{ width: imageSize, height: imageSize, margin: '0 auto', marginTop: '1rem' }}
        >
          {service.image?.image ? (
            <img
              src={service.image.image.getDirectURL()}
              alt={service.name}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center rounded-lg">
              <ImageIcon className="h-12 w-12 text-sky-300" />
            </div>
          )}
        </div>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-sky-900">{service.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 flex-grow flex flex-col">
          <p className="text-sm text-sky-700/80 leading-relaxed flex-grow">{service.description}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold bg-gradient-to-r from-sky-700 to-blue-700 bg-clip-text text-transparent">
              {formatPrice(service.price)}
            </span>
          </div>
          
          {/* WhatsApp Order Button */}
          <Button
            className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20BA5A] hover:to-[#0F7A6C] text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            asChild
          >
            <a
              href={createWhatsAppLink(service.name, service.price)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <SiWhatsapp className="h-4 w-4" />
              Pesan Sekarang
            </a>
          </Button>

          {/* Admin Controls */}
          {isAdmin && identity && (
            <div className="flex gap-2 pt-2 border-t border-sky-200">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-sky-300 text-sky-700 hover:bg-sky-50"
                onClick={() => openImageUploadDialog(service, type)}
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload Foto
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-sky-300 text-sky-700 hover:bg-sky-50"
                onClick={() => openEditDialog(service, type)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-sky-300 text-sky-700 hover:bg-sky-50"
                onClick={() => {
                  setDeletingService(service);
                  setDeletingServiceType(type);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (onlineLoading || selfLoading || operatorLoading) {
    return (
      <section id="services" className="py-20 gradient-luxury-blue">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-[500px] mx-auto" />
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const onlineCount = onlineServices?.length || 0;
  const selfCount = selfServices?.length || 0;
  const operatorCount = operatorServices?.length || 0;

  return (
    <>
      <section id="services" className="py-24 gradient-luxury-blue relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-sky-400/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-400/20 to-transparent rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-sky-800 via-blue-700 to-cyan-700 bg-clip-text text-transparent">
              Layanan Kami
            </h2>
            <p className="text-lg md:text-xl text-sky-800/80 max-w-2xl mx-auto leading-relaxed">
              Pilih layanan yang sesuai dengan kebutuhan Anda
            </p>
          </div>

          <div className="space-y-16 max-w-7xl mx-auto">
            {/* Online Services */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center shadow-lg">
                    <Globe className="h-7 w-7 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-sky-900">Layanan Online ({onlineCount})</h3>
                    <p className="text-sky-700/80 mt-1">Layanan yang dapat dipesan secara online dengan penjemputan</p>
                  </div>
                </div>
                {isAdmin && identity && (
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 shadow-md"
                    onClick={() => {
                      setSelectedCategory(ServiceCategory.online);
                      setSelectedStoreSubcategory(null);
                      setCreateDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah
                  </Button>
                )}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!onlineServices || onlineServices.length === 0 ? (
                  <Card className="md:col-span-2 lg:col-span-3 luxury-card border-sky-200/50">
                    <CardContent className="py-16 text-center text-sky-700/80">
                      Belum ada layanan online
                    </CardContent>
                  </Card>
                ) : (
                  onlineServices.map((service) => renderServiceCard(service, 'online'))
                )}
              </div>
            </div>

            {/* In-Store Services with Two Subcategories */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shadow-lg">
                  <Store className="h-7 w-7 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-sky-900">Layanan di Tempat</h3>
                  <p className="text-sky-700/80 mt-1">Layanan yang tersedia dengan mengunjungi lokasi kami</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-10">
                {/* Left Column: Self Service */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-md">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-sky-900">Layanan Laundry Self Service ({selfCount})</h4>
                      </div>
                    </div>
                    {isAdmin && identity && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-sky-300 text-sky-700 hover:bg-sky-50"
                        onClick={() => {
                          setSelectedCategory(null);
                          setSelectedStoreSubcategory(StoreServiceCategory.selfService);
                          setCreateDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Tambah
                      </Button>
                    )}
                  </div>
                  <div className="space-y-6">
                    {!selfServices || selfServices.length === 0 ? (
                      <Card className="luxury-card border-sky-200/50">
                        <CardContent className="py-16 text-center text-sky-700/80">
                          Belum ada layanan self service
                        </CardContent>
                      </Card>
                    ) : (
                      selfServices.map((service) => renderServiceCard(service, 'store'))
                    )}
                  </div>
                </div>

                {/* Right Column: Operator Service */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center shadow-md">
                        <UserCog className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-sky-900">Layanan Laundry Operator Service ({operatorCount})</h4>
                      </div>
                    </div>
                    {isAdmin && identity && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-sky-300 text-sky-700 hover:bg-sky-50"
                        onClick={() => {
                          setSelectedCategory(null);
                          setSelectedStoreSubcategory(StoreServiceCategory.operatorService);
                          setCreateDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Tambah
                      </Button>
                    )}
                  </div>
                  <div className="space-y-6">
                    {!operatorServices || operatorServices.length === 0 ? (
                      <Card className="luxury-card border-sky-200/50">
                        <CardContent className="py-16 text-center text-sky-700/80">
                          Belum ada layanan operator service
                        </CardContent>
                      </Card>
                    ) : (
                      operatorServices.map((service) => renderServiceCard(service, 'store'))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Create Service Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="luxury-card">
          <DialogHeader>
            <DialogTitle className="text-sky-900">Tambah Layanan Baru</DialogTitle>
            <DialogDescription>
              Tambahkan layanan {selectedCategory === ServiceCategory.online ? 'online' : selectedStoreSubcategory === StoreServiceCategory.selfService ? 'self service' : 'operator service'} baru
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sky-900 font-medium">Nama Layanan</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Cuci Reguler"
                className="border-sky-200 focus:border-sky-400 focus:ring-sky-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sky-900 font-medium">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi layanan..."
                rows={3}
                className="border-sky-200 focus:border-sky-400 focus:ring-sky-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sky-900 font-medium">Harga (IDR)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="35000"
                className="border-sky-200 focus:border-sky-400 focus:ring-sky-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleCreateService} 
              disabled={createService.isPending || createStoreSubcategoryService.isPending}
              className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700"
            >
              {(createService.isPending || createStoreSubcategoryService.isPending) ? 'Menambahkan...' : 'Tambah Layanan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="luxury-card">
          <DialogHeader>
            <DialogTitle className="text-sky-900">Edit Layanan</DialogTitle>
            <DialogDescription>
              Perbarui informasi layanan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sky-900 font-medium">Nama Layanan</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-sky-200 focus:border-sky-400 focus:ring-sky-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sky-900 font-medium">Deskripsi</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="border-sky-200 focus:border-sky-400 focus:ring-sky-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price" className="text-sky-900 font-medium">Harga (IDR)</Label>
              <Input
                id="edit-price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="border-sky-200 focus:border-sky-400 focus:ring-sky-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleUpdateService} 
              disabled={updateService.isPending || updateStoreSubcategoryService.isPending}
              className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700"
            >
              {(updateService.isPending || updateStoreSubcategoryService.isPending) ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Service Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="luxury-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sky-900">Hapus Layanan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus layanan "{deletingService?.name}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteService}
              className="bg-destructive hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Upload Dialog */}
      <Dialog open={imageUploadDialogOpen} onOpenChange={(open) => {
        if (!open) resetImageUploadDialog();
        setImageUploadDialogOpen(open);
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto luxury-card">
          <DialogHeader>
            <DialogTitle className="text-sky-900">Upload Foto Layanan</DialogTitle>
            <DialogDescription>
              {uploadingService?.image?.image
                ? 'Ganti foto untuk layanan ini. Foto lama akan diganti dengan yang baru.'
                : 'Tambahkan foto untuk layanan ini'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Info Banner */}
            <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">Foto akan diproses otomatis:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>Diubah ke rasio persegi (1:1)</li>
                  <li>Dikompresi untuk ukuran optimal</li>
                  <li>Kualitas tetap terjaga</li>
                  <li>Ukuran gambar akan disesuaikan dengan panjang teks</li>
                </ul>
              </div>
            </div>

            {/* Current Image Preview */}
            {uploadingService?.image?.image && !selectedFile && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-sky-900">Foto Saat Ini</Label>
                <div className="rounded-lg overflow-hidden border bg-muted mx-auto" style={{ width: calculateImageSize(uploadingService), height: calculateImageSize(uploadingService) }}>
                  <img
                    src={uploadingService.image.image.getDirectURL()}
                    alt={uploadingService.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Rasio: Persegi (1:1)
                </p>
              </div>
            )}

            {/* File Selection or Preview */}
            {!selectedFile ? (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-sky-900">
                  {uploadingService?.image?.image ? 'Pilih Foto Baru' : 'Pilih Foto'}
                </Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Klik tombol di bawah untuk memilih foto
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Format: JPG, PNG, GIF (Maks. 10MB)
                      </p>
                    </div>
                    <Button asChild variant="outline">
                      <label className="cursor-pointer">
                        Pilih Foto
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-sky-900">Pratinjau Foto Baru</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelectedFile}
                    disabled={uploadServiceImage.isPending || uploadStoreSubcategoryServiceImage.isPending || isProcessing}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Hapus
                  </Button>
                </div>
                {previewUrl && (
                  <div className="rounded-lg overflow-hidden border bg-muted mx-auto aspect-square" style={{ width: uploadingService ? calculateImageSize(uploadingService) : '150px' }}>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="text-sm text-muted-foreground text-center">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-xs">
                    Ukuran asli: {formatFileSize(selectedFile.size)}
                  </p>
                  <p className="text-xs">
                    Akan diproses ke: Persegi (1:1)
                  </p>
                </div>
                {(uploadProgress > 0 || isProcessing) && (
                  <div className="space-y-2">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: isProcessing ? '50%' : `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                      {isProcessing ? 'Memproses foto...' : `Mengunggah... ${uploadProgress}%`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetImageUploadDialog}
              disabled={uploadServiceImage.isPending || uploadStoreSubcategoryServiceImage.isPending || isProcessing}
            >
              Batal
            </Button>
            <Button
              onClick={handleUploadImage}
              disabled={!selectedFile || uploadServiceImage.isPending || uploadStoreSubcategoryServiceImage.isPending || isProcessing}
              className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700"
            >
              {isProcessing ? 'Memproses...' : (uploadServiceImage.isPending || uploadStoreSubcategoryServiceImage.isPending) ? 'Mengunggah...' : 'Upload Foto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
