import React, { useState, useRef } from "react";
import { FaFilePdf, FaTimes, FaUpload } from "react-icons/fa";

export default function PDFUploader({ onPDFSelect, isThinking }) {
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [pdfContent, setPdfContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setError("Please select a valid PDF file");
      return;
    }

    // Validate file size
    if (file.size > MAX_PDF_SIZE) {
      setError("PDF file exceeds 50MB limit");
      return;
    }

    setSelectedPDF(file);
    setError(null);
    setPdfContent(null);
    await extractPDFContent(file);
  };

  const extractPDFContent = async (file) => {
    setLoading(true);
    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);
      
      // Extract text using basic PDF parsing
      // For production, use pdfjs-dist: npm install pdfjs-dist
      const extractedText = await basicPDFExtraction(base64);
      
      const content = {
        fileName: file.name,
        fileSize: file.size,
        content: extractedText,
        base64: base64,
        uploadedAt: new Date().toLocaleString()
      };

      setPdfContent(content);
      onPDFSelect(content);
      setError(null);
    } catch (err) {
      setError(`Error reading PDF: ${err.message}`);
      console.error("PDF extraction error:", err);
    } finally {
      setLoading(false);
    }
  };

  const basicPDFExtraction = async (base64Data) => {
    // This is a basic implementation
    // For production, install and use pdfjs-dist:
    // npm install pdfjs-dist
    
    try {
      // Attempt to extract text from PDF
      // This basic version checks for text content in the PDF structure
      const binaryString = atob(base64Data.split(',')[1] || base64Data);
      const text = extractTextFromPDFBinary(binaryString);
      
      if (text.trim()) {
        return text;
      } else {
        return "[PDF loaded but text extraction requires pdfjs-dist library. Install with: npm install pdfjs-dist]";
      }
    } catch (error) {
      throw new Error("Could not parse PDF. Install pdfjs-dist for full support.");
    }
  };

  const extractTextFromPDFBinary = (binaryString) => {
    // Extract text streams from PDF binary
    const textMatches = binaryString.match(/BT[\s\S]*?ET/g) || [];
    let extractedText = "";
    
    textMatches.forEach(match => {
      const textContent = match.match(/\((.*?)\)/g) || [];
      textContent.forEach(text => {
        const cleaned = text.replace(/[()\\]/g, '');
        if (cleaned) extractedText += " " + cleaned;
      });
    });
    
    return extractedText || "[PDF loaded - limited text extraction without pdfjs-dist]";
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePDF = () => {
    setSelectedPDF(null);
    setPdfContent(null);
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
      {/* PDF input and upload button */}
      <div className="flex items-center gap-2">
        <button
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-100 hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => fileInputRef.current?.click()}
          disabled={isThinking || loading}
          title="Upload PDF file"
        >
          <FaFilePdf className="text-lg text-red-600" />
          <span className="text-sm font-medium text-red-600">PDF</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 animate-pulse">📄 Processing PDF...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* PDF preview */}
      {pdfContent && !loading && (
        <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaFilePdf className="text-xl text-red-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {pdfContent.fileName}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(pdfContent.fileSize)} • Uploaded at {pdfContent.uploadedAt}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemovePDF}
              className="p-1 text-gray-500 hover:text-red-600 transition"
              title="Remove PDF"
            >
              <FaTimes />
            </button>
          </div>

          {/* PDF content preview */}
          <div className="mt-2 p-2 bg-white rounded border border-gray-200 max-h-32 overflow-y-auto">
            <p className="text-xs text-gray-600 whitespace-pre-wrap">
              {pdfContent.content.substring(0, 300)}
              {pdfContent.content.length > 300 ? "..." : ""}
            </p>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            ✓ PDF loaded. You can now ask questions about this document.
          </p>
        </div>
      )}
    </div>
  );
}
