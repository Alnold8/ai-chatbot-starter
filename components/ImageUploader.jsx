import React, { useState, useRef } from "react";
import { FaImage, FaTimes, FaSpinner } from "react-icons/fa";

export default function ImageUploader({ onImageSelect, isThinking }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageMetadata, setImageMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const SUPPORTED_FORMATS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
  const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileName = file.name.toLowerCase();
    const isValidFormat = SUPPORTED_FORMATS.some(fmt => fileName.endsWith(fmt));
    const isValidMimeType = file.type.startsWith("image/");

    if (!isValidFormat && !isValidMimeType) {
      setError(`Please select a valid image format: ${SUPPORTED_FORMATS.join(", ")}`);
      return;
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image file exceeds 20MB limit");
      return;
    }

    setLoading(true);
    setError(null);
    await processImage(file);
  };

  const processImage = async (file) => {
    try {
      // Create preview
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const base64Data = e.target.result;
        
        // Get image dimensions and metadata
        const img = new Image();
        img.onload = async () => {
          const metadata = {
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            width: img.width,
            height: img.height,
            aspectRatio: (img.width / img.height).toFixed(2),
            uploadedAt: new Date().toLocaleString(),
            base64: base64Data
          };

          setImageMetadata(metadata);
          setImagePreview(base64Data);
          setSelectedImage(file);
          setLoading(false);

          // Call parent handler with image data
          onImageSelect({
            file,
            base64: base64Data,
            metadata,
            type: "image"
          });
        };

        img.onerror = () => {
          setError("Failed to load image. Please ensure it's a valid image file.");
          setLoading(false);
        };

        img.src = base64Data;
      };

      reader.onerror = () => {
        setError("Error reading image file");
        setLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(`Error processing image: ${err.message}`);
      setLoading(false);
      console.error("Image processing error:", err);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageMetadata(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Image input button */}
      <div className="flex items-center gap-2">
        <button
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-100 hover:bg-purple-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => fileInputRef.current?.click()}
          disabled={isThinking || loading}
          title="Upload image for vision analysis"
        >
          <FaImage className="text-lg text-purple-600" />
          <span className="text-sm font-medium text-purple-600">Image</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.bmp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <FaSpinner className="text-blue-600 animate-spin" />
          <p className="text-sm text-blue-700">Processing image...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Image preview and metadata */}
      {imagePreview && imageMetadata && !loading && (
        <div className="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {/* Image preview */}
          <div className="flex justify-center">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-48 max-w-full rounded border border-gray-300 shadow-sm"
            />
          </div>

          {/* Image metadata */}
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {imageMetadata.fileName}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(imageMetadata.fileSize)} • {imageMetadata.mimeType}
                </p>
              </div>
              <button
                onClick={handleRemoveImage}
                className="p-1 text-gray-500 hover:text-red-600 transition flex-shrink-0"
                title="Remove image"
              >
                <FaTimes />
              </button>
            </div>

            {/* Image dimensions and details */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white rounded p-2 border border-gray-200">
                <p className="text-gray-500">Resolution</p>
                <p className="font-medium text-gray-800">
                  {imageMetadata.width} × {imageMetadata.height}
                </p>
              </div>
              <div className="bg-white rounded p-2 border border-gray-200">
                <p className="text-gray-500">Aspect Ratio</p>
                <p className="font-medium text-gray-800">{imageMetadata.aspectRatio}</p>
              </div>
              <div className="bg-white rounded p-2 border border-gray-200">
                <p className="text-gray-500">Format</p>
                <p className="font-medium text-gray-800 uppercase">
                  {imageMetadata.mimeType.split('/')[1]}
                </p>
              </div>
            </div>

            {/* Vision capabilities note */}
            <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
              <p className="text-xs text-purple-700">
                ✓ Image ready for vision analysis. AI can describe, analyze, extract text (OCR), identify objects, and answer questions about this image.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
