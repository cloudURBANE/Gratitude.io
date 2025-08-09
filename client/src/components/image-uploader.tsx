import { useState, useRef } from "react";
import { Camera, Upload, X, Check } from "lucide-react";
import { motion } from "framer-motion";

interface ImageUploaderProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ImageUploader({ 
  currentImage, 
  onImageChange, 
  placeholder = "Upload Image",
  size = 'md' 
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      onImageChange(imageUrl);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative inline-block">
      {/* Main Upload Area */}
      <div
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          ${sizeClasses[size]} relative cursor-pointer rounded-full overflow-hidden
          border-2 border-dashed border-gray-600 hover:border-green-500 transition-all
          ${isDragging ? 'border-green-400 bg-green-500/10' : ''}
          ${currentImage ? 'border-solid border-green-500/40' : ''}
        `}
      >
        {currentImage ? (
          <img 
            src={currentImage} 
            alt="Uploaded" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            {isUploading ? (
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-gray-400" />
            )}
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="text-center text-white">
            <Camera className="w-6 h-6 mx-auto mb-1" />
            <div className="text-xs font-medium">
              {currentImage ? 'Change' : 'Upload'}
            </div>
          </div>
        </div>
      </div>

      {/* Camera Icon Badge */}
      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
        <Camera className="w-3 h-3 text-white" />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Drag overlay */}
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-green-500/20 flex items-center justify-center pointer-events-none"
        >
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold">
            Drop image here
          </div>
        </motion.div>
      )}
    </div>
  );
}