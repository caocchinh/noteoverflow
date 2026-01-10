/**
 * Image validation and processing utilities for Cloudflare Workers
 * Uses native Web APIs instead of WASM for compatibility
 */

/**
 * Image format magic numbers (file signatures)
 * https://en.wikipedia.org/wiki/List_of_file_signatures
 */
const IMAGE_SIGNATURES = {
  JPEG: [0xff, 0xd8, 0xff],
  PNG: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  GIF_87a: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
  GIF_89a: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  WEBP: [0x52, 0x49, 0x46, 0x46], // RIFF header, WebP specific check at offset 8
  BMP: [0x42, 0x4d],
} as const;

/**
 * Check if bytes match a signature
 */
function matchesSignature(
  bytes: Uint8Array,
  signature: readonly number[]
): boolean {
  if (bytes.length < signature.length) return false;
  return signature.every((byte, index) => bytes[index] === byte);
}

/**
 * Validate image format using magic numbers
 * @param imageBytes - Raw image bytes
 * @returns true if valid image format detected
 */
export function validateImageFormat(imageBytes: Uint8Array): boolean {
  if (!imageBytes || imageBytes.length < 8) {
    return false;
  }

  // Check JPEG
  if (matchesSignature(imageBytes, IMAGE_SIGNATURES.JPEG)) {
    return true;
  }

  // Check PNG
  if (matchesSignature(imageBytes, IMAGE_SIGNATURES.PNG)) {
    return true;
  }

  // Check GIF
  if (
    matchesSignature(imageBytes, IMAGE_SIGNATURES.GIF_87a) ||
    matchesSignature(imageBytes, IMAGE_SIGNATURES.GIF_89a)
  ) {
    return true;
  }

  // Check WebP (RIFF container with WEBP at offset 8)
  if (matchesSignature(imageBytes, IMAGE_SIGNATURES.WEBP)) {
    const webpSignature = [0x57, 0x45, 0x42, 0x50]; // "WEBP"
    if (imageBytes.length >= 12) {
      const isWebP = webpSignature.every(
        (byte, index) => imageBytes[8 + index] === byte
      );
      if (isWebP) return true;
    }
  }

  // Check BMP
  if (matchesSignature(imageBytes, IMAGE_SIGNATURES.BMP)) {
    return true;
  }

  return false;
}

/**
 * Convert base64 string to Uint8Array
 * @param base64 - Base64 encoded string
 * @returns Decoded bytes
 */
export function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Read a 16-bit big-endian integer from bytes
 */
function readUint16BE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

/**
 * Read a 32-bit big-endian integer from bytes
 */
function readUint32BE(bytes: Uint8Array, offset: number): number {
  return (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  );
}

/**
 * Read a 16-bit little-endian integer from bytes
 */
function readUint16LE(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

/**
 * Read a 32-bit little-endian integer from bytes
 */
function readUint32LE(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  );
}

/**
 * Extract dimensions from PNG header
 * PNG stores width at bytes 16-19 and height at bytes 20-23 (big-endian)
 */
function getPngDimensions(
  bytes: Uint8Array
): { width: number; height: number } | null {
  if (bytes.length < 24) return null;
  const width = readUint32BE(bytes, 16);
  const height = readUint32BE(bytes, 20);
  return { width, height };
}

/**
 * Extract dimensions from GIF header
 * GIF stores width at bytes 6-7 and height at bytes 8-9 (little-endian)
 */
function getGifDimensions(
  bytes: Uint8Array
): { width: number; height: number } | null {
  if (bytes.length < 10) return null;
  const width = readUint16LE(bytes, 6);
  const height = readUint16LE(bytes, 8);
  return { width, height };
}

/**
 * Extract dimensions from BMP header
 * BMP stores width at bytes 18-21 and height at bytes 22-25 (little-endian, signed)
 */
function getBmpDimensions(
  bytes: Uint8Array
): { width: number; height: number } | null {
  if (bytes.length < 26) return null;
  const width = readUint32LE(bytes, 18);
  let height = readUint32LE(bytes, 22);
  // Height can be negative for top-down bitmaps
  if (height > 0x7fffffff) {
    height = -(height - 0x100000000);
  }
  return { width, height: Math.abs(height) };
}

/**
 * Extract dimensions from WebP header
 * WebP VP8/VP8L/VP8X chunks contain dimension info
 */
