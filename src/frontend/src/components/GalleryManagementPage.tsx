import { useState } from 'react';
import { useGetOrderedGalleryImages, useUpdateImageDescription, useUploadGalleryImage, useDeleteGalleryImage, useReplaceGalleryImage, useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Edit2, Upload, Trash2, Image as ImageIcon, Info, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob, AspectRatioOption, ImageType } from '../backend';
import type { ProcessedImage } from '../backend';
import { processImageWithAspectRatio, validateImageFile, formatFileSize } from '../lib/imageProcessor';

type AspectRatioChoice = '1:1' | '4:3' | '9:16';

interface GalleryManagementPageProps {
  onClose: () => void;
}

export function GalleryManagementPage({ onClose }: GalleryManagementPageProps) {
  const { identity } = useInternetIdentity();
  const { data: images, isLoading } = useGetOrderedGalleryImages();
  const { data: isAdmin } = useIsCallerAdmin();
  const updateDescription = useUpdateImageDescription();
  const uploadGalleryImage = useUploadGalleryImage();
  const deleteGalleryImage = useDeleteGalleryImage();
  const replaceGalleryImage = useReplaceGalleryImage();

  const [editingImage, setEditingImage] = useState<{ id: bigint; description: string } | null>(null);
  const [deletingImage, setDeletingImage] = useState<ProcessedImage | null>(null);
  const [replacingImage, setReplacingImage] = useState<ProcessedImage | null>(null);
  const [newDescription, setNewDescription] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatioChoice>('4:3');

  // Replace photo dialog state
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replacePreviewUrl, setReplacePreviewUrl] = useState<string | null>(null);
  const [replaceAspectRatio, setReplaceAspectRatio] = useState<AspectRatioChoice>('4:3');
  const [replaceProgress, setReplaceProgress] = useState(0);
  const [isReplacingProcessing, setIsReplacingProcessing] = useState(false);

  // Filter only gallery images
  const galleryImages = images?.filter(img => img.imageType === ImageType.gallery) || [];

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

  const handleDeleteImage = async () => {
    if (!deletingImage) return;

    try {
      await deleteGalleryImage.mutateAsync(deletingImage.id);
      toast.success('Gambar berhasil dihapus');
      setDeletingImage(null);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Gagal menghapus gambar');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      toast.info('Memproses gambar...', { duration: 2000 });

      const processedImage = await processImageWithAspectRatio(
        selectedFile,
        selectedAspectRatio,
        1080,
        0.85
      );
      
      const aspectRatioEnum = mapAspectRatioToEnum(selectedAspectRatio);
      toast.success(`Gambar diproses (${getAspectRatioLabel(selectedAspectRatio)}): ${formatFileSize(processedImage.fileSizeBytes)}`, { duration: 2000 });

      setUploadProgress(0);
      let externalBlob = ExternalBlob.fromBytes(processedImage.blob);
      externalBlob = externalBlob.withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await uploadGalleryImage.mutateAsync({
        image: externalBlob,
        description: uploadDesc || 'Gambar galeri',
        aspectRatio: aspectRatioEnum,
        fileSizeBytes: BigInt(processedImage.fileSizeBytes),
        width: BigInt(processedImage.width),
        height: BigInt(processedImage.height),
      });

      toast.success('Gambar berhasil diunggah!');
      resetUploadDialog();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Gagal mengunggah gambar');
      setUploadProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReplaceFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setReplaceFile(file);
    const url = URL.createObjectURL(file);
    setReplacePreviewUrl(url);
  };

  const handleReplacePhoto = async () => {
    if (!replaceFile || !replacingImage) return;

    try {
      setIsReplacingProcessing(true);
      toast.info('Memproses gambar baru...', { duration: 2000 });

      const processedImage = await processImageWithAspectRatio(
        replaceFile,
        replaceAspectRatio,
        1080,
        0.85
      );
      
      const aspectRatioEnum = mapAspectRatioToEnum(replaceAspectRatio);
      toast.success(`Gambar diproses (${getAspectRatioLabel(replaceAspectRatio)}): ${formatFileSize(processedImage.fileSizeBytes)}`, { duration: 2000 });

      setReplaceProgress(0);
      let externalBlob = ExternalBlob.fromBytes(processedImage.blob);
      externalBlob = externalBlob.withUploadProgress((percentage) => {
        setReplaceProgress(percentage);
      });

      await replaceGalleryImage.mutateAsync({
        imageId: replacingImage.id,
        newImage: externalBlob,
        aspectRatio: aspectRatioEnum,
        fileSizeBytes: BigInt(processedImage.fileSizeBytes),
        width: BigInt(processedImage.width),
        height: BigInt(processedImage.height),
      });

      toast.success('Foto berhasil diganti!');
      resetReplaceDialog();
    } catch (error: any) {
      console.error('Replace error:', error);
      toast.error(error.message || 'Gagal mengganti foto');
      setReplaceProgress(0);
    } finally {
      setIsReplacingProcessing(false);
    }
  };

  const resetUploadDialog = () => {
    setUploadDialogOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadDesc('');
    setUploadProgress(0);
    setSelectedAspectRatio('4:3');
  };

  const resetReplaceDialog = () => {
    setReplacingImage(null);
    setReplaceFile(null);
    setReplacePreviewUrl(null);
    setReplaceProgress(0);
    setReplaceAspectRatio('4:3');
  };

  const openReplaceDialog = (image: ProcessedImage) => {
    setReplacingImage(image);
    // Set default aspect ratio based on current image
    const currentRatio = getAspectRatioChoiceFromEnum(image.aspectRatio);
    setReplaceAspectRatio(currentRatio);
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
        return AspectRatioOption.landscape;
    }
  };

  const getAspectRatioChoiceFromEnum = (aspectRatio: AspectRatioOption): AspectRatioChoice => {
    switch (aspectRatio) {
      case AspectRatioOption.square:
        return '1:1';
      case AspectRatioOption.landscape:
        return '4:3';
      case AspectRatioOption.portrait:
        return '9:16';
      default:
        return '4:3';
    }
  };

  const getAspectRatioLabel = (ratio: AspectRatioChoice): string => {
    switch (ratio) {
      case '1:1':
        return 'Persegi 1:1';
      case '4:3':
        return 'Landscape 4:3';
      case '9:16':
        return 'Vertikal 9:16';
      default:
        return ratio;
    }
  };

  const getAspectRatioClass = (ratio: AspectRatioChoice): string => {
    switch (ratio) {
      case '1:1':
        return 'aspect-square';
      case '4:3':
        return 'aspect-[4/3]';
      case '9:16':
        return 'aspect-[9/16]';
      default:
        return 'aspect-[4/3]';
    }
  };

  const getAspectRatioDisplay = (aspectRatio: AspectRatioOption): string => {
    switch (aspectRatio) {
      case AspectRatioOption.square:
        return '1:1';
      case AspectRatioOption.landscape:
        return '4:3';
      case AspectRatioOption.portrait:
        return '9:16';
      case AspectRatioOption.original:
        return 'Asli';
      default:
        return 'Unknown';
    }
  };

  // Check if user is admin
  if (!isAdmin || !identity) {
    return (
      <section className="pt-20 md:pt-24 pb-12 min-h-screen">
        <div className="container mx-auto px-4">
          <Button onClick={onClose} variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-muted-foreground text-center text-lg">
                Anda harus login sebagai admin untuk mengakses halaman ini
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="pt-20 md:pt-24 pb-12 min-h-screen">
        <div className="container mx-auto px-4">
          <Button onClick={onClose} variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <div className="text-center mb-8">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-[500px] mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <section className="pt-20 md:pt-24 pb-12 min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <Button onClick={onClose} variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Galeri & Pengaturan Gambar
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Kelola gambar galeri Anda - unggah, edit deskripsi, ganti foto, atau hapus gambar
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <Button onClick={() => setUploadDialogOpen(true)} size="lg" className="gap-2">
              <Upload className="h-5 w-5" />
              Unggah Gambar Baru
            </Button>
          </div>

          {galleryImages.length === 0 ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-center text-lg mb-4">
                  Belum ada gambar di galeri
                </p>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Klik tombol "Unggah Gambar Baru" untuk menambahkan gambar pertama
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {galleryImages.map((image) => (
                <Card key={Number(image.id)} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <div className="relative overflow-hidden bg-muted aspect-[4/3]">
                    {image.image && (
                      <img
                        src={image.image.getDirectURL()}
                        alt={image.description}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex-1">
                        <p className="text-sm text-foreground mb-1 whitespace-pre-wrap break-words">
                          {image.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Rasio: {getAspectRatioDisplay(image.aspectRatio)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => handleEditClick(image.id, image.description)}
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => openReplaceDialog(image)}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => setDeletingImage(image)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Edit Description Dialog */}
      <Dialog open={!!editingImage} onOpenChange={(open) => !open && setEditingImage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Deskripsi Gambar</DialogTitle>
            <DialogDescription>
              Perbarui deskripsi untuk gambar ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Masukkan deskripsi gambar..."
                rows={8}
                className="min-h-[200px] resize-y"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingImage(null)}>
              Batal
            </Button>
            <Button onClick={handleSaveDescription} disabled={updateDescription.isPending}>
              {updateDescription.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingImage} onOpenChange={(open) => !open && setDeletingImage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Gambar?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus gambar "{deletingImage?.description}"? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteImage}
              disabled={deleteGalleryImage.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteGalleryImage.isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Replace Photo Dialog */}
      <Dialog open={!!replacingImage} onOpenChange={(open) => {
        if (!open) resetReplaceDialog();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ganti Foto</DialogTitle>
            <DialogDescription>
              Pilih foto baru untuk mengganti gambar "{replacingImage?.description}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Aspect Ratio Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Pilih Rasio Aspek</Label>
              <RadioGroup
                value={replaceAspectRatio}
                onValueChange={(value) => setReplaceAspectRatio(value as AspectRatioChoice)}
                className="grid grid-cols-3 gap-3"
              >
                <div>
                  <RadioGroupItem value="1:1" id="replace-ratio-1-1" className="peer sr-only" />
                  <Label
                    htmlFor="replace-ratio-1-1"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <div className="w-12 h-12 border-2 border-current rounded mb-2" />
                    <span className="text-xs font-medium">1:1</span>
                    <span className="text-xs text-muted-foreground">Persegi</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="4:3" id="replace-ratio-4-3" className="peer sr-only" />
                  <Label
                    htmlFor="replace-ratio-4-3"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <div className="w-12 h-9 border-2 border-current rounded mb-2" />
                    <span className="text-xs font-medium">4:3</span>
                    <span className="text-xs text-muted-foreground">Landscape</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="9:16" id="replace-ratio-9-16" className="peer sr-only" />
                  <Label
                    htmlFor="replace-ratio-9-16"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <div className="w-7 h-12 border-2 border-current rounded mb-2" />
                    <span className="text-xs font-medium">9:16</span>
                    <span className="text-xs text-muted-foreground">Vertikal</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Info Banner */}
            <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">Foto baru akan diproses otomatis:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>Diubah ke rasio {getAspectRatioLabel(replaceAspectRatio)}</li>
                  <li>Dipotong dan disesuaikan untuk tampilan optimal</li>
                  <li>Dikompresi untuk ukuran optimal</li>
                  <li>Deskripsi gambar tetap sama</li>
                </ul>
              </div>
            </div>

            {!replaceFile ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium mb-2">Pilih foto baru</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Format: JPG, PNG, GIF (Maks. 10MB)
                    </p>
                    <Button asChild variant="outline">
                      <label className="cursor-pointer">
                        Pilih File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleReplaceFileSelect}
                          className="hidden"
                        />
                      </label>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {replacePreviewUrl && (
                  <div className="rounded-lg overflow-hidden border mx-auto max-w-[300px]">
                    <img
                      src={replacePreviewUrl}
                      alt="Preview"
                      className={`w-full h-auto ${getAspectRatioClass(replaceAspectRatio)} object-cover bg-muted`}
                    />
                  </div>
                )}
                <div className="text-sm text-muted-foreground text-center">
                  <p className="font-medium">{replaceFile.name}</p>
                  <p className="text-xs">
                    Ukuran asli: {formatFileSize(replaceFile.size)}
                  </p>
                  <p className="text-xs">
                    Akan diproses ke: {getAspectRatioLabel(replaceAspectRatio)}
                  </p>
                </div>
                {(replaceProgress > 0 || isReplacingProcessing) && (
                  <div className="space-y-2">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: isReplacingProcessing ? '50%' : `${replaceProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                      {isReplacingProcessing ? 'Memproses gambar...' : `Mengunggah... ${replaceProgress}%`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetReplaceDialog}
              disabled={replaceGalleryImage.isPending || isReplacingProcessing}
            >
              Batal
            </Button>
            <Button
              onClick={handleReplacePhoto}
              disabled={!replaceFile || replaceGalleryImage.isPending || isReplacingProcessing}
            >
              {isReplacingProcessing ? 'Memproses...' : replaceGalleryImage.isPending ? 'Mengganti...' : 'Ganti Foto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={(open) => {
        if (!open) resetUploadDialog();
        setUploadDialogOpen(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Unggah Gambar Baru</DialogTitle>
            <DialogDescription>
              Tambahkan gambar baru ke galeri dengan rasio aspek pilihan Anda
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Aspect Ratio Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Pilih Rasio Aspek</Label>
              <RadioGroup
                value={selectedAspectRatio}
                onValueChange={(value) => setSelectedAspectRatio(value as AspectRatioChoice)}
                className="grid grid-cols-3 gap-3"
              >
                <div>
                  <RadioGroupItem value="1:1" id="ratio-1-1" className="peer sr-only" />
                  <Label
                    htmlFor="ratio-1-1"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <div className="w-12 h-12 border-2 border-current rounded mb-2" />
                    <span className="text-xs font-medium">1:1</span>
                    <span className="text-xs text-muted-foreground">Persegi</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="4:3" id="ratio-4-3" className="peer sr-only" />
                  <Label
                    htmlFor="ratio-4-3"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <div className="w-12 h-9 border-2 border-current rounded mb-2" />
                    <span className="text-xs font-medium">4:3</span>
                    <span className="text-xs text-muted-foreground">Landscape</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="9:16" id="ratio-9-16" className="peer sr-only" />
                  <Label
                    htmlFor="ratio-9-16"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <div className="w-7 h-12 border-2 border-current rounded mb-2" />
                    <span className="text-xs font-medium">9:16</span>
                    <span className="text-xs text-muted-foreground">Vertikal</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Info Banner */}
            <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">Gambar akan diproses otomatis:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>Diubah ke rasio {getAspectRatioLabel(selectedAspectRatio)}</li>
                  <li>Dipotong dan disesuaikan untuk tampilan optimal</li>
                  <li>Dikompresi untuk ukuran optimal</li>
                  <li>Kualitas tetap terjaga</li>
                </ul>
              </div>
            </div>

            {!selectedFile ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium mb-2">Pilih gambar</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Format: JPG, PNG, GIF (Maks. 10MB)
                    </p>
                    <Button asChild variant="outline">
                      <label className="cursor-pointer">
                        Pilih File
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
                {previewUrl && (
                  <div className="rounded-lg overflow-hidden border mx-auto max-w-[300px]">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className={`w-full h-auto ${getAspectRatioClass(selectedAspectRatio)} object-cover bg-muted`}
                    />
                  </div>
                )}
                <div className="text-sm text-muted-foreground text-center">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-xs">
                    Ukuran asli: {formatFileSize(selectedFile.size)}
                  </p>
                  <p className="text-xs">
                    Akan diproses ke: {getAspectRatioLabel(selectedAspectRatio)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-desc">Deskripsi</Label>
                  <Textarea
                    id="upload-desc"
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    placeholder="Masukkan deskripsi gambar..."
                    rows={6}
                    className="min-h-[150px] resize-y"
                  />
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
                      {isProcessing ? 'Memproses gambar...' : `Mengunggah... ${uploadProgress}%`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetUploadDialog}
              disabled={uploadGalleryImage.isPending || isProcessing}
            >
              Batal
            </Button>
            <Button
              onClick={handleUploadImage}
              disabled={!selectedFile || uploadGalleryImage.isPending || isProcessing}
            >
              {isProcessing ? 'Memproses...' : uploadGalleryImage.isPending ? 'Mengunggah...' : 'Unggah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
