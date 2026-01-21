import ExcelJS from 'exceljs';
import type {
  TwoProductQuantityResult,
  TwoProductHistoryResult,
} from '../types/analyticsTypes.js';

type TopProductExcelItem = {
  productId: string;
  productName: string;
  category: string;
  price: number;
  totalQuantity: number;
};

type InventoryCategoryExcelItem = {
  _id: string;
  totalProducts: number;
};

type WeeklyTransactionExcelItem = {
  _id: string; // date string
  IN: number;
  OUT: number;
};

type TwoProductTransactionExcelRow = {
  date: string;
  productATransactions: number;
  productBTransactions: number;
};

const generateTopFiveProductsExcel = async (
  products: TopProductExcelItem[]
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Top Products');

  // Define header
  const header = [
    'Product ID',
    'Product Name',
    'Category',
    'Price',
    'Total Quantity',
  ];

  // Add header row
  const headerRow = worksheet.addRow(header);

  // header styling
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 12 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDDEBF7' },
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Add rows
  products.forEach((p) => {
    const row = worksheet.addRow([
      p.productId,
      p.productName,
      p.category,
      p.price,
      p.totalQuantity,
    ]);

    // Align text center and add borders
    row.eachCell((cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // column formatting
  worksheet.columns.forEach((column) => {
    let maxLength = 12;
    (column as ExcelJS.Column).eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 0;
      if (columnLength > maxLength) maxLength = columnLength;
    });
    column.width = maxLength + 2;
  });

  // Return Excel buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

const generateInventoryByCategoryExcel = async (
  categories: InventoryCategoryExcelItem[] & { products: { price: number }[] }[]
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Category');

  // Define header
  const header = ['Category', 'Total Quantity'];

  // Add header row
  const headerRow = worksheet.addRow(header);

  // header styling
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 12 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDDEBF7' },
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Add rows
  categories.forEach((category) => {
    const row = worksheet.addRow([category._id, category.totalProducts]);

    // Align text center and add borders
    row.eachCell((cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // column formatting
  worksheet.columns.forEach((column) => {
    let maxLength = 12;
    (column as ExcelJS.Column).eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 0;
      if (columnLength > maxLength) maxLength = columnLength;
    });
    column.width = maxLength + 2;
  });

  // Return Excel buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

const generateWeeklyTransactionExcel = async (
  transactions: WeeklyTransactionExcelItem[]
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Weekly Transactions');

  // Define header
  const header = ['Date', 'Stock In', 'Stock Out'];

  // Add header row
  const headerRow = worksheet.addRow(header);

  // header styling
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 12 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDDEBF7' },
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Add rows
  transactions.forEach((transaction) => {
    const row = worksheet.addRow([
      transaction._id,
      transaction.IN,
      transaction.OUT,
    ]);

    // Align text center and add borders
    row.eachCell((cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // column formatting
  worksheet.columns.forEach((column) => {
    let maxLength = 12;
    (column as ExcelJS.Column).eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 0;
      if (columnLength > maxLength) maxLength = columnLength;
    });
    column.width = maxLength + 2;
  });

  // Return Excel buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

const generateTwoProductQuantityExcel = async (
  data: TwoProductQuantityResult
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Two Product - Quantities');

  const dataArray: Array<{
    id: string;
    name: string;
    quantity: number;
  }> = [data.productA, data.productB];

  // Define header
  const header = ['ID', 'Name', 'Quantity'];

  // Add header row
  const headerRow = worksheet.addRow(header);

  // header styling
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 12 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDDEBF7' },
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Add rows
  dataArray.forEach((item) => {
    const row = worksheet.addRow([item.id, item.name, item.quantity]);

    // Align text center and add borders
    row.eachCell((cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // column formatting
  worksheet.columns.forEach((column) => {
    let maxLength = 12;
    (column as ExcelJS.Column).eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 0;
      if (columnLength > maxLength) maxLength = columnLength;
    });
    column.width = maxLength + 2;
  });

  // Return Excel buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

const generateTwoProductTransactionExcel = async (
  data: TwoProductHistoryResult
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Two Product - Transactions');

  // Define header
  const header = ['Date', data.productA.name, data.productB.name];

  // Add header row
  const headerRow = worksheet.addRow(header);

  const dataA = data.productA.history.splice(-7);
  const dataB = data.productB.history.splice(-7);

  const dataArray: TwoProductTransactionExcelRow[] = [];

  for (let i = 0; i < dataA.length; i++) {
    dataArray.push({
      date: dataA[i].date,
      productATransactions: dataA[i].transactions,
      productBTransactions: dataB[i].transactions,
    });
  }

  console.log(dataArray);

  // header styling
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 12 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDDEBF7' },
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Add rows
  dataArray.forEach((item) => {
    const row = worksheet.addRow([
      item.date,
      item.productATransactions,
      item.productBTransactions,
    ]);

    // Align text center and add borders
    row.eachCell((cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // column formatting
  worksheet.columns.forEach((column) => {
    let maxLength = 12;
    (column as ExcelJS.Column).eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 0;
      if (columnLength > maxLength) maxLength = columnLength;
    });
    column.width = maxLength + 2;
  });

  // Return Excel buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

export {
  generateTopFiveProductsExcel,
  generateInventoryByCategoryExcel,
  generateWeeklyTransactionExcel,
  generateTwoProductQuantityExcel,
  generateTwoProductTransactionExcel,
};