function getWebpDimensions(
  bytes: Uint8Array
): { width: number; height: number } | null {
  if (bytes.length < 30) return null;

  // Check for VP8X (extended)
  if (
    bytes[12] === 0x56 &&
    bytes[13] === 0x50 &&
    bytes[14] === 0x38 &&
    bytes[15] === 0x58
  ) {
    // VP8X: width at 24-26 (24-bit LE + 1), height at 27-29 (24-bit LE + 1)
    const width = (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16)) + 1;
    const height = (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16)) + 1;
    return { width, height };
  }

  // Check for VP8L (lossless)
  if (
    bytes[12] === 0x56 &&
    bytes[13] === 0x50 &&
    bytes[14] === 0x38 &&
    bytes[15] === 0x4c
  ) {
    // VP8L: dimensions encoded in first 4 bytes after signature
    if (bytes.length < 25) return null;
    const bits = readUint32LE(bytes, 21);
    const width = (bits & 0x3fff) + 1;
    const height = ((bits >> 14) & 0x3fff) + 1;
    return { width, height };
  }

  // Check for VP8 (lossy)
  if (
    bytes[12] === 0x56 &&
    bytes[13] === 0x50 &&
    bytes[14] === 0x38 &&
    bytes[15] === 0x20
  ) {
    // VP8: find frame header (starts with 0x9d 0x01 0x2a)
    for (let i = 20; i < Math.min(bytes.length - 10, 100); i++) {
      if (bytes[i] === 0x9d && bytes[i + 1] === 0x01 && bytes[i + 2] === 0x2a) {
        const width = readUint16LE(bytes, i + 3) & 0x3fff;
        const height = readUint16LE(bytes, i + 5) & 0x3fff;
        return { width, height };
      }
    }
  }

  return null;
}

/**
 * Extract dimensions from JPEG header
 * JPEG stores dimensions in SOF0/SOF2 markers
 */
function getJpegDimensions(
  bytes: Uint8Array
): { width: number; height: number } | null {
  if (bytes.length < 4) return null;

  let offset = 2; // Skip SOI marker

  while (offset < bytes.length - 8) {
    // Check for marker
    if (bytes[offset] !== 0xff) {
      offset++;
      continue;
    }

    const marker = bytes[offset + 1];

    // Skip padding
    if (marker === 0xff) {
      offset++;
      continue;
    }

    // SOF markers (Start Of Frame) contain dimensions
    // SOF0 (0xC0), SOF1 (0xC1), SOF2 (0xC2), SOF3 (0xC3)
    if (marker >= 0xc0 && marker <= 0xc3) {
      if (offset + 9 > bytes.length) return null;
      const height = readUint16BE(bytes, offset + 5);
      const width = readUint16BE(bytes, offset + 7);
      return { width, height };
    }

    // Skip other markers
    if (marker === 0xd8 || marker === 0xd9) {
      // SOI or EOI - no length
      offset += 2;
    } else if (marker >= 0xd0 && marker <= 0xd7) {
      // RST markers - no length
      offset += 2;
    } else {
      // Read segment length
      if (offset + 4 > bytes.length) return null;
      const length = readUint16BE(bytes, offset + 2);
      offset += 2 + length;
    }
  }

  return null;
}

/**
 * Get image dimensions by parsing image file headers
 * Pure JavaScript implementation - works in Cloudflare Workers
 * @param imageBytes - Raw image bytes
 * @returns Width and height, or null if extraction fails
 */
export function getImageDimensionsFromBytes(
  imageBytes: Uint8Array
): { width: number; height: number } | null {
  try {
    if (!imageBytes || imageBytes.length < 8) {
      return null;
    }

    // PNG
    if (matchesSignature(imageBytes, IMAGE_SIGNATURES.PNG)) {
      return getPngDimensions(imageBytes);
    }

    // JPEG
    if (matchesSignature(imageBytes, IMAGE_SIGNATURES.JPEG)) {
      return getJpegDimensions(imageBytes);
    }

    // GIF
    if (
      matchesSignature(imageBytes, IMAGE_SIGNATURES.GIF_87a) ||
      matchesSignature(imageBytes, IMAGE_SIGNATURES.GIF_89a)
    ) {
      return getGifDimensions(imageBytes);
    }

    // WebP
    if (matchesSignature(imageBytes, IMAGE_SIGNATURES.WEBP)) {
      const webpSignature = [0x57, 0x45, 0x42, 0x50];
      if (imageBytes.length >= 12) {
        const isWebP = webpSignature.every(
          (byte, index) => imageBytes[8 + index] === byte
        );
        if (isWebP) {
          return getWebpDimensions(imageBytes);
        }
      }
    }

    // BMP
    if (matchesSignature(imageBytes, IMAGE_SIGNATURES.BMP)) {
      return getBmpDimensions(imageBytes);
    }

    return null;
  } catch (error) {
    console.error("Failed to extract image dimensions:", error);
    return null;
  }
}

/**
 * Get image dimensions from a URL
 * @param imageUrl - URL of the image
 * @returns Width and height, or null if extraction fails
 */
export async function getImageDimensionsFromUrl(
  imageUrl: string
): Promise<{ width: number; height: number } | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to fetch image: ${imageUrl} - ${response.status}`);
      return null;
    }

    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    return getImageDimensionsFromBytes(bytes);
  } catch (error) {
    console.error(`Error fetching image dimensions for ${imageUrl}:`, error);
    return null;
  }
}
