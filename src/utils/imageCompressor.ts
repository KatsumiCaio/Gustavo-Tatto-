/**
 * Utility to compress uploaded images or base64 strings so they take up minimal space
 * and avoid LocalStorage / IndexedDB quota issues.
 */
export async function compressImage(
  input: File | string,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();

    const handleLoad = () => {
      let width = img.width;
      let height = img.height;

      // Calculate aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback if canvas context isn't available
        resolve(typeof input === 'string' ? input : '');
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to compressed JPEG base64
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };

    const handleError = () => {
      // Return raw input string or empty if failed
      resolve(typeof input === 'string' ? input : '');
    };

    img.onload = handleLoad;
    img.onerror = handleError;

    if (input instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = handleError;
      reader.readAsDataURL(input);
    } else {
      img.src = input;
    }
  });
}
