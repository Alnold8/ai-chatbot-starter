import React, { useState, useRef } from "react";
import { FaTable, FaTimes, FaSpinner } from "react-icons/fa";

export default function SpreadsheetUploader({ onSpreadsheetSelect, isThinking }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [spreadsheetData, setSpreadsheetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const SUPPORTED_FORMATS = [".csv", ".xlsx", ".xls", ".ods"];
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileName = file.name.toLowerCase();
    const isValidFormat = SUPPORTED_FORMATS.some(fmt => fileName.endsWith(fmt));

    if (!isValidFormat) {
      setError(`Please select a valid spreadsheet format: ${SUPPORTED_FORMATS.join(", ")}`);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("Spreadsheet file exceeds 50MB limit");
      return;
    }

    setLoading(true);
    setError(null);
    await processSpreadsheet(file);
  };

  const processSpreadsheet = async (file) => {
    try {
      const fileName = file.name.toLowerCase();
      let processedData;

      if (fileName.endsWith(".csv")) {
        processedData = await processCSV(file);
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        processedData = await processExcel(file);
      } else if (fileName.endsWith(".ods")) {
        processedData = await processODS(file);
      }

      if (processedData.success) {
        setSelectedFile(file);
        setSpreadsheetData(processedData);
        setLoading(false);

        onSpreadsheetSelect({
          file,
          data: processedData,
          type: "spreadsheet"
        });
      } else {
        setError(processedData.error || "Failed to process spreadsheet");
        setLoading(false);
      }
    } catch (err) {
      setError(`Error processing spreadsheet: ${err.message}`);
      setLoading(false);
      console.error("Spreadsheet processing error:", err);
    }
  };

  const processCSV = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const csv = e.target.result;
          const rows = csv.split("\n").filter(row => row.trim());
          const lines = rows.map(row => row.split(","));
          
          const headers = lines[0];
          const dataRows = lines.slice(1);
          
          const summary = {
            fileName: file.name,
            fileSize: file.size,
            format: "CSV",
            rowCount: dataRows.length,
            columnCount: headers.length,
            columns: headers,
            preview: dataRows.slice(0, 5),
            fullContent: csv,
            uploadedAt: new Date().toLocaleString()
          };

          resolve({
            success: true,
            ...summary
          });
        } catch (err) {
          resolve({
            success: false,
            error: `CSV parsing error: ${err.message}`
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: "Error reading CSV file"
        });
      };

      reader.readAsText(file);
    });
  };

  const processExcel = async (file) => {
    // Excel processing requires xlsx library
    // For now, provide installation instructions
    return {
      success: true,
      fileName: file.name,
      fileSize: file.size,
      format: file.name.endsWith(".xlsx") ? "XLSX" : "XLS",
      requiresLibrary: true,
      note: "Excel file uploaded. For full analysis, install xlsx library: npm install xlsx",
      instruction: "After installation, restart the app and upload again for automatic data extraction",
      uploadedAt: new Date().toLocaleString()
    };
  };

  const processODS = async (file) => {
    // ODS processing requires specialized library
    return {
      success: true,
      fileName: file.name,
      fileSize: file.size,
      format: "ODS",
      requiresLibrary: true,
      note: "ODS file uploaded. For full analysis, install odsjs or similar library.",
      instruction: "ODS support requires additional library installation",
      uploadedAt: new Date().toLocaleString()
    };
  };

  const handleRemoveSpreadsheet = () => {
    setSelectedFile(null);
    setSpreadsheetData(null);
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
      {/* Spreadsheet input button */}
      <div className="flex items-center gap-2">
        <button
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-100 hover:bg-green-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => fileInputRef.current?.click()}
          disabled={isThinking || loading}
          title="Upload spreadsheet (CSV, XLSX, XLS, ODS)"
        >
          <FaTable className="text-lg text-green-600" />
          <span className="text-sm font-medium text-green-600">Sheet</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.ods"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <FaSpinner className="text-blue-600 animate-spin" />
          <p className="text-sm text-blue-700">Processing spreadsheet...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Spreadsheet preview and metadata */}
      {spreadsheetData && !loading && (
        <div className="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {/* Header with file info */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {spreadsheetData.fileName}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatFileSize(spreadsheetData.fileSize)} • {spreadsheetData.format}
              </p>
            </div>
            <button
              onClick={handleRemoveSpreadsheet}
              className="p-1 text-gray-500 hover:text-red-600 transition flex-shrink-0"
              title="Remove spreadsheet"
            >
              <FaTimes />
            </button>
          </div>

          {/* Stats */}
          {spreadsheetData.rowCount !== undefined && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white rounded p-2 border border-gray-200">
                <p className="text-gray-500">Rows</p>
                <p className="font-medium text-gray-800">{spreadsheetData.rowCount}</p>
              </div>
              <div className="bg-white rounded p-2 border border-gray-200">
                <p className="text-gray-500">Columns</p>
                <p className="font-medium text-gray-800">{spreadsheetData.columnCount}</p>
              </div>
            </div>
          )}

          {/* Column headers */}
          {spreadsheetData.columns && (
            <div className="bg-white rounded p-2 border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-2">Columns:</p>
              <div className="flex flex-wrap gap-1">
                {spreadsheetData.columns.slice(0, 8).map((col, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                  >
                    {col}
                  </span>
                ))}
                {spreadsheetData.columns.length > 8 && (
                  <span className="text-xs px-2 py-1 text-gray-500">
                    +{spreadsheetData.columns.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Data preview table */}
          {spreadsheetData.preview && spreadsheetData.preview.length > 0 && (
            <div className="bg-white rounded p-2 border border-gray-200 overflow-x-auto">
              <p className="text-xs font-medium text-gray-600 mb-2">Data Preview:</p>
              <table className="text-xs border-collapse w-full">
                <thead>
                  <tr>
                    {spreadsheetData.columns?.slice(0, 4).map((col, idx) => (
                      <th
                        key={idx}
                        className="border border-gray-300 px-2 py-1 bg-gray-100 font-medium text-gray-700 text-left"
                      >
                        {col}
                      </th>
                    ))}
                    {spreadsheetData.columns && spreadsheetData.columns.length > 4 && (
                      <th className="border border-gray-300 px-2 py-1 bg-gray-100 text-gray-500">
                        ...
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {spreadsheetData.preview.slice(0, 3).map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.slice(0, 4).map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="border border-gray-300 px-2 py-1 text-gray-700 truncate max-w-xs"
                        >
                          {cell}
                        </td>
                      ))}
                      {row.length > 4 && (
                        <td className="border border-gray-300 px-2 py-1 text-gray-500">...</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {spreadsheetData.preview.length > 3 && (
                <p className="text-xs text-gray-500 mt-2">
                  Showing 3 of {spreadsheetData.preview.length} rows
                </p>
              )}
            </div>
          )}

          {/* Library requirement note */}
          {spreadsheetData.requiresLibrary && (
            <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
              <p className="text-xs text-yellow-700 font-medium">Library Required</p>
              <p className="text-xs text-yellow-600 mt-1">{spreadsheetData.note}</p>
              {spreadsheetData.instruction && (
                <p className="text-xs text-yellow-600 mt-1">💡 {spreadsheetData.instruction}</p>
              )}
            </div>
          )}

          {/* Analysis ready note */}
          {!spreadsheetData.requiresLibrary && (
            <div className="p-2 bg-green-50 rounded border border-green-200">
              <p className="text-xs text-green-700">
                ✓ Spreadsheet loaded and ready for analysis. AI can analyze data, perform calculations, identify patterns, and generate insights.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
