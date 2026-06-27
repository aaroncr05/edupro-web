'use client';

import { useState } from 'react';
import { Upload, Link as LinkIcon, CheckCircle, AlertCircle, X } from 'lucide-react';

interface ImageInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  preview?: boolean;
  description?: string;
}

export function ImageInput({ 
  value, 
  onChange, 
  label = 'Imagen',
  placeholder = 'Sube una imagen o pega una URL',
  preview = true,
  description
}: ImageInputProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string>(value);
  const [error, setError] = useState<string>('');

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setError('Por favor, selecciona una imagen válida');
        return;
      }
      // Validate file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('La imagen no debe exceder 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setPreviewUrl(base64);
        onChange(base64);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Handle URL input
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPreviewUrl(url);
    onChange(url);
    setError('');
  };

  // Clear selection
  const handleClear = () => {
    setPreviewUrl('');
    onChange('');
    setError('');
  };

  return (
    <div className="space-y-4">
      {label && (
        <div>
          <label className="block text-sm font-semibold text-slate-900">{label}</label>
          {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
        </div>
      )}

      {/* Mode Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
        <button
          onClick={() => {
            setMode('upload');
          }}
          className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all ${
            mode === 'upload'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="h-4 w-4 inline mr-2" />
          Subir
        </button>
        <button
          onClick={() => setMode('url')}
          className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all ${
            mode === 'url'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LinkIcon className="h-4 w-4 inline mr-2" />
          URL
        </button>
      </div>

      {/* Upload Mode */}
      {mode === 'upload' && (
        <label className="block border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-slate-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="space-y-2">
            <Upload className="h-8 w-8 text-slate-400 mx-auto" />
            <div>
              <p className="text-sm font-medium text-slate-900">
                Arrastra una imagen aquí
              </p>
              <p className="text-xs text-slate-500">
                o haz clic para seleccionar (JPG, PNG, WebP - Max 5MB)
              </p>
            </div>
          </div>
        </label>
      )}

      {/* URL Mode */}
      {mode === 'url' && (
        <input
          type="url"
          value={previewUrl}
          onChange={handleUrlChange}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7101] focus:border-transparent text-sm"
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Preview */}
      {preview && previewUrl && (
        <div className="relative">
          <div className="relative w-full h-40 bg-slate-100 rounded-lg overflow-hidden">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = '/img/bg-image.png';
              }}
            />
          </div>
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-800 text-xs">
            <CheckCircle className="h-3 w-3" />
            Imagen lista para guardar
          </div>
        </div>
      )}
    </div>
  );
}
