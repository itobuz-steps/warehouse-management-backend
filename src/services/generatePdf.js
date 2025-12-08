import { PDFDocument, PageSizes, rgb } from 'pdf-lib';
import fs from 'fs/promises';
import path, { dirname } from 'path';
import * as fontkit from 'fontkit';
import { fileURLToPath } from 'url';

const generatePdf = async (transaction) => {
  // Create new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage(PageSizes.A4);

  // Get the image file path
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const imagePath = path.join(
    __dirname,
    '../assets/images/warehouse-logo-removebg-preview.png'
  );

  // Get the image and set the height and width
  const imageBytes = await fs.readFile(imagePath);
  const pngImage = await pdfDoc.embedPng(imageBytes);
  const imgWidth = 120;
  const imgHeight = (pngImage.height / pngImage.width) * imgWidth;

  // Draw the image on the page
  drawImage(page, pngImage, 100, 710, imgWidth, imgHeight);

  // Draw background logo
  drawImage(page, pngImage, 150, 250, 300, 300, 0.2);

  pdfDoc.registerFontkit(fontkit);

  // ---- LOAD UNICODE FONTS ----
  const regularFontPath = path.join(
    __dirname,
    '../assets/fonts/NotoSans-Regular.ttf'
  );
  const boldFontPath = path.join(
    __dirname,
    '../assets/fonts/NotoSans-Bold.ttf'
  );

  const regularFontBytes = await fs.readFile(regularFontPath);
  const boldFontBytes = await fs.readFile(boldFontPath);

  const font = await pdfDoc.embedFont(regularFontBytes);
  const boldFont = await pdfDoc.embedFont(boldFontBytes);

  const height = page.getSize().height;

  const {
    product,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    quantity,
    performedBy,
    createdAt,
    sourceWarehouse,
    _id,
    shipment,
  } = transaction;

  // Set line gap and Y axis length
  const lineGap = 20;
  let cursorY = height - 80;

  // ---------------- HEADER ----------------
  writeText(
    page,
    'STOCK OUT INVOICE',
    200,
    cursorY,
    24,
    boldFont,
    rgb(0.725, 0.478, 0.529)
  );

  cursorY -= 40;
  writeText(
    page,
    `Transaction ID: `,
    50,
    cursorY,
    12,
    font,
    rgb(0.725, 0.478, 0.529)
  );
  writeText(page, `${_id}`, 140, cursorY, 12, boldFont);

  cursorY -= lineGap;
  writeLine(
    page,
    { x: 50, y: cursorY },
    { x: 550, y: cursorY },
    1,
    rgb(0.725, 0.478, 0.529)
  );

  cursorY -= lineGap * 2;
  writeText(
    page,
    'CUSTOMER DETAILS',
    230,
    cursorY,
    14,
    boldFont,
    rgb(0.725, 0.478, 0.529)
  );

  // Customer Name
  cursorY -= lineGap;
  writeText(page, `Name: `, 60, cursorY, 12, font);
  writeText(
    page,
    customerName,
    100,
    cursorY,
    12,
    boldFont,
    rgb(0.725, 0.478, 0.529)
  );

  // Customer Email
  cursorY -= lineGap;
  writeText(page, `Email: `, 60, cursorY, 12, font);
  writeText(
    page,
    customerEmail,
    100,
    cursorY,
    12,
    boldFont,
    rgb(0.725, 0.478, 0.529)
  );

  // Customer Phone number
  cursorY -= lineGap;
  writeText(page, `Phone: `, 60, cursorY, 12, font);
  writeText(
    page,
    `+91 ${customerPhone}`,
    105,
    cursorY,
    12,
    boldFont,
    rgb(0.725, 0.478, 0.529)
  );

  //Customer Address
  cursorY -= lineGap;
  writeText(page, `Address: `, 60, cursorY, 12, font);
  writeText(
    page,
    customerAddress,
    115,
    cursorY,
    12,
    boldFont,
    rgb(0.725, 0.478, 0.529)
  );

  cursorY -= lineGap * 2;
  writeLine(
    page,
    { x: 50, y: cursorY },
    { x: 550, y: cursorY },
    1,
    rgb(0.725, 0.478, 0.529)
  );

  // === PRODUCT DETAILS ===
  cursorY -= lineGap * 2;
  writeText(
    page,
    'TRANSACTION DETAILS',
    220,
    cursorY,
    14,
    boldFont,
    rgb(0.725, 0.478, 0.529)
  );

  const unitPrice = product.price;
  const totalPrice = unitPrice * quantity;

  // Product Name
  cursorY -= lineGap;
  writeText(page, `Product Name: `, 80, cursorY, 12, font);
  writeText(page, product.name, 450, cursorY, 12, boldFont);

  // Product Category
  cursorY -= lineGap;
  writeText(page, `Category: `, 80, cursorY, 12, font);
  writeText(page, product.category, 450, cursorY, 12, boldFont);

  // Product Unit Price
  cursorY -= lineGap;
  writeText(page, `Unit Price: `, 80, cursorY, 12, font);
  writeText(page, `₹${unitPrice.toFixed(2)}`, 450, cursorY, 12, boldFont);

  // Total Quantity
  cursorY -= lineGap;
  writeText(page, `Quantity: `, 80, cursorY, 12, font);
  writeText(page, `${quantity}`, 450, cursorY, 12, boldFont);

  cursorY -= lineGap;
  writeLine(page, { x: 50, y: cursorY }, { x: 550, y: cursorY }, 1);

  // Total price
  cursorY -= lineGap;
  writeText(
    page,
    `Total Price: `,
    80,
    cursorY,
    12,
    boldFont,
    rgb(0.725, 0.478, 0.529)
  );
  writeText(
    page,
    `₹${totalPrice.toFixed(2)}`,
    450,
    cursorY,
    12,
    boldFont,
    rgb(0.725, 0.478, 0.529)
  );

  cursorY -= lineGap * 2;

  const formattedDate = new Date(createdAt).toLocaleString();

  // Shipment Status
  cursorY -= lineGap;
  writeText(page, `Status: `, 60, cursorY, 12, boldFont);

  drawBadge(
    page,
    shipment || 'N/A',
    110,
    cursorY,
    boldFont,
    12,
    rgb(0.725, 0.478, 0.529),
    rgb(1, 1, 1)
  );

  // Product supplied from
  cursorY -= lineGap;
  writeText(page, `Supplied From: `, 60, cursorY, 12, boldFont);
  writeText(
    page,
    `${sourceWarehouse?.name || 'N/A'}`,
    160,
    cursorY,
    12,
    font,
    rgb(0.725, 0.478, 0.529)
  );
  // Product supplied from
  cursorY -= lineGap;
  writeText(page, `Address: `, 60, cursorY, 12, boldFont);
  writeText(
    page,
    `${sourceWarehouse?.address || 'N/A'}`,
    120,
    cursorY,
    12,
    font,
    rgb(0.725, 0.478, 0.529)
  );

  // Manager Name
  cursorY -= lineGap;
  writeText(page, `Performed By: `, 60, cursorY, 12, boldFont);
  writeText(
    page,
    `${performedBy?.name || 'N/A'}`,
    150,
    cursorY,
    12,
    font,
    rgb(0.725, 0.478, 0.529)
  );

  // Manager Email
  cursorY -= lineGap;
  writeText(page, `Email: `, 60, cursorY, 12, boldFont);
  writeText(
    page,
    `${performedBy?.email || 'N/A'}`,
    105,
    cursorY,
    12,
    font,
    rgb(0.725, 0.478, 0.529)
  );

  // Date of Transaction
  cursorY -= lineGap;
  writeText(page, `Date: `, 60, cursorY, 12, boldFont);
  writeText(
    page,
    `${formattedDate}`,
    104,
    cursorY,
    12,
    font,
    rgb(0.725, 0.478, 0.529)
  );

  // ------ FOOTER -------
  cursorY -= lineGap * 3;
  writeLine(
    page,
    { x: 50, y: cursorY },
    { x: 550, y: cursorY },
    1,
    rgb(0.725, 0.478, 0.529)
  );

  cursorY -= 20;
  writeText(
    page,
    'Thank you for your business!',
    210,
    cursorY,
    12,
    font,
    rgb(0.725, 0.478, 0.529)
  );

  // Return PDF bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};

function writeText(page, text, x, y, size, font, color = rgb(0, 0, 0)) {
  page.drawText(text, {
    x,
    y,
    size,
    font,
    color,
  });
}

function writeLine(page, start, end, thickness, color) {
  page.drawLine({
    start,
    end,
    thickness,
    color,
  });
}

function drawImage(page, image, x, y, width, height, opacity = 1) {
  page.drawImage(image, {
    x,
    y,
    width,
    height,
    opacity,
  });
}

function drawBadge(page, text, x, y, font, fontSize, bgColor, textColor) {
  const paddingX = 6;
  const paddingY = 3;
  const borderRadius = 10;

  const textWidth = font.widthOfTextAtSize(text, fontSize);
  const textHeight = fontSize;

  // Draw rounded rectangle
  page.drawRectangle({
    x: x - paddingX,
    y: y - paddingY,
    width: textWidth + paddingX * 2,
    height: textHeight + paddingY,
    color: bgColor,
    borderRadius,
  });

  // Draw text inside it
  page.drawText(text, {
    x,
    y,
    size: fontSize,
    font,
    color: textColor,
  });
}

export default generatePdf;
