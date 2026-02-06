/**
 * Image processing utility for resizing and compressing images
 * Supports multiple aspect ratios: 1:1 (square), 4:3 (landscape), 9:16 (portrait/vertical)
 */

export interface ProcessedImageData {
  blob: Uint8Array<ArrayBuffer>;
  aspectRatio: string;
  fileSizeBytes: number;
  width: number;
  height: number;
}

type AspectRatioChoice = '1:1' | '4:3' | '9:16';

/**
 * Process an image file with selected aspect ratio and compress
 * @param file - The image file to process
 * @param aspectRatio - Target aspect ratio ('1:1', '4:3', or '9:16')
 * @param targetWidth - Target width in pixels (default: 1080px for good quality)
 * @param quality - JPEG quality 0-1 (default: 0.85 for good balance)
 * @returns Processed image data
 */
export async function processImageWithAspectRatio(
  file: File,
  aspectRatio: AspectRatioChoice,
  targetWidth: number = 1080,
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
        // Calculate dimensions based on aspect ratio
        let targetHeight: number;
        
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
            targetHeight = Math.round((targetWidth * 16) / 9);
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

        // Fill background with white (in case of transparency)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // Draw the image centered and scaled
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

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
                aspectRatio,
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
  return processImageWithAspectRatio(file, '9:16', targetWidth, quality);
}

/**
 * Process an image file: preserve original aspect ratio with compression
 * Used for hero/banner images (horizontal format)
 * @param file - The image file to process
 * @param maxWidth - Maximum width in pixels (default: 1920px for full HD)
 * @param quality - JPEG quality 0-1 (default: 0.90 for high quality)
 * @returns Processed image data
 */
export async function processImagePreserveAspect(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.90
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
        // Calculate dimensions preserving aspect ratio
        let targetWidth = img.width;
        let targetHeight = img.height;

        // Only resize if image is larger than maxWidth
        if (targetWidth > maxWidth) {
          const aspectRatio = img.width / img.height;
          targetWidth = maxWidth;
          targetHeight = Math.round(maxWidth / aspectRatio);
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

        // Draw the image scaled to fit (preserves aspect ratio)
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Calculate aspect ratio string
        const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(targetWidth, targetHeight);
        const aspectRatio = `${targetWidth / divisor}:${targetHeight / divisor}`;

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
                aspectRatio,
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
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File harus berupa gambar (JPG, PNG, GIF, dll)' };
  }

  // Check file size (max 10MB for original file)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Ukuran file maksimal 10MB' };
  }

  return { valid: true };
}
