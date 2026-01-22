import webpush from 'web-push';
import dotenv from 'dotenv';

dotenv.config();

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  throw new Error('VAPID keys missing in environment variables');
}

webpush.setVapidDetails(
  'mailto:naziya@itobuz.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export default webpush;
