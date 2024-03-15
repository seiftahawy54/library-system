import exceljs from 'exceljs';
import path from 'path';

/**
 * @description Creates an excel file
 * @param {string} filename
 * @param {Array<string>} headers
 * @param {Array<any>} data
*/

const createExcelFile = async (filename, headers, data) => {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  worksheet.addRows(
    [
      headers,
      ...data
    ]
  );

  const generatedFilename = `report-${Date.now()}-${filename}.xlsx`;
  const filePath = path.resolve('public', 'reports', generatedFilename);
  // Write file to system
  await workbook.xlsx.writeFile(filePath);
  return filePath;
};

export default createExcelFile;
