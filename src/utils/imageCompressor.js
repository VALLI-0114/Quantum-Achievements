/**
 * Image Compression Utility
 * Resizes and compresses image files into lightweight Base64/data URLs
 * (~30-70KB max) to ensure fast, reliable Supabase cloud storage without payload bottlenecks.
 * Always fills white background to ensure transparent PNGs and scans never turn black.
 */

export const compressImageFile = (file, maxWidth = 1200, quality = 0.82) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return resolve(null);
    }

    // If not an image (e.g. PDF), handle directly
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type || 'application/pdf',
          dataUrl: e.target.result
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Calculate proportional dimensions
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type,
          dataUrl: img.src
        });
      }

      // Fill clean solid white background so transparent PNGs and scans never turn black
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Export as JPEG with quality compression
      const mimeType = 'image/jpeg';
      const compressedDataUrl = canvas.toDataURL(mimeType, quality);
      const approxSizeBytes = Math.round((compressedDataUrl.length * 3) / 4);

      resolve({
        name: file.name.replace(/\.[^/.]+$/, "") + ".jpg",
        size: (approxSizeBytes / 1024).toFixed(1) + ' KB',
        type: mimeType,
        dataUrl: compressedDataUrl
      });
    };

    img.onerror = () => {
      // Fallback to basic file reader
      const basicReader = new FileReader();
      basicReader.onload = (ev) => {
        resolve({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type,
          dataUrl: ev.target.result
        });
      };
      basicReader.onerror = (err) => reject(err);
      basicReader.readAsDataURL(file);
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};
