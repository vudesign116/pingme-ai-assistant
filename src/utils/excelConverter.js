/**
 * Excel to JSON Converter Utility
 * Converts Excel files to structured JSON data for AI processing
 */

import * as XLSX from 'xlsx';

class ExcelConverter {
  /**
   * Convert Excel file to JSON structure
   * @param {File} file - Excel file object
   * @returns {Promise<Object>} - Structured JSON data
   */
  async convertExcelToJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          console.log(`📊 Converting Excel file: ${file.name}`);
          
          // Read the Excel file
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const result = {
            fileName: file.name,
            fileSize: file.size,
            fileType: 'excel',
            convertedAt: new Date().toISOString(),
            sheets: {},
            summary: {
              totalSheets: workbook.SheetNames.length,
              sheetNames: workbook.SheetNames,
              totalRows: 0,
              totalCells: 0
            }
          };
          
          // Process each sheet
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert to JSON with header row
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
              header: 1, // Use first row as header
              defval: '' // Default value for empty cells
            });
            
            if (jsonData.length > 0) {
              // Extract headers and data rows
              const headers = jsonData[0] || [];
              const dataRows = jsonData.slice(1);
              
              // Convert to structured format
              const structuredData = dataRows.map((row, index) => {
                const rowObject = { _rowIndex: index + 2 }; // +2 because we skip header and arrays are 0-indexed
                headers.forEach((header, colIndex) => {
                  const cleanHeader = String(header).trim() || `Column_${colIndex + 1}`;
                  rowObject[cleanHeader] = row[colIndex] !== undefined ? row[colIndex] : '';
                });
                return rowObject;
              });
              
              result.sheets[sheetName] = {
                headers: headers,
                rowCount: dataRows.length,
                columnCount: headers.length,
                data: structuredData,
                rawData: jsonData // Keep raw data for reference
              };
              
              result.summary.totalRows += dataRows.length;
              result.summary.totalCells += dataRows.length * headers.length;
            }
          });
          
          console.log(`✅ Excel converted successfully: ${result.summary.totalSheets} sheets, ${result.summary.totalRows} rows`);
          resolve(result);
          
        } catch (error) {
          console.error('❌ Excel conversion failed:', error);
          reject(new Error(`Failed to convert Excel file: ${error.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read Excel file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Create AI-friendly summary of Excel data
   * @param {Object} excelJSON - Converted Excel JSON
   * @returns {Object} - AI-friendly summary
   */
  createAISummary(excelJSON) {
    const summary = {
      type: 'excel_data',
      overview: {
        fileName: excelJSON.fileName,
        totalSheets: excelJSON.summary.totalSheets,
        totalRows: excelJSON.summary.totalRows,
        sheetNames: excelJSON.summary.sheetNames
      },
      dataPreview: {},
      insights: []
    };

    // Create preview for each sheet (first 5 rows)
    Object.keys(excelJSON.sheets).forEach(sheetName => {
      const sheet = excelJSON.sheets[sheetName];
      summary.dataPreview[sheetName] = {
        headers: sheet.headers,
        rowCount: sheet.rowCount,
        sampleData: sheet.data.slice(0, 5) // First 5 rows
      };
      
      // Basic insights
      if (sheet.rowCount > 0) {
        summary.insights.push(`Sheet "${sheetName}" contains ${sheet.rowCount} data rows with ${sheet.headers.length} columns`);
      }
    });

    return summary;
  }

  /**
   * Check if file is Excel format
   * @param {File} file - File to check
   * @returns {boolean} - True if Excel file
   */
  isExcelFile(file) {
    const excelTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12'
    ];
    
    const excelExtensions = ['.xls', '.xlsx', '.xlsm'];
    
    return excelTypes.includes(file.type) || 
           excelExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  }
}

export const excelConverter = new ExcelConverter();