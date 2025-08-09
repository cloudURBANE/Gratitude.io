import { useState, useEffect } from "react";
import { QrCode, Download, RefreshCw, Copy, Check, Palette, Grid, Printer, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { QRCodeGenerator } from "@/lib/qr-generator";
import GlassCard from "./glass-card";
import GradientButton from "./gradient-button";

interface QRCodeManagerProps {
  handle: string;
  workerName?: string;
  onQRGenerated?: (qrCode: string) => void;
}

interface QRCustomization {
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  margin: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export default function QRCodeManager({ handle, workerName, onQRGenerated }: QRCodeManagerProps) {
  const [qrCode, setQRCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customization, setCustomization] = useState<QRCustomization>({
    foregroundColor: '#10b981',
    backgroundColor: '#ffffff',
    size: 512,
    margin: 4,
    errorCorrectionLevel: 'M'
  });
  const { toast } = useToast();

  // Load existing QR code on mount
  useEffect(() => {
    loadQRCode();
  }, [handle]);

  const loadQRCode = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest("GET", `/api/qr/${handle}`);
      const data = await response.json();
      
      if (data.success) {
        setQRCode(data.qrCode);
        onQRGenerated?.(data.qrCode);
      }
    } catch (error) {
      console.error('Failed to load QR code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async (options?: Partial<QRCustomization>) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/qr/generate", {
        handle,
        options: options || customization
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQRCode(data.qrCode);
        onQRGenerated?.(data.qrCode);
        toast({
          title: "QR Code Generated!",
          description: `QR code for @${handle} is ready to share`,
        });
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Could not generate QR code",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = (format: 'single' | 'sheet' = 'single') => {
    if (!qrCode) return;

    if (format === 'single') {
      QRCodeGenerator.downloadQRCode(qrCode, `tipvault-${handle}-qr`);
      toast({
        title: "Downloaded!",
        description: "QR code saved to your downloads",
      });
    } else {
      generatePrintableSheet();
    }
  };

  const generatePrintableSheet = async () => {
    try {
      setIsLoading(true);
      const sheet = await QRCodeGenerator.generatePrintableQRSheet(handle, 6, {
        primaryColor: customization.foregroundColor,
        backgroundColor: customization.backgroundColor,
        includeText: true,
        businessName: workerName
      });

      const link = document.createElement('a');
      link.download = `tipvault-${handle}-sheet.png`;
      link.href = sheet;
      link.click();

      toast({
        title: "Print Sheet Ready!",
        description: "Printable QR sheet downloaded",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Could not create print sheet",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!qrCode) return;
    
    try {
      // Convert data URL to blob for clipboard
      const response = await fetch(qrCode);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Copied!",
        description: "QR code copied to clipboard",
      });
    } catch (error) {
      // Fallback to copying the URL
      const tipUrl = `${window.location.origin}/u/${handle}`;
      await navigator.clipboard.writeText(tipUrl);
      
      toast({
        title: "URL Copied!",
        description: "Tip page URL copied to clipboard",
      });
    }
  };

  const presetColors = [
    { name: 'Green', fg: '#10b981', bg: '#ffffff' },
    { name: 'Blue', fg: '#3b82f6', bg: '#ffffff' },
    { name: 'Purple', fg: '#8b5cf6', bg: '#ffffff' },
    { name: 'Black', fg: '#000000', bg: '#ffffff' },
    { name: 'Dark Mode', fg: '#ffffff', bg: '#1f2937' },
  ];

  return (
    <GlassCard className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <QrCode className="w-6 h-6 text-green-400" />
            <div>
              <h3 className="text-xl font-bold text-white">QR Code Manager</h3>
              <p className="text-gray-400">Generate and customize your tip QR code</p>
            </div>
          </div>
          <button
            onClick={() => setShowCustomization(!showCustomization)}
            className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* QR Code Display */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/2">
            <div className="aspect-square bg-white rounded-2xl p-4 flex items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-600">Generating QR code...</p>
                </div>
              ) : qrCode ? (
                <motion.img
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  src={qrCode}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <QrCode className="w-16 h-16 mx-auto mb-4" />
                  <p>Click "Generate QR Code" to create your tip QR code</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <GradientButton
                onClick={() => generateQRCode()}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                {qrCode ? 'Regenerate' : 'Generate'} QR Code
              </GradientButton>

              {qrCode && (
                <>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors text-sm"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>

                  <button
                    onClick={() => downloadQRCode('single')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>

                  <button
                    onClick={() => downloadQRCode('sheet')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors text-sm"
                  >
                    <Printer className="w-4 h-4" />
                    Print Sheet
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Customization Panel */}
          {showCustomization && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-1/2 space-y-4"
            >
              <h4 className="text-lg font-semibold text-white mb-4">Customization</h4>

              {/* Color Presets */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Color Presets</label>
                <div className="flex flex-wrap gap-2">
                  {presetColors.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setCustomization(prev => ({
                          ...prev,
                          foregroundColor: preset.fg,
                          backgroundColor: preset.bg
                        }));
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors text-sm text-white"
                    >
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ 
                          backgroundColor: preset.bg,
                          border: `2px solid ${preset.fg}`
                        }}
                      />
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Foreground Color</label>
                  <input
                    type="color"
                    value={customization.foregroundColor}
                    onChange={(e) => setCustomization(prev => ({ ...prev, foregroundColor: e.target.value }))}
                    className="w-full h-10 rounded-lg border border-gray-600 bg-gray-700"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Background Color</label>
                  <input
                    type="color"
                    value={customization.backgroundColor}
                    onChange={(e) => setCustomization(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-full h-10 rounded-lg border border-gray-600 bg-gray-700"
                  />
                </div>
              </div>

              {/* Size Slider */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Size: {customization.size}px
                </label>
                <input
                  type="range"
                  min="256"
                  max="1024"
                  step="64"
                  value={customization.size}
                  onChange={(e) => setCustomization(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              {/* Error Correction Level */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Error Correction</label>
                <select
                  value={customization.errorCorrectionLevel}
                  onChange={(e) => setCustomization(prev => ({ ...prev, errorCorrectionLevel: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>

              {/* Apply Button */}
              <GradientButton
                onClick={() => generateQRCode(customization)}
                disabled={isLoading}
                className="w-full py-3"
              >
                Apply Customization
              </GradientButton>
            </motion.div>
          )}
        </div>

        {/* QR Code Info */}
        {qrCode && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <QrCode className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-400">QR Code Ready!</h4>
                <p className="text-sm text-gray-300 mt-1">
                  Your QR code links to: <code className="bg-gray-700/50 px-2 py-1 rounded text-green-400">
                    {window.location.origin}/u/{handle}
                  </code>
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Print it, share it, or display it anywhere customers can scan it!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}