/**
 * Image processing utility for resizing and compressing images
 * Supports multiple aspect ratios: 1:1 (square), 4:3 (landscape), 9:16 (portrait/vertical), and original
 */

export interface ProcessedImageData {
  blob: Uint8Array<ArrayBuffer>;
  aspectRatio: string;
  fileSizeBytes: number;
  width: number;
  height: number;
}

export type AspectRatioChoice = '1:1' | '4:3' | '9:16' | 'original';
export type ResolutionChoice = 'original' | 720 | 1080 | 1440;

/**
 * Process an image file with selected aspect ratio, resolution and compress
 * @param file - The image file to process
 * @param aspectRatio - Target aspect ratio ('1:1', '4:3', '9:16', or 'original')
 * @param resolution - Target resolution ('original', 720, 1080, or 1440)
 * @param quality - JPEG quality 0-1 (default: 0.85 for good balance)
 * @returns Processed image data
 */
export async function processImageWithAspectRatio(
  file: File,
  aspectRatio: AspectRatioChoice,
  resolution: ResolutionChoice = 1080,
  quality: number = 0.85
): Promise<ProcessedImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file gambar'));
    };

    img.onload = () => {
      try {
        let targetWidth: number;
        let targetHeight: number;

        // Handle original aspect ratio
        if (aspectRatio === 'original') {
          // Determine target width based on resolution
          if (resolution === 'original') {
            targetWidth = img.width;
            targetHeight = img.height;
          } else {
            // Scale down to target resolution, never upscale
            const maxDimension = resolution;
            if (img.width > img.height) {
              // Landscape or square
              targetWidth = Math.min(img.width, maxDimension);
              targetHeight = Math.round((targetWidth / img.width) * img.height);
            } else {
              // Portrait
              targetHeight = Math.min(img.height, maxDimension);
              targetWidth = Math.round((targetHeight / img.height) * img.width);
            }
          }
        } else {
          // Handle fixed aspect ratios
          // Determine target width based on resolution (never upscale)
          if (resolution === 'original') {
            targetWidth = Math.min(img.width, 1440); // Default max for original
          } else {
            targetWidth = Math.min(img.width, resolution);
          }

          // Calculate height based on aspect ratio
          switch (aspectRatio) {
            case '1:1':
              targetHeight = targetWidth; // Square
              break;
            case '4:3':
              targetHeight = Math.round((targetWidth * 3) / 4); // Landscape
              break;
            case '9:16':
              targetHeight = Math.round((targetWidth * 16) / 9); // Portrait/Vertical
              break;
            default:
              targetHeight = targetWidth;
          }
        }
        
        // Create canvas with target dimensions
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal membuat canvas context'));
          return;
        }

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Fill background with white (in case of transparency)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        if (aspectRatio === 'original') {
          // Draw image preserving aspect ratio (no crop)
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        } else {
          // Calculate scaling to cover the canvas (like CSS object-fit: cover)
          const imgAspectRatio = img.width / img.height;
          const targetAspectRatio = targetWidth / targetHeight;

          let drawWidth: number;
          let drawHeight: number;
          let offsetX: number = 0;
          let offsetY: number = 0;

          if (imgAspectRatio > targetAspectRatio) {
            // Image is wider than target - fit to height and crop sides
            drawHeight = targetHeight;
            drawWidth = img.width * (targetHeight / img.height);
            offsetX = (targetWidth - drawWidth) / 2;
          } else {
            // Image is taller than target - fit to width and crop top/bottom
            drawWidth = targetWidth;
            drawHeight = img.height * (targetWidth / img.width);
            offsetY = (targetHeight - drawHeight) / 2;
          }

          // Draw the image centered and scaled
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        }

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Gagal mengkonversi gambar'));
              return;
            }

            // Convert blob to Uint8Array
            const reader = new FileReader();
            reader.onload = () => {
              const arrayBuffer = reader.result as ArrayBuffer;
              const uint8Array = new Uint8Array(arrayBuffer) as Uint8Array<ArrayBuffer>;

              resolve({
                blob: uint8Array,
                aspectRatio: aspectRatio === 'original' ? 'original' : aspectRatio,
                fileSizeBytes: uint8Array.length,
                width: targetWidth,
                height: targetHeight,
              });
            };
            reader.onerror = () => {
              reject(new Error('Gagal membaca blob'));
            };
            reader.readAsArrayBuffer(blob);
          },
          'image/jpeg',
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Gagal memuat gambar'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Process an image file: resize to 9:16 aspect ratio and compress
 * Used for service images and gallery images (vertical format like Instagram stories/reels)
 * @param file - The image file to process
 * @param targetWidth - Target width in pixels (default: 1080px for good quality)
 * @param quality - JPEG quality 0-1 (default: 0.85 for good balance)
 * @returns Processed image data
 */
export async function processImageToVertical(
  file: File,
  targetWidth: number = 1080,
  quality: number = 0.85
): Promise<ProcessedImageData> {
  // Convert targetWidth to ResolutionChoice
  const resolution: ResolutionChoice = targetWidth === 720 ? 720 : targetWidth === 1440 ? 1440 : 1080;
  return processImageWithAspectRatio(file, '9:16', resolution, quality);
}

/**
 * Process an image file: preserve original aspect ratio with compression
 * Used for hero/banner images (horizontal format)
 * @param file - The image file to process
 * @param maxWidth - Maximum width in pixels (default: 1920px for full HD)
 * @param quality - JPEG quality 0-1 (default: 0.85 for good balance)
 * @returns Processed image data
 */
export async function processImagePreserveAspect(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.85
): Promise<ProcessedImageData> {
  // For preserve aspect, use 'original' resolution or closest match
  const resolution: ResolutionChoice = maxWidth <= 720 ? 720 : maxWidth <= 1080 ? 1080 : maxWidth <= 1440 ? 1440 : 'original';
  return processImageWithAspectRatio(file, 'original', resolution, quality);
}

/**
 * Validate image file type and size
 */
export function validateImageFile(file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipe file tidak valid. Gunakan JPEG, PNG, atau WebP.',
    };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB.`,
    };
  }
  
  return { valid: true };
}

/**
 * Validate image file type
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
}

/**
 * Validate image file size
 */
export function isValidImageSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
