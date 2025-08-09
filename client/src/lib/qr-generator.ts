export const generateQRCode = async (data: string, size = 256): Promise<string> => {
  try {
    // Using a QR code API service for simplicity
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&color=0B0B0F&bgcolor=FFFFFF`;
    return qrUrl;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    return '';
  }
};

export const generateTipLinkQR = async (handle: string, size = 256): Promise<string> => {
  const tipUrl = `${window.location.origin}/u/${handle}`;
  return generateQRCode(tipUrl, size);
};
