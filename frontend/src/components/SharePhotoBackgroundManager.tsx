import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';
import { processImageWithAspectRatio, type AspectRatioChoice, type ResolutionChoice, formatFileSize } from '../lib/imageProcessor';
import { useGetPhotoBackgroundImage, useUploadPhotoBackgroundImage, useRemovePhotoBackgroundImage } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { useSharePhotoBackgroundFit, type FitMode } from '../hooks/useSharePhotoBackgroundFit';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

interface ProcessedImageInfo {
  blob: Uint8Array<ArrayBuffer>;
  width: number;
  height: number;
  fileSize: number;
  previewUrl: string;
}

export function SharePhotoBackgroundManager() {
  const { actor, isFetching: actorLoading } = useActor();
  const { data: currentBackground, isLoading: backgroundLoading } = useGetPhotoBackgroundImage();
  const uploadMutation = useUploadPhotoBackgroundImage();
  const removeMutation = useRemovePhotoBackgroundImage();
  const { fitMode, setFitMode } = useSharePhotoBackgroundFit();
  
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
      
      toast.success('Background image uploaded successfully!', {
        description: 'The Share Your Photo section will now use your custom image.',
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

  const handleRemove = async () => {
    if (!actor) {
      toast.error('Backend not ready');
      return;
    }

    try {
      await removeMutation.mutateAsync();
      toast.success('Background image removed', {
        description: 'The default background will be used.',
      });
    } catch (error) {
      toast.error('Remove failed', {
        description: error instanceof Error ? error.message : 'An error occurred.',
      });
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
  const isRemoveDisabled = !actor || actorLoading || !currentBackground || removeMutation.isPending;

  return (
    <Card className="luxury-card border-sky-200/50">
      <CardHeader>
        <CardTitle className="text-xl text-sky-900">Share Your Photo - Background Image</CardTitle>
        <p className="text-sm text-sky-700/80 mt-2">
          Customize the background image for the customer photo upload section
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Background Preview */}
        {currentBackground && (
          <div className="space-y-2">
            <Label className="text-sky-900 font-medium">Current Background</Label>
            <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-sky-200">
              <img
                src={currentBackground.getDirectURL()}
                alt="Current background"
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              onClick={handleRemove}
              disabled={isRemoveDisabled}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {removeMutation.isPending ? 'Removing...' : 'Remove Custom Background'}
            </Button>
          </div>
        )}

        {/* Fit Mode Control */}
        <div className="space-y-2">
          <Label htmlFor="fit-mode" className="text-sky-900 font-medium">
            Display Fit Mode
          </Label>
          <Select value={fitMode} onValueChange={(value) => setFitMode(value as FitMode)}>
            <SelectTrigger id="fit-mode" className="border-sky-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cover">Cover (Fill entire area, may crop)</SelectItem>
              <SelectItem value="contain">Contain (Show entire image, may have gaps)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-sky-600">
            {fitMode === 'cover' 
              ? 'Image will fill the entire background area, cropping if necessary.'
              : 'Image will be fully visible, with possible gaps around it.'}
          </p>
        </div>

        {/* File Input */}
        <div className="space-y-2">
          <Label className="text-sky-900 font-medium">Upload New Background</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            id="background-upload"
            disabled={isProcessing || uploadMutation.isPending}
          />
          
          {!processedImage ? (
            <label
              htmlFor="background-upload"
              className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-sky-300 rounded-xl cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition-all duration-300 ${
                isProcessing || uploadMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="h-10 w-10 text-sky-400 mb-3" />
              <p className="text-sky-700 font-medium mb-1">
                {isProcessing ? 'Processing...' : 'Click to select an image'}
              </p>
              <p className="text-sm text-sky-600">JPEG, PNG, or WebP (max 10MB)</p>
            </label>
          ) : (
            <div className="relative w-full">
              <img
                src={processedImage.previewUrl}
                alt="Preview"
                className="w-full h-48 object-contain rounded-xl shadow-lg bg-gray-50 border-2 border-sky-200"
              />
              <button
                onClick={handleClearSelection}
                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                disabled={uploadMutation.isPending}
              >
                <X className="h-4 w-4" />
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
                  <SelectItem value="original">Keep Original</SelectItem>
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
                  <SelectItem value="original">Original Size (No Downscale)</SelectItem>
                  <SelectItem value="720">Auto-adjust to 720px</SelectItem>
                  <SelectItem value="1080">Auto-adjust to 1080px</SelectItem>
                  <SelectItem value="1440">Auto-adjust to 1440px</SelectItem>
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
          className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {uploadMutation.isPending ? 'Uploading...' : isProcessing ? 'Processing...' : 'Upload Background Image'}
        </Button>
      </CardContent>
    </Card>
  );
}
