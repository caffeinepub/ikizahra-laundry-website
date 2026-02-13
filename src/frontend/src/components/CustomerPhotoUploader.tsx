import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob, AspectRatioOption } from '../backend';
import { processImageWithAspectRatio, type AspectRatioChoice, type ResolutionChoice, formatFileSize } from '../lib/imageProcessor';
import { useUploadCustomerPhoto, useGetPhotoBackgroundImage } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { useSharePhotoBackgroundFit } from '../hooks/useSharePhotoBackgroundFit';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

interface ProcessedImageInfo {
  blob: Uint8Array<ArrayBuffer>;
  width: number;
  height: number;
  fileSize: number;
  previewUrl: string;
}

export function CustomerPhotoUploader() {
  const { actor, isFetching: actorLoading } = useActor();
  const uploadMutation = useUploadCustomerPhoto();
  const { data: customBackground, isLoading: backgroundLoading } = useGetPhotoBackgroundImage();
  const { fitMode } = useSharePhotoBackgroundFit();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<ProcessedImageInfo | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioChoice>('original');
  const [resolution, setResolution] = useState<ResolutionChoice>('original');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    await processImage(file, aspectRatio, resolution);
  };

  const processImage = async (file: File, ratio: AspectRatioChoice, res: ResolutionChoice) => {
    setIsProcessing(true);
    try {
      const processed = await processImageWithAspectRatio(file, ratio, res, 0.85);
      
      // Create preview URL
      const blob = new Blob([processed.blob], { type: 'image/jpeg' });
      const previewUrl = URL.createObjectURL(blob);
      
      setProcessedImage({
        blob: processed.blob,
        width: processed.width,
        height: processed.height,
        fileSize: processed.fileSizeBytes,
        previewUrl,
      });
    } catch (error) {
      toast.error('Processing failed', {
        description: error instanceof Error ? error.message : 'Failed to process image.',
      });
      setProcessedImage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAspectRatioChange = async (value: AspectRatioChoice) => {
    setAspectRatio(value);
    if (selectedFile) {
      await processImage(selectedFile, value, resolution);
    }
  };

  const handleResolutionChange = async (value: string) => {
    const res = value === 'original' ? 'original' : parseInt(value) as ResolutionChoice;
    setResolution(res);
    if (selectedFile) {
      await processImage(selectedFile, aspectRatio, res);
    }
  };

  const handleUpload = async () => {
    if (!actor) {
      toast.error('Backend not ready', {
        description: 'Please wait for the connection to be established.',
      });
      return;
    }

    if (!processedImage) {
      toast.error('No image processed', {
        description: 'Please select and process an image first.',
      });
      return;
    }

    try {
      // Create ExternalBlob with progress tracking
      const blob = ExternalBlob.fromBytes(processedImage.blob).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await uploadMutation.mutateAsync(blob);
      
      toast.success('Photo uploaded successfully!', {
        description: 'Thank you for sharing your photo with us.',
      });
      
      // Clear selection and preview
      handleClearSelection();
    } catch (error) {
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'An error occurred during upload.',
      });
      setUploadProgress(0);
    }
  };

  const handleClearSelection = () => {
    if (processedImage?.previewUrl) {
      URL.revokeObjectURL(processedImage.previewUrl);
    }
    setSelectedFile(null);
    setProcessedImage(null);
    setUploadProgress(0);
    setAspectRatio('original');
    setResolution('original');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isUploadDisabled = !actor || actorLoading || !processedImage || uploadMutation.isPending || isProcessing;

  // Determine background image source
  const backgroundImageSrc = customBackground 
    ? customBackground.getDirectURL() 
    : '/assets/generated/contact-woman-laundry.dim_800x600.jpg';

  // Determine object-fit class based on fit mode
  const objectFitClass = fitMode === 'contain' ? 'object-contain' : 'object-cover';

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Background Image Container */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <img
          src={backgroundImageSrc}
          alt="Background"
          className={`w-full h-full ${objectFitClass} opacity-15`}
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
                disabled={isProcessing || uploadMutation.isPending}
              />
              
              {!processedImage ? (
                <label
                  htmlFor="photo-upload"
                  className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-sky-300 rounded-2xl cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition-all duration-300 ${
                    isProcessing || uploadMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="h-12 w-12 text-sky-400 mb-4" />
                  <p className="text-sky-700 font-medium mb-2">
                    {isProcessing ? 'Processing...' : 'Click to select a photo'}
                  </p>
                  <p className="text-sm text-sky-600">JPEG, PNG, or WebP (max 10MB)</p>
                </label>
              ) : (
                <div className="relative w-full">
                  <img
                    src={processedImage.previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-contain rounded-2xl shadow-lg bg-gray-50"
                  />
                  <button
                    onClick={handleClearSelection}
                    className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                    disabled={uploadMutation.isPending}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Aspect Ratio & Resolution Controls */}
            {selectedFile && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aspect-ratio" className="text-sky-900 font-medium">
                    Aspect Ratio
                  </Label>
                  <Select value={aspectRatio} onValueChange={handleAspectRatioChange} disabled={isProcessing || uploadMutation.isPending}>
                    <SelectTrigger id="aspect-ratio" className="border-sky-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">Original (No Crop)</SelectItem>
                      <SelectItem value="1:1">Square (1:1)</SelectItem>
                      <SelectItem value="4:3">Landscape (4:3)</SelectItem>
                      <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resolution" className="text-sky-900 font-medium">
                    Resolution
                  </Label>
                  <Select value={resolution.toString()} onValueChange={handleResolutionChange} disabled={isProcessing || uploadMutation.isPending}>
                    <SelectTrigger id="resolution" className="border-sky-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">Original Size</SelectItem>
                      <SelectItem value="720">720px</SelectItem>
                      <SelectItem value="1080">1080px</SelectItem>
                      <SelectItem value="1440">1440px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Image Info Display */}
            {processedImage && (
              <div className="bg-sky-50/50 rounded-xl p-4 border border-sky-200">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="h-5 w-5 text-sky-600" />
                  <span className="text-sm font-medium text-sky-900">Processed Image Info</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-sky-700">
                  <div>
                    <span className="font-medium">Dimensions:</span> {processedImage.width} × {processedImage.height}px
                  </div>
                  <div>
                    <span className="font-medium">File Size:</span> {formatFileSize(processedImage.fileSize)}
                  </div>
                  <div>
                    <span className="font-medium">Aspect Ratio:</span> {aspectRatio === 'original' ? 'Original' : aspectRatio}
                  </div>
                  <div>
                    <span className="font-medium">Resolution:</span> {resolution === 'original' ? 'Original' : `${resolution}px`}
                  </div>
                </div>
              </div>
            )}

            {/* Backend Status Warning */}
            {!actor && !actorLoading && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800 text-center">
                  ⚠️ Backend connection not available. Please wait or refresh the page.
                </p>
              </div>
            )}

            {actorLoading && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800 text-center">
                  🔄 Connecting to backend...
                </p>
              </div>
            )}

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
              disabled={isUploadDisabled}
              className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-lg py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {uploadMutation.isPending ? 'Uploading...' : isProcessing ? 'Processing...' : 'Upload Photo'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
