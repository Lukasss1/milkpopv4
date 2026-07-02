import React, { useRef } from 'react';
import { Image as ImageIcon, Upload } from 'lucide-react';

interface ImageUploadInlineProps {
  currentImageUrl: string;
  onImageChange: (dataUrl: string) => void;
  className?: string;
  imgClassName?: string;
}

export const ImageUploadInline: React.FC<ImageUploadInlineProps> = ({ currentImageUrl, onImageChange, className = '', imgClassName = '' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageChange(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`relative group overflow-hidden ${className}`}>
      {currentImageUrl ? (
        <img src={currentImageUrl} className={imgClassName} alt="Uploaded preview" />
      ) : (
        <div className={`flex items-center justify-center bg-gray-200 text-gray-400 ${imgClassName}`}>
          <ImageIcon className="h-8 w-8" />
        </div>
      )}
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="absolute inset-0 bg-indigo-900/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
      >
        <Upload className="h-8 w-8 mb-2" />
        <span className="text-xs font-bold uppercase tracking-wider">Change Image</span>
      </div>
      
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />
    </div>
  );
};
