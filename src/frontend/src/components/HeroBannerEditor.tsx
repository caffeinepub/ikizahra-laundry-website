import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Info, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AspectRatioOption, ExternalBlob } from "../backend";
import type { ProcessedImage } from "../backend";
import { useUploadHeroImage } from "../hooks/useQueries";
import {
  formatFileSize,
  processImageWithAspectRatio,
  validateImageFile,
} from "../lib/imageProcessor";

type AspectRatioChoice = "1:1" | "4:3" | "9:16";

interface HeroBannerEditorProps {
  open: boolean;
  onClose: () => void;
  currentImage: ProcessedImage | null;
}

export function HeroBannerEditor({
  open,
  onClose,
  currentImage,
}: HeroBannerEditorProps) {
  const uploadHeroImage = useUploadHeroImage();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [selectedAspectRatio, setSelectedAspectRatio] =
    useState<AspectRatioChoice>("4:3");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (currentImage) {
      setDescription(currentImage.description);
      setSelectedAspectRatio(mapEnumToAspectRatio(currentImage.aspectRatio));
    }
  }, [currentImage]);

  const mapAspectRatioToEnum = (
    ratio: AspectRatioChoice,
  ): AspectRatioOption => {
    switch (ratio) {
      case "1:1":
        return AspectRatioOption.square;
      case "4:3":
        return AspectRatioOption.landscape;
      case "9:16":
        return AspectRatioOption.portrait;
      default:
        return AspectRatioOption.landscape;
    }
  };

  const mapEnumToAspectRatio = (
    aspectRatio: AspectRatioOption,
  ): AspectRatioChoice => {
    switch (aspectRatio) {
      case AspectRatioOption.square:
        return "1:1";
      case AspectRatioOption.landscape:
        return "4:3";
      case AspectRatioOption.portrait:
        return "9:16";
      default:
        return "4:3";
    }
  };

  const getAspectRatioLabel = (ratio: AspectRatioChoice): string => {
    switch (ratio) {
      case "1:1":
        return "Persegi 1:1";
      case "4:3":
        return "Landscape 4:3";
      case "9:16":
        return "Vertikal 9:16";
      default:
        return ratio;
    }
  };

  const getAspectRatioClass = (ratio: AspectRatioChoice): string => {
    switch (ratio) {
      case "1:1":
        return "aspect-square";
      case "4:3":
        return "aspect-[4/3]";
      case "9:16":
        return "aspect-[9/16]";
      default:
        return "aspect-[4/3]";
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

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Mohon pilih gambar terlebih dahulu");
      return;
    }

    try {
      setIsProcessing(true);
      toast.info("Memproses gambar...", { duration: 2000 });

      const processedImage = await processImageWithAspectRatio(
        selectedFile,
        selectedAspectRatio,
        1440,
        0.9,
      );

      toast.success(
        `Gambar diproses: ${formatFileSize(processedImage.fileSizeBytes)}`,
        { duration: 2000 },
      );

      setUploadProgress(0);
      let externalBlob = ExternalBlob.fromBytes(processedImage.blob);
      externalBlob = externalBlob.withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await uploadHeroImage.mutateAsync({
        image: externalBlob,
        description: description || "Banner Hero Iki Zahra Laundry",
        aspectRatio: mapAspectRatioToEnum(selectedAspectRatio),
        fileSizeBytes: BigInt(processedImage.fileSizeBytes),
        width: BigInt(processedImage.width),
        height: BigInt(processedImage.height),
      });

      toast.success("Banner hero berhasil diperbarui!");
      resetAndClose();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(
        error.message || "Gagal mengunggah banner. Silakan coba lagi.",
      );
      setUploadProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAndClose = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setUploadProgress(0);
    setIsProcessing(false);
    onClose();
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Banner Hero</DialogTitle>
          <DialogDescription>
            Perbarui gambar banner hero untuk halaman utama
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Image Preview */}
          {currentImage?.image && !selectedFile && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Banner Saat Ini</Label>
              <div className="rounded-lg overflow-hidden border bg-muted max-w-md mx-auto">
                <img
                  src={currentImage.image.getDirectURL()}
                  alt={currentImage.description}
                  className="w-full h-auto object-cover"
                />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                {currentImage.description}
              </p>
            </div>
          )}

          {/* Aspect Ratio Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Pilih Rasio Aspek</Label>
            <RadioGroup
              value={selectedAspectRatio}
              onValueChange={(value) =>
                setSelectedAspectRatio(value as AspectRatioChoice)
              }
              className="grid grid-cols-3 gap-3"
            >
              <div>
                <RadioGroupItem
                  value="1:1"
                  id="hero-ratio-1-1"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="hero-ratio-1-1"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <div className="w-12 h-12 border-2 border-current rounded mb-2" />
                  <span className="text-xs font-medium">1:1</span>
                  <span className="text-xs text-muted-foreground">Persegi</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="4:3"
                  id="hero-ratio-4-3"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="hero-ratio-4-3"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <div className="w-12 h-9 border-2 border-current rounded mb-2" />
                  <span className="text-xs font-medium">4:3</span>
                  <span className="text-xs text-muted-foreground">
                    Landscape
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="9:16"
                  id="hero-ratio-9-16"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="hero-ratio-9-16"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <div className="w-7 h-12 border-2 border-current rounded mb-2" />
                  <span className="text-xs font-medium">9:16</span>
                  <span className="text-xs text-muted-foreground">
                    Vertikal
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Info Banner */}
          <div className="flex gap-3 p-3 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-lg">
            <Info className="h-5 w-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-sky-900 dark:text-sky-100">
              <p className="font-medium mb-1">Gambar akan diproses otomatis:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                <li>
                  Diubah ke rasio {getAspectRatioLabel(selectedAspectRatio)}
                </li>
                <li>Dipotong dan disesuaikan untuk tampilan optimal</li>
                <li>Dikompresi untuk ukuran optimal</li>
                <li>Kualitas tetap terjaga untuk banner</li>
              </ul>
            </div>
          </div>

          {/* File Selection or Preview */}
          {!selectedFile ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {currentImage?.image ? "Pilih Banner Baru" : "Pilih Banner"}
              </Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Klik tombol di bawah untuk memilih gambar banner
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Format: JPG, PNG, GIF (Maks. 10MB)
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <label className="cursor-pointer">
                      Pilih Gambar
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
                <Label className="text-sm font-medium">
                  Pratinjau Banner Baru
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelectedFile}
                  disabled={uploadHeroImage.isPending || isProcessing}
                >
                  <X className="h-4 w-4 mr-1" />
                  Hapus
                </Button>
              </div>
              {previewUrl && (
                <div className="rounded-lg overflow-hidden border bg-muted max-w-md mx-auto">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className={`w-full h-auto ${getAspectRatioClass(selectedAspectRatio)} object-cover`}
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
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="hero-description">Deskripsi Banner</Label>
            <Textarea
              id="hero-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Masukkan deskripsi banner..."
              rows={3}
            />
          </div>

          {/* Upload Progress */}
          {(uploadProgress > 0 || isProcessing) && (
            <div className="space-y-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: isProcessing ? "50%" : `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-center text-muted-foreground">
                {isProcessing
                  ? "Memproses gambar..."
                  : `Mengunggah... ${uploadProgress}%`}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={resetAndClose}
            disabled={uploadHeroImage.isPending || isProcessing}
          >
            Batal
          </Button>
          <Button
            onClick={handleUpload}
            disabled={
              !selectedFile || uploadHeroImage.isPending || isProcessing
            }
          >
            {isProcessing
              ? "Memproses..."
              : uploadHeroImage.isPending
                ? "Mengunggah..."
                : "Simpan Banner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
