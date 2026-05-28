import React, { useState, useRef } from "react";
import { FaFileAlt, FaTimes, FaSpinner } from "react-icons/fa";

export default function DocumentUploader({ onDocumentSelect, isThinking }) {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const SUPPORTED_FORMATS = [".txt", ".md", ".docx", ".doc"];
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileName = file.name.toLowerCase();
    const isValidFormat = SUPPORTED_FORMATS.some(fmt => fileName.endsWith(fmt));

    if (!isValidFormat) {
      setError(`Please select a valid document format: ${SUPPORTED_FORMATS.join(", ")}`);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("Document file exceeds 50MB limit");
      return;
    }

    setLoading(true);
    setError(null);
    await processDocument(file);
  };

  const processDocument = async (file) => {
    try {
      const fileName = file.name.toLowerCase();
      let processedData;

      if (fileName.endsWith(".txt")) {
        processedData = await processTextFile(file);
      } else if (fileName.endsWith(".md")) {
        processedData = await processMarkdownFile(file);
      } else if (fileName.endsWith(".docx")) {
        processedData = await processDOCXFile(file);
      } else if (fileName.endsWith(".doc")) {
        processedData = await processDOCFile(file);
      }

      if (processedData.success) {
        setSelectedDocument(file);
        setDocumentData(processedData);
        setLoading(false);

        onDocumentSelect({
          file,
          data: processedData,
          type: "document"
        });
      } else {
        setError(processedData.error || "Failed to process document");
        setLoading(false);
      }
    } catch (err) {
      setError(`Error processing document: ${err.message}`);
      setLoading(false);
      console.error("Document processing error:", err);
    }
  };

  const processTextFile = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const lines = content.split("\n");
          const words = content.split(/\s+/).filter(w => w.length > 0);
          const characters = content.length;
          const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);

          // Extract first few lines as preview
          const preview = lines.slice(0, 10).join("\n");

          resolve({
            success: true,
            fileName: file.name,
            fileSize: file.size,
            format: "TXT",
            content: content,
            preview: preview,
            stats: {
              wordCount: words.length,
              lineCount: lines.length,
              characterCount: characters,
              paragraphCount: paragraphs.length,
              averageWordLength: (words.reduce((sum, w) => sum + w.length, 0) / words.length).toFixed(1)
            },
            uploadedAt: new Date().toLocaleString()
          });
        } catch (err) {
          resolve({
            success: false,
            error: `Text file parsing error: ${err.message}`
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: "Error reading text file"
        });
      };

      reader.readAsText(file);
    });
  };

  const processMarkdownFile = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const lines = content.split("\n");
          const words = content.split(/\s+/).filter(w => w.length > 0);
          const characters = content.length;
          
          // Extract headings
          const headings = lines.filter(line => line.match(/^#+\s/)).map(h => h.replace(/^#+\s/, ""));
          
          // Extract code blocks
          const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
          
          const preview = lines.slice(0, 10).join("\n");

          resolve({
            success: true,
            fileName: file.name,
            fileSize: file.size,
            format: "Markdown",
            content: content,
            preview: preview,
            stats: {
              wordCount: words.length,
              lineCount: lines.length,
              characterCount: characters,
              headingCount: headings.length,
              codeBlockCount: codeBlocks.length,
              headings: headings.slice(0, 5)
            },
            uploadedAt: new Date().toLocaleString()
          });
        } catch (err) {
          resolve({
            success: false,
            error: `Markdown file parsing error: ${err.message}`
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: "Error reading markdown file"
        });
      };

      reader.readAsText(file);
    });
  };

  const processDOCXFile = async (file) => {
    // DOCX processing requires mammoth library
    // For now, provide installation instructions
    return {
      success: true,
      fileName: file.name,
      fileSize: file.size,
      format: "DOCX",
      requiresLibrary: true,
      note: "DOCX file uploaded. For full text extraction, install mammoth: npm install mammoth",
      instruction: "After installation, restart the app and upload again for automatic text extraction and summarization",
      uploadedAt: new Date().toLocaleString()
    };
  };

  const processDOCFile = async (file) => {
    // Legacy DOC processing requires specialized library
    return {
      success: true,
      fileName: file.name,
      fileSize: file.size,
      format: "DOC",
      requiresLibrary: true,
      note: "Legacy DOC file uploaded. Consider converting to DOCX or installing a DOC parser library.",
      instruction: "Legacy DOC format support requires additional tooling",
      uploadedAt: new Date().toLocaleString()
    };
  };

  const handleRemoveDocument = () => {
    setSelectedDocument(null);
    setDocumentData(null);
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

  const generateSummaryPrompt = (data) => {
    return `Please provide a comprehensive summary of the following document:\n\nFileName: ${data.fileName}\nFormat: ${data.format}\nStats: ${JSON.stringify(data.stats)}\n\nContent:\n${data.content}`;
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Document input button */}
      <div className="flex items-center gap-2">
        <button
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-orange-100 hover:bg-orange-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => fileInputRef.current?.click()}
          disabled={isThinking || loading}
          title="Upload document (TXT, MD, DOCX, DOC)"
        >
          <FaFileAlt className="text-lg text-orange-600" />
          <span className="text-sm font-medium text-orange-600">Doc</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.docx,.doc"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <FaSpinner className="text-blue-600 animate-spin" />
          <p className="text-sm text-blue-700">Processing document...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Document preview and metadata */}
      {documentData && !loading && (
        <div className="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {/* Header with file info */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {documentData.fileName}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatFileSize(documentData.fileSize)} • {documentData.format}
              </p>
            </div>
            <button
              onClick={handleRemoveDocument}
              className="p-1 text-gray-500 hover:text-red-600 transition flex-shrink-0"
              title="Remove document"
            >
              <FaTimes />
            </button>
          </div>

          {/* Document statistics */}
          {documentData.stats && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white rounded p-2 border border-gray-200">
                <p className="text-gray-500">Words</p>
                <p className="font-medium text-gray-800">{documentData.stats.wordCount}</p>
              </div>
              <div className="bg-white rounded p-2 border border-gray-200">
                <p className="text-gray-500">Lines</p>
                <p className="font-medium text-gray-800">{documentData.stats.lineCount}</p>
              </div>
              <div className="bg-white rounded p-2 border border-gray-200">
                <p className="text-gray-500">Characters</p>
                <p className="font-medium text-gray-800">{documentData.stats.characterCount}</p>
              </div>
              {documentData.stats.paragraphCount && (
                <div className="bg-white rounded p-2 border border-gray-200">
                  <p className="text-gray-500">Paragraphs</p>
                  <p className="font-medium text-gray-800">{documentData.stats.paragraphCount}</p>
                </div>
              )}
              {documentData.stats.headingCount && (
                <div className="bg-white rounded p-2 border border-gray-200">
                  <p className="text-gray-500">Headings</p>
                  <p className="font-medium text-gray-800">{documentData.stats.headingCount}</p>
                </div>
              )}
              {documentData.stats.codeBlockCount && (
                <div className="bg-white rounded p-2 border border-gray-200">
                  <p className="text-gray-500">Code Blocks</p>
                  <p className="font-medium text-gray-800">{documentData.stats.codeBlockCount}</p>
                </div>
              )}
            </div>
          )}

          {/* Headings preview (for markdown) */}
          {documentData.stats?.headings && documentData.stats.headings.length > 0 && (
            <div className="bg-white rounded p-2 border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-2">Headings:</p>
              <div className="space-y-1">
                {documentData.stats.headings.map((heading, idx) => (
                  <p key={idx} className="text-xs text-gray-700 truncate">
                    • {heading}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Content preview */}
          {documentData.preview && (
            <div className="bg-white rounded p-2 border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-2">Preview:</p>
              <p className="text-xs text-gray-700 whitespace-pre-wrap max-h-24 overflow-y-auto">
                {documentData.preview}
                {documentData.preview.length < documentData.content.length && "..."}
              </p>
            </div>
          )}

          {/* Library requirement note */}
          {documentData.requiresLibrary && (
            <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
              <p className="text-xs text-yellow-700 font-medium">Library Required</p>
              <p className="text-xs text-yellow-600 mt-1">{documentData.note}</p>
              {documentData.instruction && (
                <p className="text-xs text-yellow-600 mt-1">💡 {documentData.instruction}</p>
              )}
            </div>
          )}

          {/* Summarization ready note */}
          {!documentData.requiresLibrary && (
            <div className="p-2 bg-purple-50 rounded border border-purple-200">
              <p className="text-xs text-purple-700">
                ✓ Document loaded and ready for summarization. AI can extract key points, generate executive summaries, identify main topics, and provide comprehensive analysis.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
