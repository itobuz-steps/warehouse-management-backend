import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import User from '../models/userModel.js';

export default async function tokenValidator(token) {
  try {
    const tokenData = jwt.verify(token, config.ACCESS_SECRET_KEY);
    const userId = tokenData.id;
    
    const isUser = await User.findOne({
      $and: [{ _id: userId }, { isDeleted: false }],
    });

    console.log('userdata : ', isUser);

    return isUser;
  } catch (error) {
    return error;
  }
}
