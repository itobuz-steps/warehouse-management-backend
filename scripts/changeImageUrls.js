import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../src/models/productModel.js';

const CURRENT_IP = process.env.PUBLIC_IP; // e.g. "https://mydomain.com"
if (!CURRENT_IP) {
  console.error('PUBLIC_IP is not set');
  process.exit(1);
}

await mongoose.connect(process.env.DB_URI);

await Product.updateMany({}, [
  {
    $set: {
      productImage: {
        $map: {
          input: '$productImage',
          as: 'img',
          in: {
            $let: {
              vars: {
                idx: { $indexOfBytes: ['$$img', '/uploads/'] },
                len: { $strLenBytes: '$$img' },
              },
              in: {
                $cond: [
                  { $gte: ['$$idx', 0] },
                  {
                    $concat: [
                      CURRENT_IP,
                      {
                        $substrBytes: [
                          '$$img',
                          '$$idx',
                          { $subtract: ['$$len', '$$idx'] },
                        ],
                      },
                    ],
                  },
                  '$$img', // leave untouched if "/uploads/" not found
                ],
              },
            },
          },
        },
      },
    },
  },
]);

console.log('Done');
await mongoose.disconnect();
process.exit(0);
