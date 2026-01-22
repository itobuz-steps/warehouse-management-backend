import QRCode from 'qrcode';

const generateQrCode = async (data: string) => {
  const qr = await QRCode.toBuffer(data);
  return qr;
};

export default generateQrCode;
