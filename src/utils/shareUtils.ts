/**
 * Utility functions for sharing and exporting outfits
 * COPPA-compliant: No personal data, anonymous sharing only
 */

/**
 * Capture the 3D canvas as a data URL
 */
export async function captureCanvasToDataUrl(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' = 'png',
  quality = 0.92
): Promise<string> {
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  return canvas.toDataURL(mimeType, quality);
}

/**
 * Convert data URL to Blob for file saving
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Download an image to the user's device
 */
export async function downloadImage(
  dataUrl: string,
  filename: string
): Promise<void> {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copy image to clipboard (where supported)
 */
export async function copyImageToClipboard(dataUrl: string): Promise<boolean> {
  try {
    const blob = dataUrlToBlob(dataUrl);
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ]);
    return true;
  } catch {
    console.warn('Clipboard API not supported or permission denied');
    return false;
  }
}

/**
 * Share image using Web Share API (mobile-friendly)
 */
export async function shareImage(
  dataUrl: string,
  title: string,
  text?: string
): Promise<boolean> {
  if (!navigator.share || !navigator.canShare) {
    return false;
  }

  try {
    const blob = dataUrlToBlob(dataUrl);
    const file = new File([blob], `${title}.png`, { type: 'image/png' });

    const shareData: ShareData = {
      title,
      text: text || 'Check out my outfit from StyleSpace!',
      files: [file]
    };

    if (navigator.canShare(shareData)) {
      await navigator.share(shareData);
      return true;
    }
    return false;
  } catch (error) {
    // User cancelled or share failed
    console.warn('Share failed:', error);
    return false;
  }
}

/**
 * Check if Web Share API is available
 */
export function canShare(): boolean {
  return typeof navigator.share === 'function';
}

/**
 * Check if clipboard API is available
 */
export function canCopyToClipboard(): boolean {
  return typeof navigator.clipboard?.write === 'function';
}

/**
 * Add a watermark/branding to the image
 */
export async function addWatermark(
  dataUrl: string,
  text = 'Made with StyleSpace ✨'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Add watermark
      const fontSize = Math.max(16, img.width / 30);
      ctx.font = `bold ${fontSize}px Nunito, sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 2;

      const padding = fontSize;
      const x = padding;
      const y = img.height - padding;

      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

/**
 * Resize image while maintaining aspect ratio
 */
export async function resizeImage(
  dataUrl: string,
  maxWidth: number,
  maxHeight: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

/**
 * Generate a unique anonymous ID for sharing
 * No personal data - just a random string
 */
export function generateAnonymousId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create shareable outfit data (COPPA-compliant, no personal info)
 */
export interface ShareableOutfit {
  id: string;
  name: string;
  thumbnail: string;
  createdAt: number;
  votes: number;
  tags: string[];
}

export function createShareableOutfit(
  name: string,
  thumbnail: string,
  tags: string[] = []
): ShareableOutfit {
  return {
    id: generateAnonymousId(),
    name,
    thumbnail,
    createdAt: Date.now(),
    votes: 0,
    tags
  };
}
