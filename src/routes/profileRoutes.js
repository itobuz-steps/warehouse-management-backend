import express from 'express';
import multer from 'multer';
import path from 'path';
import config from '../config/config.js';
import ProfileController from '../controllers/profileController.js';
import { validate } from '../validations/middlewares/validator.js';
import { updateProfileSchema } from '../validations/schema/profileSchema.js';

const router = express.Router();
const profileController = new ProfileController();

const storage = multer.diskStorage({
  destination: 'uploads/user',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.UPLOAD_FILE_SIZE },
});

router.delete('/', profileController.deleteUser);

router.get('/', profileController.getUserDetails);
router.get('/me', profileController.getCurrentUser);

router.patch(
  '/update-profile',
  upload.single('profile-img'),
  validate(updateProfileSchema),
  profileController.updateProfile
);

export default router;
