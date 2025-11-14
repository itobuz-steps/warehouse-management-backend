import { PDFDocument, PageSizes, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const generatePdf = async (transaction) => {
  // Create new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage(PageSizes.A4);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const height = page.getSize().height;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const imagePath = path.join(
    __dirname,
    '../assets/images/warehouse-logo-removebg-preview.png'
  );
  const imageBytes = await fs.readFile(imagePath);
  const pngImage = await pdfDoc.embedPng(imageBytes);
  const imgWidth = 120;
  const imgHeight = (pngImage.height / pngImage.width) * imgWidth;

  // Draw the image on the page
  page.drawImage(pngImage, {
    x: 100,
    y: 710,
    width: imgWidth,
    height: imgHeight,
  });

  page.drawImage(pngImage, {
    x: 150,
    y: 250,
    width: 300,
    height: 300,
    opacity: 0.2,
  });

  const {
    product,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    quantity,
    performedBy,
    createdAt,
    _id,
  } = transaction;

  const lineGap = 20;
  let cursorY = height - 80;

  // === HEADER ===
  page.drawText('STOCK OUT INVOICE', {
    x: 200,
    y: cursorY,
    size: 24,
    font: boldFont,
    color: rgb(0.725, 0.478, 0.529),
  });

  cursorY -= 40;
  page.drawText(`Transaction ID: `, {
    x: 50,
    y: cursorY,
    size: 12,
    font,
    color: rgb(0.725, 0.478, 0.529),
  });
  page.drawText(`${_id}`, {
    x: 140,
    y: cursorY,
    size: 12,
    font: boldFont,
  });

  cursorY -= lineGap;
  page.drawLine({
    start: { x: 50, y: cursorY },
    end: { x: 550, y: cursorY },
    thickness: 1,
    color: rgb(0.725, 0.478, 0.529),
  });

  cursorY -= lineGap * 2;
  page.drawText('CUSTOMER DETAILS', {
    x: 200,
    y: cursorY,
    size: 14,
    font: boldFont,
    color: rgb(0.725, 0.478, 0.529),
  });

  // Customer Name
  cursorY -= lineGap;
  page.drawText(`Name: `, { x: 60, y: cursorY, size: 12, font });
  page.drawText(`${customerName}`, {
    x: 100,
    y: cursorY,
    size: 12,
    font: boldFont,
    color: rgb(0.725, 0.478, 0.529),
  });

  // Customer Email
  cursorY -= lineGap;
  page.drawText(`Email: `, {
    x: 60,
    y: cursorY,
    size: 12,
    font,
  });
  page.drawText(`${customerEmail}`, {
    x: 100,
    y: cursorY,
    size: 12,
    font: boldFont,
    color: rgb(0.725, 0.478, 0.529),
  });

  // Customer Phone number
  cursorY -= lineGap;
  page.drawText(`Phone: `, {
    x: 60,
    y: cursorY,
    size: 12,
    font,
  });
  page.drawText(`${customerPhone}`, {
    x: 100,
    y: cursorY,
    size: 12,
    font: boldFont,
    color: rgb(0.725, 0.478, 0.529),
  });

  //Customer Address
  cursorY -= lineGap;
  page.drawText(`Address: `, {
    x: 60,
    y: cursorY,
    size: 12,
    font,
  });
  page.drawText(`${customerAddress}`, {
    x: 110,
    y: cursorY,
    size: 12,
    font: boldFont,
    color: rgb(0.725, 0.478, 0.529),
  });

  cursorY -= lineGap * 2;
  page.drawLine({
    start: { x: 50, y: cursorY },
    end: { x: 550, y: cursorY },
    thickness: 1,
    color: rgb(0.725, 0.478, 0.529),
  });

  // === PRODUCT DETAILS ===
  cursorY -= lineGap * 3;
  page.drawText('TRANSACTION DETAILS', {
    x: 200,
    y: cursorY,
    size: 14,
    font: boldFont,
    color: rgb(0.725, 0.478, 0.529),
  });

  const unitPrice = product.price;
  const totalPrice = unitPrice * quantity;

  // Product Name
  cursorY -= lineGap;
  page.drawText(`Product Name: `, {
    x: 80,
    y: cursorY,
    size: 12,
    font,
  });
  page.drawText(`${product.name}`, {
    x: 450,
    y: cursorY,
    size: 12,
    font: boldFont,
  });

  // Product Category
  cursorY -= lineGap;
  page.drawText(`Category: `, {
    x: 80,
    y: cursorY,
    size: 12,
    font,
  });
  page.drawText(`${product.category}`, {
    x: 450,
    y: cursorY,
    size: 12,
    font: boldFont,
  });

  // Product Unit Price
  cursorY -= lineGap;
  page.drawText(`Unit Price: `, {
    x: 80,
    y: cursorY,
    size: 12,
    font,
  });
  page.drawText(`$${unitPrice.toFixed(2)}`, {
    x: 450,
    y: cursorY,
    size: 12,
    font: boldFont,
  });

  // Total Quantity
  cursorY -= lineGap;
  page.drawText(`Quantity: `, { x: 80, y: cursorY, size: 12, font });
  page.drawText(`${quantity}`, {
    x: 450,
    y: cursorY,
    size: 12,
    font: boldFont,
  });

  cursorY -= lineGap;
  page.drawLine({
    start: { x: 50, y: cursorY },
    end: { x: 550, y: cursorY },
    thickness: 1,
  });

  // Total price
  cursorY -= lineGap;
  page.drawText(`Total Price: `, {
    x: 80,
    y: cursorY,
    size: 12,
    font: boldFont,
    color: rgb(0.725, 0.478, 0.529),
  });
  page.drawText(`$${totalPrice.toFixed(2)}`, {
    x: 450,
    y: cursorY,
    size: 12,
    font: boldFont,
    color: rgb(0.725, 0.478, 0.529),
  });

  cursorY -= lineGap * 2;

  const formattedDate = new Date(createdAt).toLocaleString();

  // Manager Name
  cursorY -= lineGap;
  page.drawText(`Performed By: `, {
    x: 60,
    y: cursorY,
    size: 12,
    font: boldFont,
  });
  page.drawText(`${performedBy?.name || 'N/A'}`, {
    x: 150,
    y: cursorY,
    size: 12,
    font,
    color: rgb(0.725, 0.478, 0.529),
  });

  // Manager Email
  cursorY -= lineGap;
  page.drawText(`Email: `, {
    x: 60,
    y: cursorY,
    size: 12,
    font: boldFont,
  });
  page.drawText(`${performedBy?.email || 'N/A'}`, {
    x: 110,
    y: cursorY,
    size: 12,
    font,
    color: rgb(0.725, 0.478, 0.529),
  });

  // Date of Transaction
  cursorY -= lineGap;
  page.drawText(`Date: `, {
    x: 60,
    y: cursorY,
    size: 12,
    font: boldFont,
  });
  page.drawText(`${formattedDate}`, {
    x: 110,
    y: cursorY,
    size: 12,
    font,
    color: rgb(0.725, 0.478, 0.529),
  });

  // === FOOTER ===
  cursorY -= lineGap * 3;
  page.drawLine({
    start: { x: 50, y: cursorY },
    end: { x: 550, y: cursorY },
    thickness: 1,
    color: rgb(0.725, 0.478, 0.529),
  });

  cursorY -= 20;
  page.drawText('Thank you for your business!', {
    x: 200,
    y: cursorY,
    size: 12,
    font,
    color: rgb(0.725, 0.478, 0.529),
  });

  // Return PDF bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};

export default generatePdf;
