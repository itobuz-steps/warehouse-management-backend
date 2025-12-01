import ExcelJS from 'exceljs';

const generateExcel = async (products) => {
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

export default generateExcel;
