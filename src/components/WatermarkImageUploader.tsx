'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { addWatermarkToImage, isImageFile } from '@/utils/imageWatermark';

interface WatermarkImageUploaderProps {
  onImageSelected?: (file: File, preview: string) => void;
  onImageRemoved?: () => void;
  accept?: string;
  maxSize?: number; // بالبايت
  currentImage?: string;
  className?: string;
  showWatermarkNotice?: boolean;
}

export default function WatermarkImageUploader({
  onImageSelected,
  onImageRemoved,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  currentImage,
  className = '',
  showWatermarkNotice = true
}: WatermarkImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!isImageFile(file)) {
      setError('يرجى اختيار ملف صورة صحيح (JPG, PNG, GIF)');
      return;
    }

    // التحقق من حجم الملف
    if (file.size > maxSize) {
      setError(`حجم الصورة كبير جداً. الحد الأقصى ${(maxSize / 1024 / 1024).toFixed(1)} ميجابايت`);
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      // إضافة العلامة المائية
      const watermarkedFile = await addWatermarkToImage(file, {
        text: 'Q8 MAZAD SPORT',
        fontSize: Math.min(Math.max(file.size > 500000 ? 28 : 20, 16), 32),
        opacity: 0.8,
        position: 'bottom-right',
        color: 'rgba(255, 255, 255, 0.9)',
        enableBackground: true, // تفعيل الخلفية المائية
        backgroundOpacity: 0.05 // شفافية أقل للخلفية
      });

      // إنشاء معاينة
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        setPreview(previewUrl);
        onImageSelected?.(watermarkedFile, previewUrl);
      };
      reader.readAsDataURL(watermarkedFile);
    } catch (error) {
      console.error('فشل في إضافة العلامة المائية:', error);
      setError('حدث خطأ في معالجة الصورة');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setError(null);
    onImageRemoved?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const mockEvent = {
        target: { files }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(mockEvent);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {showWatermarkNotice && (
        <div className="text-xs text-blue-600 mb-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <ImageIcon className="w-4 h-4 ml-2" />
            <span className="font-medium">ملاحظة:</span>
          </div>
          <p className="mt-1">سيتم إضافة علامة &quot;Q8 MAZAD SPORT&quot; المائية وخلفية مائية متكررة تلقائياً على جميع الصور المرفوعة لحماية المحتوى بشكل كامل</p>
        </div>
      )}

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="معاينة الصورة"
              className="max-h-48 mx-auto rounded-lg shadow-md"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
              title="حذف الصورة"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="mt-3 text-sm text-gray-600">
              تم إضافة العلامة المائية والخلفية المائية ✓
            </div>
          </div>
        ) : (
          <div>
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                <p className="text-gray-600">جاري إضافة العلامة المائية...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">اسحب وأفلت الصورة هنا أو</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  اختر صورة
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG, GIF حتى {(maxSize / 1024 / 1024).toFixed(1)} ميجابايت
                </p>
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          aria-label="اختيار صورة"
          title="اختيار صورة للرفع"
        />
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}