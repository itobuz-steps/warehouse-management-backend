import ExcelJS from 'exceljs';

const generateTopFiveProductsExcelData = async (products) => {
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
    column.eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 0;
      if (columnLength > maxLength) maxLength = columnLength;
    });
    column.width = maxLength + 2;
  });

  // Return Excel buffer
  return await workbook.xlsx.writeBuffer();
};

const generateInventoryByCategoryExcel = async (categories) => {
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
    column.eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 0;
      if (columnLength > maxLength) maxLength = columnLength;
    });
    column.width = maxLength + 2;
  });

  // Return Excel buffer
  return await workbook.xlsx.writeBuffer();
};

const generateWeeklyTransactionExcel = async (transactions) => {
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
    column.eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 0;
      if (columnLength > maxLength) maxLength = columnLength;
    });
    column.width = maxLength + 2;
  });

  // Return Excel buffer
  return await workbook.xlsx.writeBuffer();
};

const generateTwoProductQuantityExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Two Product - Quantities');

  const dataArray = new Array(data.productA, data.productB);

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
    column.eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 0;
      if (columnLength > maxLength) maxLength = columnLength;
    });
    column.width = maxLength + 2;
  });

  // Return Excel buffer
  return await workbook.xlsx.writeBuffer();
};

export {
  generateTopFiveProductsExcelData,
  generateInventoryByCategoryExcel,
  generateWeeklyTransactionExcel,
  generateTwoProductQuantityExcel,
};
