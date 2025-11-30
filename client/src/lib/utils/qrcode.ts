/**
 * QR Code utility functions
 */

import QRCode from 'qrcode';

/**
 * Generate QR code as data URL (base64)
 * @param text - Text to encode in QR code
 * @param options - QR code options
 * @returns Promise that resolves to base64 data URL
 */
export async function generateQRCodeDataURL(
  text: string,
  options?: {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }
): Promise<string> {
  try {
    const defaultOptions = {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      ...options,
    };

    const dataURL = await QRCode.toDataURL(text, defaultOptions);
    return dataURL;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw error;
  }
}

/**
 * Generate QR code as SVG string
 * @param text - Text to encode in QR code
 * @param options - QR code options
 * @returns Promise that resolves to SVG string
 */
export async function generateQRCodeSVG(
  text: string,
  options?: {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }
): Promise<string> {
  try {
    const defaultOptions = {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      ...options,
    };

    const svg = await QRCode.toString(text, {
      type: 'svg',
      ...defaultOptions,
    });
    return svg;
  } catch (error) {
    console.error('Failed to generate QR code SVG:', error);
    throw error;
  }
}

/**
 * Download QR code as image
 * @param dataURL - Base64 data URL of QR code
 * @param filename - Filename for download (default: 'qrcode.png')
 */
export function downloadQRCode(dataURL: string, filename = 'qrcode.png') {
  try {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to download QR code:', error);
    throw error;
  }
}

