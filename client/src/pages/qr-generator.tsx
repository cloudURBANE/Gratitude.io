import { useState, useRef } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import GlassCard from "@/components/glass-card";
import GradientButton from "@/components/gradient-button";

interface Worker {
  id: string;
  name: string;
  role: string;
  handle: string;
}

interface QRData {
  qrCode: string;
  url: string;
}

export default function QRGenerator() {
  const { handle } = useParams<{ handle: string }>();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [selectedStyle, setSelectedStyle] = useState<'modern' | 'classic' | 'branded'>('modern');

  const { data: worker } = useQuery<Worker>({
    queryKey: ["/api/workers", handle],
    enabled: !!handle && handle !== 'demo',
  });

  const { data: qrData } = useQuery<QRData>({
    queryKey: ["/api/workers", handle, "qr"],
    enabled: !!handle,
  });

  // Demo data for 'demo' handle
  const demoWorker: Worker = {
    id: 'demo-id',
    name: 'Jordan M.',
    role: 'Barista & Shift Lead',
    handle: 'demo',
  };

  const displayWorker = handle === 'demo' ? demoWorker : worker;

  const sizeOptions = [
    { value: 'small', label: 'Small (256px)', size: 256 },
    { value: 'medium', label: 'Medium (512px)', size: 512 },
    { value: 'large', label: 'Large (1024px)', size: 1024 },
  ];

  const styleOptions = [
    { value: 'modern', label: 'Modern Glass', description: 'Dark theme with glass effect' },
    { value: 'classic', label: 'Classic Black', description: 'Traditional black & white' },
    { value: 'branded', label: 'Branded Colors', description: 'Purple gradient theme' },
  ];

  const handleDownloadQR = () => {
    if (!qrData) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const selectedSizeOption = sizeOptions.find(s => s.value === selectedSize);
    const size = selectedSizeOption?.size || 512;

    canvas.width = size;
    canvas.height = size + 100; // Extra space for text

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    if (selectedStyle === 'modern') {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0B0B0F');
      gradient.addColorStop(1, '#1A1A24');
      ctx.fillStyle = gradient;
    } else if (selectedStyle === 'branded') {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#8B5CF6');
      gradient.addColorStop(1, '#06B6D4');
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = '#FFFFFF';
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load and draw QR code
    const img = new Image();
    img.onload = () => {
      const qrSize = size - 40; // Padding
      const qrX = (size - qrSize) / 2;
      const qrY = 20;

      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

      // Add text
      const textY = qrY + qrSize + 30;
      ctx.textAlign = 'center';
      
      // Worker name
      ctx.fillStyle = selectedStyle === 'classic' ? '#000000' : '#FFFFFF';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillText(displayWorker?.name || 'TipLink', size / 2, textY);
      
      // Role
      ctx.font = '16px Inter, sans-serif';
      ctx.fillStyle = selectedStyle === 'classic' ? '#666666' : '#CCCCCC';
      ctx.fillText(displayWorker?.role || 'Service Worker', size / 2, textY + 25);

      // URL
      ctx.font = '14px monospace';
      ctx.fillText(qrData.url, size / 2, textY + 50);

      // Download
      const link = document.createElement('a');
      link.download = `tiplink-qr-${handle}-${selectedSize}.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast({
        title: "QR Code downloaded!",
        description: `Downloaded ${selectedSize} QR code with ${selectedStyle} style.`,
      });
    };
    img.src = qrData.qrCode;
  };

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !qrData) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>TipLink QR Code - ${displayWorker?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin: 40px; }
            .qr-container { display: inline-block; padding: 20px; border: 2px dashed #ccc; }
            .qr-code { max-width: 300px; height: auto; }
            .worker-info { margin-top: 20px; }
            .worker-name { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
            .worker-role { font-size: 16px; color: #666; margin-bottom: 12px; }
            .tip-url { font-size: 14px; font-family: monospace; }
            .instructions { margin-top: 30px; font-size: 14px; color: #888; }
            @media print {
              body { margin: 0; }
              .instructions { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <img src="${qrData.qrCode}" alt="TipLink QR Code" class="qr-code" />
            <div class="worker-info">
              <div class="worker-name">${displayWorker?.name || 'TipLink'}</div>
              <div class="worker-role">${displayWorker?.role || 'Service Worker'}</div>
              <div class="tip-url">${qrData.url}</div>
            </div>
          </div>
          <div class="instructions">
            <p>Scan this QR code to send a tip quickly and securely!</p>
            <p>Cut along the dashed line for easy placement.</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();

    toast({
      title: "QR Code ready to print!",
      description: "Print dialog opened. Perfect for table tents or wall display.",
    });
  };

  const handleCopyLink = () => {
    if (!qrData) return;
    
    navigator.clipboard.writeText(qrData.url).then(() => {
      toast({
        title: "Link copied!",
        description: "Tip page URL copied to clipboard.",
      });
    });
  };

  const handleShare = () => {
    if (!qrData || !displayWorker) return;

    if (navigator.share) {
      navigator.share({
        title: `Tip ${displayWorker.name}`,
        text: `Send a tip to ${displayWorker.name} - ${displayWorker.role}`,
        url: qrData.url,
      });
    } else {
      handleCopyLink();
    }
  };

  if (!displayWorker || !qrData) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-accent-start border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent-start rounded-full filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent-end rounded-full filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '-3s' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">QR Code Generator</h1>
          <p className="text-text-secondary">Create customized QR codes for your tip page</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Preview */}
          <GlassCard className="p-8">
            <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">Preview</h2>
            
            <div className="text-center mb-6">
              <div className="inline-block p-6 bg-white rounded-xl shadow-lg">
                <img 
                  src={qrData.qrCode} 
                  alt="QR Code"
                  className="w-64 h-64 mx-auto"
                />
                <div className="mt-4">
                  <div className="font-semibold text-gray-800">{displayWorker.name}</div>
                  <div className="text-sm text-gray-600">{displayWorker.role}</div>
                  <div className="text-xs text-gray-500 font-mono mt-2">{qrData.url}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <GradientButton onClick={handleDownloadQR} className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Download
              </GradientButton>

              <button 
                onClick={handlePrintQR}
                className="flex items-center justify-center gap-2 py-3 px-4 glass-card hover:bg-glass-border rounded-xl text-text-primary transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                </svg>
                Print
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <button 
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 py-3 px-4 glass-card hover:bg-glass-border rounded-xl text-text-primary transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                Copy Link
              </button>

              <button 
                onClick={handleShare}
                className="flex items-center justify-center gap-2 py-3 px-4 glass-card hover:bg-glass-border rounded-xl text-text-primary transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                </svg>
                Share
              </button>
            </div>
          </GlassCard>

          {/* Customization Options */}
          <div className="space-y-6">
            {/* Size Selection */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Size Options</h3>
              <div className="space-y-3">
                {sizeOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="size"
                      value={option.value}
                      checked={selectedSize === option.value}
                      onChange={(e) => setSelectedSize(e.target.value as any)}
                      className="text-accent-start focus:ring-accent-start"
                    />
                    <span className="text-text-primary">{option.label}</span>
                  </label>
                ))}
              </div>
            </GlassCard>

            {/* Style Selection */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Style Options</h3>
              <div className="space-y-4">
                {styleOptions.map((option) => (
                  <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="style"
                      value={option.value}
                      checked={selectedStyle === option.value}
                      onChange={(e) => setSelectedStyle(e.target.value as any)}
                      className="text-accent-start focus:ring-accent-start mt-1"
                    />
                    <div>
                      <div className="text-text-primary font-medium">{option.label}</div>
                      <div className="text-sm text-text-secondary">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </GlassCard>

            {/* Usage Tips */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Placement Tips</h3>
              <div className="space-y-3 text-sm text-text-secondary">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-accent-start rounded-full mt-2 flex-shrink-0"></div>
                  <span>Place at eye level near the register for maximum visibility</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-accent-end rounded-full mt-2 flex-shrink-0"></div>
                  <span>Table tents work great for restaurants and cafes</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <span>Add to receipts or business cards for repeated exposure</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Share on social media to reach more customers</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Hidden canvas for generating custom QR codes */}
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      </div>
    </div>
  );
}