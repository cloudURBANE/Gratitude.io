import QRCode from 'qrcode';

export interface QRCodeStyle {
  foregroundColor: string;
  backgroundColor: string;
  logoUrl?: string;
  cornerRadius: number;
  margin: number;
}

export interface QRGenerationOptions {
  size: number;
  style: QRCodeStyle;
  format: 'png' | 'svg';
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export class QRCodeGenerator {
  private static defaultOptions: QRGenerationOptions = {
    size: 512,
    style: {
      foregroundColor: '#10b981',
      backgroundColor: '#ffffff',
      cornerRadius: 8,
      margin: 4
    },
    format: 'png',
    errorCorrectionLevel: 'M'
  };

  static async generateQRCode(
    url: string, 
    options: Partial<QRGenerationOptions> = {}
  ): Promise<string> {
    const config = { ...this.defaultOptions, ...options };
    
    try {
      const qrOptions = {
        errorCorrectionLevel: config.errorCorrectionLevel,
        type: 'image/png' as const,
        quality: 0.92,
        margin: config.style.margin,
        color: {
          dark: config.style.foregroundColor,
          light: config.style.backgroundColor,
        },
        width: config.size,
      };

      if (config.format === 'svg') {
        return await QRCode.toString(url, { 
          ...qrOptions, 
          type: 'svg' as const 
        });
      }

      return await QRCode.toDataURL(url, qrOptions);
    } catch (error) {
      console.error('QR Code generation failed:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  static async generateTipPageQR(
    handle: string,
    customization?: {
      primaryColor?: string;
      backgroundColor?: string;
      size?: number;
    }
  ): Promise<string> {
    const baseUrl = window.location.origin;
    const tipPageUrl = `${baseUrl}/u/${handle}`;
    
    const options: Partial<QRGenerationOptions> = {
      size: customization?.size || 512,
      style: {
        foregroundColor: customization?.primaryColor || '#10b981',
        backgroundColor: customization?.backgroundColor || '#ffffff',
        cornerRadius: 8,
        margin: 4
      }
    };

    return this.generateQRCode(tipPageUrl, options);
  }

  static async generateBatchQRCodes(
    handles: string[],
    baseOptions: Partial<QRGenerationOptions> = {}
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    
    const promises = handles.map(async (handle) => {
      try {
        const qrCode = await this.generateTipPageQR(handle, {
          primaryColor: baseOptions.style?.foregroundColor,
          backgroundColor: baseOptions.style?.backgroundColor,
          size: baseOptions.size
        });
        results[handle] = qrCode;
      } catch (error) {
        console.error(`Failed to generate QR for handle ${handle}:`, error);
        results[handle] = '';
      }
    });

    await Promise.all(promises);
    return results;
  }

  static downloadQRCode(dataUrl: string, filename: string = 'tip-qr-code'): void {
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static async generatePrintableQRSheet(
    handle: string,
    count: number = 6,
    customization?: {
      primaryColor?: string;
      backgroundColor?: string;
      includeText?: boolean;
      businessName?: string;
    }
  ): Promise<string> {
    const qrCode = await this.generateTipPageQR(handle, {
      primaryColor: customization?.primaryColor,
      backgroundColor: customization?.backgroundColor,
      size: 300
    });

    // Create printable sheet with multiple QR codes
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // A4 dimensions at 150 DPI
    canvas.width = 1240;
    canvas.height = 1754;
    
    // White background
    ctx.fillStyle = customization?.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const qrSize = 200;
        const cols = 2;
        const rows = Math.ceil(count / cols);
        const marginX = (canvas.width - cols * qrSize) / (cols + 1);
        const marginY = 100;
        const spacingY = (canvas.height - 2 * marginY - rows * qrSize) / Math.max(rows - 1, 1);

        // Add title if business name provided
        if (customization?.businessName) {
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(customization.businessName, canvas.width / 2, 50);
        }

        // Draw QR codes in grid
        for (let i = 0; i < count; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = marginX + col * (qrSize + marginX);
          const y = marginY + row * (qrSize + spacingY);
          
          ctx.drawImage(img, x, y, qrSize, qrSize);
          
          // Add text below QR code if enabled
          if (customization?.includeText) {
            ctx.fillStyle = '#333333';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Scan to tip @${handle}`, x + qrSize / 2, y + qrSize + 20);
            ctx.fillText(`${window.location.origin}/u/${handle}`, x + qrSize / 2, y + qrSize + 40);
          }
        }
        
        resolve(canvas.toDataURL('image/png', 0.9));
      };
      img.src = qrCode;
    });
  }
}